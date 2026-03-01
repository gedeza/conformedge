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

    // ── 4. Assessment upcoming reminders + overdue notifications ──
    let assessmentsNotified = 0

    // 4a. Upcoming: scheduled within next 7 days, not completed
    const upcomingAssessments = await db.assessment.findMany({
      where: {
        scheduledDate: { gt: now, lte: in7Days },
        completedDate: null,
      },
      select: {
        id: true,
        title: true,
        scheduledDate: true,
        assessorId: true,
        organizationId: true,
      },
    })

    for (const assessment of upcomingAssessments) {
      if (!assessment.scheduledDate) continue

      const daysUntil = Math.ceil(
        (new Date(assessment.scheduledDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      // Only notify at 7 days and 1 day before
      if (daysUntil !== 7 && daysUntil !== 1) continue

      const existing = await db.notification.findFirst({
        where: {
          userId: assessment.assessorId,
          organizationId: assessment.organizationId,
          type: "ASSESSMENT_SCHEDULED",
          createdAt: { gte: addDays(now, -1) },
        },
      })
      if (existing) continue

      const reminderTitle = `Assessment in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`
      const reminderMsg = `"${assessment.title}" is scheduled for ${new Date(assessment.scheduledDate).toLocaleDateString()}.`

      const [inAppEnabled, emailEnabled] = await Promise.all([
        isNotificationEnabled(assessment.assessorId, "ASSESSMENT_SCHEDULED", "IN_APP"),
        isNotificationEnabled(assessment.assessorId, "ASSESSMENT_SCHEDULED", "EMAIL"),
      ])

      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title: reminderTitle,
            message: reminderMsg,
            type: "ASSESSMENT_SCHEDULED",
            userId: assessment.assessorId,
            organizationId: assessment.organizationId,
          },
        })
        created++
        assessmentsNotified++
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: assessment.assessorId,
          title: reminderTitle,
          message: reminderMsg,
          type: "ASSESSMENT_SCHEDULED",
        })
      }
    }

    // 4b. Overdue: scheduled in the past, not completed
    const overdueAssessments = await db.assessment.findMany({
      where: {
        scheduledDate: { lt: now },
        completedDate: null,
      },
      select: {
        id: true,
        title: true,
        scheduledDate: true,
        assessorId: true,
        organizationId: true,
      },
    })

    for (const assessment of overdueAssessments) {
      // Notify the assessor
      const assessorExisting = await db.notification.findFirst({
        where: {
          userId: assessment.assessorId,
          organizationId: assessment.organizationId,
          type: "ASSESSMENT_SCHEDULED",
          createdAt: { gte: addDays(now, -1) },
        },
      })

      if (!assessorExisting) {
        const overdueTitle = "Assessment overdue"
        const overdueMsg = `"${assessment.title}" was scheduled for ${assessment.scheduledDate ? new Date(assessment.scheduledDate).toLocaleDateString() : "a past date"} and has not been completed.`

        const [inAppEnabled, emailEnabled] = await Promise.all([
          isNotificationEnabled(assessment.assessorId, "ASSESSMENT_SCHEDULED", "IN_APP"),
          isNotificationEnabled(assessment.assessorId, "ASSESSMENT_SCHEDULED", "EMAIL"),
        ])

        if (inAppEnabled) {
          await db.notification.create({
            data: {
              title: overdueTitle,
              message: overdueMsg,
              type: "ASSESSMENT_SCHEDULED",
              userId: assessment.assessorId,
              organizationId: assessment.organizationId,
            },
          })
          created++
          assessmentsNotified++
        }

        if (emailEnabled) {
          sendNotificationEmail({
            userId: assessment.assessorId,
            title: overdueTitle,
            message: overdueMsg,
            type: "ASSESSMENT_SCHEDULED",
          })
        }
      }

      // Also notify org OWNER/ADMIN/MANAGER
      const orgManagers = await db.organizationUser.findMany({
        where: {
          organizationId: assessment.organizationId,
          isActive: true,
          role: { in: ["OWNER", "ADMIN", "MANAGER"] },
          userId: { not: assessment.assessorId }, // Don't double-notify assessor
        },
        select: { userId: true },
      })

      const mgrIds = orgManagers.map((m) => m.userId)
      const [inAppIds, emailIds] = await Promise.all([
        filterEnabledUsers(mgrIds, "ASSESSMENT_SCHEDULED", "IN_APP"),
        filterEnabledUsers(mgrIds, "ASSESSMENT_SCHEDULED", "EMAIL"),
      ])

      for (const userId of inAppIds) {
        const mgrExisting = await db.notification.findFirst({
          where: {
            userId,
            organizationId: assessment.organizationId,
            type: "ASSESSMENT_SCHEDULED",
            createdAt: { gte: addDays(now, -1) },
          },
        })
        if (mgrExisting) continue

        await db.notification.create({
          data: {
            title: "Assessment overdue",
            message: `"${assessment.title}" is overdue and has not been completed.`,
            type: "ASSESSMENT_SCHEDULED",
            userId,
            organizationId: assessment.organizationId,
          },
        })
        created++
        assessmentsNotified++
      }

      for (const userId of emailIds) {
        sendNotificationEmail({
          userId,
          title: "Assessment overdue",
          message: `"${assessment.title}" is overdue and has not been completed.`,
          type: "ASSESSMENT_SCHEDULED",
        })
      }
    }

    // ── 5. Recurring checklist generation ──────────────────
    let checklistsGenerated = 0

    const dueTemplates = await db.checklistTemplate.findMany({
      where: {
        isRecurring: true,
        isPaused: false,
        nextDueDate: { lte: now },
      },
      include: {
        standard: { select: { code: true } },
        organization: { select: { id: true } },
      },
    })

    for (const template of dueTemplates) {
      try {
        const templateItems = template.items as Array<{
          description: string
          clauseNumber?: string
          standardClauseId?: string
        }>

        const dateLabel = now.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
        const checklistTitle = `${template.standard.code} — ${template.name} (${dateLabel})`

        const { computeNextDueDate } = await import("@/lib/recurrence")
        const newNextDue = computeNextDueDate(
          template.nextDueDate!,
          template.recurrenceFrequency!,
          template.customIntervalDays
        )

        await db.$transaction(async (tx) => {
          const checklist = await tx.complianceChecklist.create({
            data: {
              title: checklistTitle,
              standardId: template.standardId,
              organizationId: template.organizationId,
              assignedToId: template.defaultAssigneeId,
              projectId: template.defaultProjectId,
              templateId: template.id,
            },
          })

          if (templateItems.length > 0) {
            await tx.checklistItem.createMany({
              data: templateItems.map((item, index) => ({
                description: item.description,
                sortOrder: index + 1,
                checklistId: checklist.id,
                standardClauseId: item.standardClauseId || null,
              })),
            })
          }

          await tx.checklistTemplate.update({
            where: { id: template.id },
            data: { nextDueDate: newNextDue, lastGeneratedAt: now },
          })

          await tx.auditTrailEvent.create({
            data: {
              action: "AUTO_GENERATE",
              entityType: "Checklist",
              entityId: checklist.id,
              metadata: {
                templateId: template.id,
                templateName: template.name,
                title: checklistTitle,
              },
              organizationId: template.organizationId,
            },
          })
        })

        checklistsGenerated++

        // Notify default assignee
        if (template.defaultAssigneeId) {
          const existing = await db.notification.findFirst({
            where: {
              userId: template.defaultAssigneeId,
              organizationId: template.organizationId,
              type: "CHECKLIST_DUE",
              createdAt: { gte: addDays(now, -1) },
            },
          })

          if (!existing) {
            const notifTitle = "Checklist due"
            const notifMsg = `"${checklistTitle}" has been auto-generated and is ready for completion.`

            const [inAppEnabled, emailEnabled] = await Promise.all([
              isNotificationEnabled(template.defaultAssigneeId, "CHECKLIST_DUE", "IN_APP"),
              isNotificationEnabled(template.defaultAssigneeId, "CHECKLIST_DUE", "EMAIL"),
            ])

            if (inAppEnabled) {
              await db.notification.create({
                data: {
                  title: notifTitle,
                  message: notifMsg,
                  type: "CHECKLIST_DUE",
                  userId: template.defaultAssigneeId,
                  organizationId: template.organizationId,
                },
              })
              created++
            }

            if (emailEnabled) {
              sendNotificationEmail({
                userId: template.defaultAssigneeId,
                title: notifTitle,
                message: notifMsg,
                type: "CHECKLIST_DUE",
              })
            }
          }
        }
      } catch (err) {
        captureError(err, { source: "cron.recurringChecklist", metadata: { templateId: template.id } })
      }
    }

    // ── 6. Auto-expire share links ──────────────────────
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
      assessmentsNotified,
      checklistsGenerated,
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
