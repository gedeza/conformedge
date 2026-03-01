import { NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { addDays, isBefore } from "date-fns"
import { db } from "@/lib/db"
import { sendNotificationEmail } from "@/lib/email"
import { isNotificationEnabled, filterEnabledUsers } from "@/lib/notification-preferences"
import { captureError } from "@/lib/error-tracking"

const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET /api/cron/check-expiries
 *
 * Scans all organizations for:
 * 1. Documents expiring within 30/14/7 days or already expired
 * 2. CAPAs past their due date (not closed)
 * 3. Subcontractor certifications expiring within 30 days or expired
 *
 * Creates notifications for relevant org members (respecting preferences).
 * Intended to be called by a cron scheduler (e.g. Vercel Cron, external).
 * Secured by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (skip in dev if not set)
  if (CRON_SECRET) {
    const auth = request.headers.get("authorization")
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const checkInId = Sentry.captureCheckIn({
    monitorSlug: "check-expiries",
    status: "in_progress",
  })

  const now = new Date()
  const in7Days = addDays(now, 7)
  const in14Days = addDays(now, 14)
  const in30Days = addDays(now, 30)
  let created = 0

  try {
    // ── 1. Document expiry notifications ──────────────────
    const expiringDocs = await db.document.findMany({
      where: {
        expiresAt: { lte: in30Days },
        status: { notIn: ["ARCHIVED"] },
      },
      select: {
        id: true,
        title: true,
        expiresAt: true,
        organizationId: true,
        uploadedById: true,
      },
    })

    for (const doc of expiringDocs) {
      if (!doc.expiresAt) continue

      const isExpired = isBefore(doc.expiresAt, now)
      const isWithin7 = !isExpired && isBefore(doc.expiresAt, in7Days)
      const isWithin14 = !isExpired && !isWithin7 && isBefore(doc.expiresAt, in14Days)

      let urgency: string
      if (isExpired) urgency = "has expired"
      else if (isWithin7) urgency = "expires within 7 days"
      else if (isWithin14) urgency = "expires within 14 days"
      else urgency = "expires within 30 days"

      // Only notify document uploader (avoid spamming entire org)
      const existing = await db.notification.findFirst({
        where: {
          userId: doc.uploadedById,
          organizationId: doc.organizationId,
          type: "DOCUMENT_EXPIRY",
          createdAt: { gte: addDays(now, -1) }, // Dedupe: 1 per day
        },
      })
      if (existing) continue

      const title = `Document ${urgency}`
      const message = `"${doc.title}" ${urgency}. Please review and update.`

      const [inAppEnabled, emailEnabled] = await Promise.all([
        isNotificationEnabled(doc.uploadedById, "DOCUMENT_EXPIRY", "IN_APP"),
        isNotificationEnabled(doc.uploadedById, "DOCUMENT_EXPIRY", "EMAIL"),
      ])

      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title,
            message,
            type: "DOCUMENT_EXPIRY",
            userId: doc.uploadedById,
            organizationId: doc.organizationId,
          },
        })
        created++
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: doc.uploadedById,
          title,
          message,
          type: "DOCUMENT_EXPIRY",
        })
      }
    }

    // ── 2. CAPA due date notifications + auto-escalation ──────
    const overdueCapas = await db.capa.findMany({
      where: {
        status: { notIn: ["CLOSED"] },
        dueDate: { lte: now },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        dueDate: true,
        organizationId: true,
        raisedById: true,
        assignedToId: true,
      },
    })

    const PRIORITY_ESCALATION: Record<string, string> = {
      LOW: "MEDIUM",
      MEDIUM: "HIGH",
      HIGH: "CRITICAL",
    }
    let escalated = 0

    for (const capa of overdueCapas) {
      const targetUserId = capa.assignedToId ?? capa.raisedById

      // Auto-escalate: bump priority if overdue > 7 days and not already CRITICAL
      if (capa.dueDate) {
        const daysOverdue = Math.floor((now.getTime() - new Date(capa.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        const newPriority = PRIORITY_ESCALATION[capa.priority]

        if (daysOverdue >= 7 && newPriority) {
          await db.capa.update({
            where: { id: capa.id },
            data: {
              priority: newPriority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
              status: "OVERDUE",
            },
          })

          // Notify org admins/managers about escalation
          const orgManagers = await db.organizationUser.findMany({
            where: {
              organizationId: capa.organizationId,
              isActive: true,
              role: { in: ["OWNER", "ADMIN", "MANAGER"] },
            },
            select: { userId: true },
          })

          const mgrIds = orgManagers.map((m) => m.userId)
          const [inAppIds, emailIds] = await Promise.all([
            filterEnabledUsers(mgrIds, "CAPA_DUE", "IN_APP"),
            filterEnabledUsers(mgrIds, "CAPA_DUE", "EMAIL"),
          ])

          const escalationTitle = "CAPA escalated"
          const escalationMsg = `"${capa.title}" auto-escalated from ${capa.priority} to ${newPriority} (${daysOverdue} days overdue).`

          for (const userId of inAppIds) {
            await db.notification.create({
              data: {
                title: escalationTitle,
                message: escalationMsg,
                type: "CAPA_DUE",
                userId,
                organizationId: capa.organizationId,
              },
            })
            created++
          }

          for (const userId of emailIds) {
            sendNotificationEmail({
              userId,
              title: escalationTitle,
              message: escalationMsg,
              type: "CAPA_DUE",
            })
          }

          escalated++
          continue // Skip duplicate overdue notification
        }

        // Set status to OVERDUE if not already
        if (capa.status !== "OVERDUE") {
          await db.capa.update({
            where: { id: capa.id },
            data: { status: "OVERDUE" },
          })
        }
      }

      const existing = await db.notification.findFirst({
        where: {
          userId: targetUserId,
          organizationId: capa.organizationId,
          type: "CAPA_DUE",
          createdAt: { gte: addDays(now, -1) },
        },
      })
      if (existing) continue

      const overdueTitle = "CAPA overdue"
      const overdueMsg = `"${capa.title}" is past its due date. Please take action.`

      const [inAppEnabled, emailEnabled] = await Promise.all([
        isNotificationEnabled(targetUserId, "CAPA_DUE", "IN_APP"),
        isNotificationEnabled(targetUserId, "CAPA_DUE", "EMAIL"),
      ])

      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title: overdueTitle,
            message: overdueMsg,
            type: "CAPA_DUE",
            userId: targetUserId,
            organizationId: capa.organizationId,
          },
        })
        created++
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: targetUserId,
          title: overdueTitle,
          message: overdueMsg,
          type: "CAPA_DUE",
        })
      }
    }

    // Also notify for CAPAs due within 7 days
    const soonCapas = await db.capa.findMany({
      where: {
        status: { notIn: ["CLOSED"] },
        dueDate: { gt: now, lte: in7Days },
      },
      select: {
        id: true,
        title: true,
        organizationId: true,
        raisedById: true,
        assignedToId: true,
      },
    })

    for (const capa of soonCapas) {
      const targetUserId = capa.assignedToId ?? capa.raisedById

      const existing = await db.notification.findFirst({
        where: {
          userId: targetUserId,
          organizationId: capa.organizationId,
          type: "CAPA_DUE",
          createdAt: { gte: addDays(now, -1) },
        },
      })
      if (existing) continue

      const soonTitle = "CAPA due soon"
      const soonMsg = `"${capa.title}" is due within 7 days.`

      const [inAppEnabled, emailEnabled] = await Promise.all([
        isNotificationEnabled(targetUserId, "CAPA_DUE", "IN_APP"),
        isNotificationEnabled(targetUserId, "CAPA_DUE", "EMAIL"),
      ])

      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title: soonTitle,
            message: soonMsg,
            type: "CAPA_DUE",
            userId: targetUserId,
            organizationId: capa.organizationId,
          },
        })
        created++
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: targetUserId,
          title: soonTitle,
          message: soonMsg,
          type: "CAPA_DUE",
        })
      }
    }

    // ── 3. Subcontractor certification expiry ──────────────
    const expiringCerts = await db.subcontractorCertification.findMany({
      where: {
        expiresAt: { lte: in30Days },
      },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        subcontractor: {
          select: {
            id: true,
            name: true,
            organizationId: true,
            organization: {
              select: {
                members: {
                  where: { isActive: true, role: { in: ["OWNER", "ADMIN", "MANAGER"] } },
                  select: { userId: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    for (const cert of expiringCerts) {
      if (!cert.expiresAt) continue
      const isExpired = isBefore(cert.expiresAt, now)
      const urgency = isExpired ? "has expired" : "expires within 30 days"

      const targetUser = cert.subcontractor.organization.members[0]
      if (!targetUser) continue

      const existing = await db.notification.findFirst({
        where: {
          userId: targetUser.userId,
          organizationId: cert.subcontractor.organizationId,
          type: "CERT_EXPIRY",
          createdAt: { gte: addDays(now, -1) },
        },
      })
      if (existing) continue

      const certTitle = `Certification ${urgency}`
      const certMsg = `${cert.subcontractor.name}'s "${cert.name}" certification ${urgency}.`

      const [inAppEnabled, emailEnabled] = await Promise.all([
        isNotificationEnabled(targetUser.userId, "CERT_EXPIRY", "IN_APP"),
        isNotificationEnabled(targetUser.userId, "CERT_EXPIRY", "EMAIL"),
      ])

      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title: certTitle,
            message: certMsg,
            type: "CERT_EXPIRY",
            userId: targetUser.userId,
            organizationId: cert.subcontractor.organizationId,
          },
        })
        created++
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: targetUser.userId,
          title: certTitle,
          message: certMsg,
          type: "CERT_EXPIRY",
        })
      }
    }

    // ── 4. Auto-expire share links ──────────────────────
    const expiredLinks = await db.shareLink.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
      data: { status: "EXPIRED" },
    })

    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: "check-expiries",
      status: "ok",
    })

    return NextResponse.json({
      success: true,
      notificationsCreated: created,
      capasEscalated: escalated,
      shareLinksExpired: expiredLinks.count,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: "check-expiries",
      status: "error",
    })
    captureError(error, { source: "cron.checkExpiries" })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
