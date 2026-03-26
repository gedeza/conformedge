import { NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { addDays, isBefore } from "date-fns"
import { db } from "@/lib/db"
import { sendNotificationEmail } from "@/lib/email"
import { isNotificationEnabled, filterEnabledUsers } from "@/lib/notification-preferences"
import { captureError } from "@/lib/error-tracking"
import { PLAN_DEFINITIONS, QUOTA_WARNING_THRESHOLD, VAT_RATE } from "@/lib/billing/plans"
import { snapshotResourceCounts } from "@/lib/billing/usage"
import type { PlanTier } from "@/types"

const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET /api/cron/check-expiries
 *
 * Scans all organizations for:
 * 1. Documents expiring within 30/14/7 days or already expired
 * 2. CAPAs past their due date (not closed)
 * 3. Vendor certifications expiring within 30 days or expired
 *
 * Creates notifications for relevant org members (respecting preferences).
 * Intended to be called by a cron scheduler (e.g. Vercel Cron, external).
 * Secured by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret — fail closed if not configured
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: "Server misconfiguration: CRON_SECRET is not set" },
      { status: 503 }
    )
  }
  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

      // Only notify document uploader — dedup per document per day
      const existing = await db.notification.findFirst({
        where: {
          userId: doc.uploadedById,
          organizationId: doc.organizationId,
          type: "DOCUMENT_EXPIRY",
          entityId: doc.id,
          createdAt: { gte: addDays(now, -1) },
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
            entityId: doc.id,
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
          entityId: capa.id,
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
            entityId: capa.id,
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
          entityId: capa.id,
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
            entityId: capa.id,
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

    // ── 3. Vendor certification expiry ──────────────
    const expiringCerts = await db.vendorCertification.findMany({
      where: {
        expiresAt: { lte: in30Days },
      },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        vendor: {
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

      const targetUser = cert.vendor.organization.members[0]
      if (!targetUser) continue

      const existing = await db.notification.findFirst({
        where: {
          userId: targetUser.userId,
          organizationId: cert.vendor.organizationId,
          type: "CERT_EXPIRY",
          createdAt: { gte: addDays(now, -1) },
        },
      })
      if (existing) continue

      const certTitle = `Certification ${urgency}`
      const certMsg = `${cert.vendor.name}'s "${cert.name}" certification ${urgency}.`

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
            organizationId: cert.vendor.organizationId,
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

    // ── 5. Overdue incident investigations ──────────────────
    let incidentsNotified = 0

    const overdueIncidents = await db.incident.findMany({
      where: {
        status: { in: ["REPORTED", "INVESTIGATING"] },
        investigationDue: { lt: now },
      },
      select: {
        id: true,
        title: true,
        investigationDue: true,
        investigatorId: true,
        reportedById: true,
        organizationId: true,
      },
    })

    for (const incident of overdueIncidents) {
      const targetUserId = incident.investigatorId ?? incident.reportedById

      const existing = await db.notification.findFirst({
        where: {
          userId: targetUserId,
          organizationId: incident.organizationId,
          type: "INVESTIGATION_OVERDUE",
          createdAt: { gte: addDays(now, -1) },
        },
      })
      if (existing) continue

      const incTitle = "Investigation overdue"
      const incMsg = `Investigation for incident "${incident.title}" is past its due date. Please take action.`

      const [inAppEnabled, emailEnabled] = await Promise.all([
        isNotificationEnabled(targetUserId, "INVESTIGATION_OVERDUE", "IN_APP"),
        isNotificationEnabled(targetUserId, "INVESTIGATION_OVERDUE", "EMAIL"),
      ])

      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title: incTitle,
            message: incMsg,
            type: "INVESTIGATION_OVERDUE",
            userId: targetUserId,
            organizationId: incident.organizationId,
          },
        })
        created++
        incidentsNotified++
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: targetUserId,
          title: incTitle,
          message: incMsg,
          type: "INVESTIGATION_OVERDUE",
        })
      }
    }

    // ── 6. Objective due / measurement overdue notifications ──
    let objectivesNotified = 0

    // 6a. Objectives due within 7 days
    const soonObjectives = await db.objective.findMany({
      where: {
        status: { notIn: ["DRAFT", "CANCELLED"] },
        dueDate: { gt: now, lte: in7Days },
      },
      select: {
        id: true,
        title: true,
        ownerId: true,
        organizationId: true,
      },
    })

    for (const obj of soonObjectives) {
      const existing = await db.notification.findFirst({
        where: {
          userId: obj.ownerId,
          organizationId: obj.organizationId,
          type: "OBJECTIVE_DUE",
          createdAt: { gte: addDays(now, -1) },
        },
      })
      if (existing) continue

      const objTitle = "Objective due soon"
      const objMsg = `"${obj.title}" is due within 7 days. Review your progress.`

      const [inAppEnabled, emailEnabled] = await Promise.all([
        isNotificationEnabled(obj.ownerId, "OBJECTIVE_DUE", "IN_APP"),
        isNotificationEnabled(obj.ownerId, "OBJECTIVE_DUE", "EMAIL"),
      ])

      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title: objTitle,
            message: objMsg,
            type: "OBJECTIVE_DUE",
            userId: obj.ownerId,
            organizationId: obj.organizationId,
          },
        })
        created++
        objectivesNotified++
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: obj.ownerId,
          title: objTitle,
          message: objMsg,
          type: "OBJECTIVE_DUE",
        })
      }
    }

    // 6b. Overdue objectives (past due date, not achieved/cancelled)
    const overdueObjectives = await db.objective.findMany({
      where: {
        status: { notIn: ["DRAFT", "CANCELLED"] },
        dueDate: { lt: now },
      },
      select: {
        id: true,
        title: true,
        ownerId: true,
        organizationId: true,
        currentValue: true,
        targetValue: true,
      },
    })

    for (const obj of overdueObjectives) {
      if (obj.currentValue >= obj.targetValue) continue

      const existing = await db.notification.findFirst({
        where: {
          userId: obj.ownerId,
          organizationId: obj.organizationId,
          type: "OBJECTIVE_DUE",
          createdAt: { gte: addDays(now, -1) },
        },
      })
      if (existing) continue

      const objTitle = "Objective overdue"
      const objMsg = `"${obj.title}" is past its due date and has not been achieved.`

      const [inAppEnabled, emailEnabled] = await Promise.all([
        isNotificationEnabled(obj.ownerId, "OBJECTIVE_DUE", "IN_APP"),
        isNotificationEnabled(obj.ownerId, "OBJECTIVE_DUE", "EMAIL"),
      ])

      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title: objTitle,
            message: objMsg,
            type: "OBJECTIVE_DUE",
            userId: obj.ownerId,
            organizationId: obj.organizationId,
          },
        })
        created++
        objectivesNotified++
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: obj.ownerId,
          title: objTitle,
          message: objMsg,
          type: "OBJECTIVE_DUE",
        })
      }
    }

    // ── 7. Recurring checklist generation ──────────────────
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

    // ── 8. Auto-expire share links ──────────────────────
    const expiredLinks = await db.shareLink.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
      data: { status: "EXPIRED" },
    })

    // ── 9. Statutory reporting deadline notifications ──────
    let statutoryNotified = 0

    const in48Hours = addDays(now, 2)

    const reportableIncidents = await db.incident.findMany({
      where: {
        isReportable: true,
        statutoryReportedAt: null,
        reportingDeadline: { lte: in48Hours },
      },
      select: {
        id: true,
        title: true,
        reportingDeadline: true,
        investigatorId: true,
        reportedById: true,
        organizationId: true,
      },
    })

    for (const incident of reportableIncidents) {
      const targetUserId = incident.investigatorId ?? incident.reportedById
      const isOverdue = incident.reportingDeadline ? isBefore(incident.reportingDeadline, now) : false
      const deadlineLabel = incident.reportingDeadline
        ? new Date(incident.reportingDeadline).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
        : "unknown"

      // Dedup: check if STATUTORY_DEADLINE was sent in the last 24 hours for this incident
      const existing = await db.notification.findFirst({
        where: {
          userId: targetUserId,
          organizationId: incident.organizationId,
          type: "STATUTORY_DEADLINE",
          entityId: incident.id,
          createdAt: { gte: addDays(now, -1) },
        },
      })
      if (existing) continue

      const statTitle = "Statutory reporting deadline"
      const statMsg = isOverdue
        ? `OVERDUE: Statutory reporting deadline for "${incident.title}" was ${deadlineLabel}. Report to the regulator immediately.`
        : `Statutory reporting deadline for "${incident.title}" is ${deadlineLabel}. Ensure the report is submitted on time.`

      // Notify the investigator (or reporter)
      const [inAppEnabled, emailEnabled] = await Promise.all([
        isNotificationEnabled(targetUserId, "STATUTORY_DEADLINE", "IN_APP"),
        isNotificationEnabled(targetUserId, "STATUTORY_DEADLINE", "EMAIL"),
      ])

      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title: statTitle,
            message: statMsg,
            type: "STATUTORY_DEADLINE",
            entityId: incident.id,
            userId: targetUserId,
            organizationId: incident.organizationId,
          },
        })
        created++
        statutoryNotified++
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: targetUserId,
          title: statTitle,
          message: statMsg,
          type: "STATUTORY_DEADLINE",
        })
      }

      // Also notify ADMIN/MANAGER users in the org
      const orgManagers = await db.organizationUser.findMany({
        where: {
          organizationId: incident.organizationId,
          isActive: true,
          role: { in: ["OWNER", "ADMIN", "MANAGER"] },
          userId: { not: targetUserId },
        },
        select: { userId: true },
      })

      const mgrIds = orgManagers.map((m) => m.userId)
      const [inAppIds, emailIds] = await Promise.all([
        filterEnabledUsers(mgrIds, "STATUTORY_DEADLINE", "IN_APP"),
        filterEnabledUsers(mgrIds, "STATUTORY_DEADLINE", "EMAIL"),
      ])

      for (const userId of inAppIds) {
        const mgrExisting = await db.notification.findFirst({
          where: {
            userId,
            organizationId: incident.organizationId,
            type: "STATUTORY_DEADLINE",
            entityId: incident.id,
            createdAt: { gte: addDays(now, -1) },
          },
        })
        if (mgrExisting) continue

        await db.notification.create({
          data: {
            title: statTitle,
            message: statMsg,
            type: "STATUTORY_DEADLINE",
            entityId: incident.id,
            userId,
            organizationId: incident.organizationId,
          },
        })
        created++
        statutoryNotified++
      }

      for (const userId of emailIds) {
        sendNotificationEmail({
          userId,
          title: statTitle,
          message: statMsg,
          type: "STATUTORY_DEADLINE",
        })
      }
    }

    // ── 10. Billing lifecycle ──────────────────────────
    let trialsExpired = 0
    let gracePeriodsCancelled = 0
    let periodsReset = 0
    let billingNotifications = 0

    try {
      // 10a. Expire trials: TRIALING → CANCELLED when trialEndsAt < now
      const expiredTrials = await db.subscription.findMany({
        where: {
          status: "TRIALING",
          trialEndsAt: { lt: now },
        },
        select: { id: true, organizationId: true },
      })

      for (const sub of expiredTrials) {
        await db.subscription.update({
          where: { id: sub.id },
          data: { status: "CANCELLED" },
        })
        trialsExpired++

        // Notify org owners/admins
        const orgManagers = await db.organizationUser.findMany({
          where: {
            organizationId: sub.organizationId,
            isActive: true,
            role: { in: ["OWNER", "ADMIN"] },
          },
          select: { userId: true },
        })

        const mgrIds = orgManagers.map((m) => m.userId)
        const [inAppIds, emailIds] = await Promise.all([
          filterEnabledUsers(mgrIds, "SUBSCRIPTION_CANCELLED", "IN_APP"),
          filterEnabledUsers(mgrIds, "SUBSCRIPTION_CANCELLED", "EMAIL"),
        ])

        const trialExpiredTitle = "Trial expired"
        const trialExpiredMsg = "Your free trial has expired. Subscribe to a plan to continue using ConformEdge."

        for (const userId of inAppIds) {
          await db.notification.create({
            data: {
              title: trialExpiredTitle,
              message: trialExpiredMsg,
              type: "SUBSCRIPTION_CANCELLED",
              userId,
              organizationId: sub.organizationId,
            },
          })
          created++
          billingNotifications++
        }

        for (const userId of emailIds) {
          sendNotificationEmail({
            userId,
            title: trialExpiredTitle,
            message: trialExpiredMsg,
            type: "SUBSCRIPTION_CANCELLED",
          })
        }
      }

      // 10b. Expire grace periods: PAST_DUE → CANCELLED when gracePeriodEndsAt < now
      const expiredGrace = await db.subscription.findMany({
        where: {
          status: "PAST_DUE",
          gracePeriodEndsAt: { lt: now },
        },
        select: { id: true, organizationId: true },
      })

      for (const sub of expiredGrace) {
        await db.subscription.update({
          where: { id: sub.id },
          data: { status: "CANCELLED" },
        })
        gracePeriodsCancelled++

        const orgManagers = await db.organizationUser.findMany({
          where: {
            organizationId: sub.organizationId,
            isActive: true,
            role: { in: ["OWNER", "ADMIN"] },
          },
          select: { userId: true },
        })

        const mgrIds = orgManagers.map((m) => m.userId)
        const [inAppIds, emailIds] = await Promise.all([
          filterEnabledUsers(mgrIds, "SUBSCRIPTION_CANCELLED", "IN_APP"),
          filterEnabledUsers(mgrIds, "SUBSCRIPTION_CANCELLED", "EMAIL"),
        ])

        const cancelTitle = "Subscription cancelled"
        const cancelMsg = "Your subscription has been cancelled due to failed payment. Subscribe again to regain access."

        for (const userId of inAppIds) {
          await db.notification.create({
            data: {
              title: cancelTitle,
              message: cancelMsg,
              type: "SUBSCRIPTION_CANCELLED",
              userId,
              organizationId: sub.organizationId,
            },
          })
          created++
          billingNotifications++
        }

        for (const userId of emailIds) {
          sendNotificationEmail({
            userId,
            title: cancelTitle,
            message: cancelMsg,
            type: "SUBSCRIPTION_CANCELLED",
          })
        }
      }

      // 10c. Period reset: create new UsageRecord when currentPeriodEnd < now
      const expiredPeriods = await db.subscription.findMany({
        where: {
          status: { in: ["ACTIVE"] },
          currentPeriodEnd: { lt: now },
        },
        select: {
          id: true,
          organizationId: true,
          billingCycle: true,
          currentPeriodEnd: true,
        },
      })

      for (const sub of expiredPeriods) {
        const newPeriodStart = sub.currentPeriodEnd
        const newPeriodEnd = sub.billingCycle === "ANNUAL"
          ? addDays(newPeriodStart, 365)
          : addDays(newPeriodStart, 30)

        await db.subscription.update({
          where: { id: sub.id },
          data: {
            currentPeriodStart: newPeriodStart,
            currentPeriodEnd: newPeriodEnd,
          },
        })

        // Create fresh usage record with resource snapshot
        await snapshotResourceCounts(sub.organizationId, newPeriodStart, newPeriodEnd)
        periodsReset++
      }

      // 10d. Trial ending notifications: 3 days before trialEndsAt
      const in3Days = addDays(now, 3)
      const trialEndingSoon = await db.subscription.findMany({
        where: {
          status: "TRIALING",
          trialEndsAt: { gt: now, lte: in3Days },
        },
        select: { organizationId: true, trialEndsAt: true },
      })

      for (const sub of trialEndingSoon) {
        const daysLeft = Math.ceil(
          (new Date(sub.trialEndsAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        const orgManagers = await db.organizationUser.findMany({
          where: {
            organizationId: sub.organizationId,
            isActive: true,
            role: { in: ["OWNER", "ADMIN"] },
          },
          select: { userId: true },
        })

        const mgrIds = orgManagers.map((m) => m.userId)
        const [inAppIds, emailIds] = await Promise.all([
          filterEnabledUsers(mgrIds, "SUBSCRIPTION_TRIAL_ENDING", "IN_APP"),
          filterEnabledUsers(mgrIds, "SUBSCRIPTION_TRIAL_ENDING", "EMAIL"),
        ])

        const trialTitle = `Trial ends in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`
        const trialMsg = `Your free trial expires ${daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}. Subscribe to a plan to keep your data and features.`

        for (const userId of inAppIds) {
          const existing = await db.notification.findFirst({
            where: {
              userId,
              organizationId: sub.organizationId,
              type: "SUBSCRIPTION_TRIAL_ENDING",
              createdAt: { gte: addDays(now, -1) },
            },
          })
          if (existing) continue

          await db.notification.create({
            data: {
              title: trialTitle,
              message: trialMsg,
              type: "SUBSCRIPTION_TRIAL_ENDING",
              userId,
              organizationId: sub.organizationId,
            },
          })
          created++
          billingNotifications++
        }

        for (const userId of emailIds) {
          sendNotificationEmail({
            userId,
            title: trialTitle,
            message: trialMsg,
            type: "SUBSCRIPTION_TRIAL_ENDING",
          })
        }
      }

      // 10e. Quota warning notifications: at 80% AI usage
      const activeSubscriptions = await db.subscription.findMany({
        where: {
          status: { in: ["TRIALING", "ACTIVE"] },
        },
        select: {
          plan: true,
          organizationId: true,
          currentPeriodStart: true,
        },
      })

      for (const sub of activeSubscriptions) {
        const plan = PLAN_DEFINITIONS[sub.plan as PlanTier]
        if (plan.limits.aiClassificationsPerMonth === null) continue // Unlimited

        const usageRecord = await db.usageRecord.findUnique({
          where: {
            organizationId_periodStart: {
              organizationId: sub.organizationId,
              periodStart: sub.currentPeriodStart,
            },
          },
          select: { aiClassificationsUsed: true },
        })

        if (!usageRecord) continue

        const ratio = usageRecord.aiClassificationsUsed / plan.limits.aiClassificationsPerMonth
        if (ratio < QUOTA_WARNING_THRESHOLD) continue

        const orgManagers = await db.organizationUser.findMany({
          where: {
            organizationId: sub.organizationId,
            isActive: true,
            role: { in: ["OWNER", "ADMIN", "MANAGER"] },
          },
          select: { userId: true },
        })

        const mgrIds = orgManagers.map((m) => m.userId)
        const [inAppIds, emailIds] = await Promise.all([
          filterEnabledUsers(mgrIds, "QUOTA_WARNING", "IN_APP"),
          filterEnabledUsers(mgrIds, "QUOTA_WARNING", "EMAIL"),
        ])

        const pct = Math.round(ratio * 100)
        const isExhausted = ratio >= 1
        const quotaTitle = isExhausted ? "AI quota exhausted" : `AI quota at ${pct}%`
        const quotaMsg = isExhausted
          ? `You've used all ${plan.limits.aiClassificationsPerMonth} AI classifications this month. Purchase credit packs to continue.`
          : `You've used ${usageRecord.aiClassificationsUsed} of ${plan.limits.aiClassificationsPerMonth} AI classifications (${pct}%). Consider upgrading or purchasing credits.`

        for (const userId of inAppIds) {
          const existing = await db.notification.findFirst({
            where: {
              userId,
              organizationId: sub.organizationId,
              type: isExhausted ? "QUOTA_LIMIT_REACHED" : "QUOTA_WARNING",
              createdAt: { gte: addDays(now, -1) },
            },
          })
          if (existing) continue

          await db.notification.create({
            data: {
              title: quotaTitle,
              message: quotaMsg,
              type: isExhausted ? "QUOTA_LIMIT_REACHED" : "QUOTA_WARNING",
              userId,
              organizationId: sub.organizationId,
            },
          })
          created++
          billingNotifications++
        }

        for (const userId of emailIds) {
          sendNotificationEmail({
            userId,
            title: quotaTitle,
            message: quotaMsg,
            type: isExhausted ? "QUOTA_LIMIT_REACHED" : "QUOTA_WARNING",
          })
        }
      }
      // 10f. Dunning reminders: PAST_DUE subs with grace period ending in 3 or 1 days
      const pastDueSubs = await db.subscription.findMany({
        where: {
          status: "PAST_DUE",
          gracePeriodEndsAt: { gt: now },
        },
        select: { organizationId: true, gracePeriodEndsAt: true },
      })

      for (const sub of pastDueSubs) {
        if (!sub.gracePeriodEndsAt) continue

        const daysLeft = Math.ceil(
          (new Date(sub.gracePeriodEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Only send reminders at 3 days and 1 day before cancellation
        if (daysLeft !== 3 && daysLeft !== 1) continue

        const orgManagers = await db.organizationUser.findMany({
          where: {
            organizationId: sub.organizationId,
            isActive: true,
            role: { in: ["OWNER", "ADMIN"] },
          },
          select: { userId: true },
        })

        const mgrIds = orgManagers.map((m) => m.userId)
        const [inAppIds, emailIds] = await Promise.all([
          filterEnabledUsers(mgrIds, "SUBSCRIPTION_PAYMENT_FAILED", "IN_APP"),
          filterEnabledUsers(mgrIds, "SUBSCRIPTION_PAYMENT_FAILED", "EMAIL"),
        ])

        const dunningTitle = daysLeft === 1
          ? "Final reminder: payment required"
          : "Payment reminder: action needed"
        const dunningMsg = `Your payment failed. You have ${daysLeft} day${daysLeft > 1 ? "s" : ""} to update your payment method before your subscription is cancelled.`

        for (const userId of inAppIds) {
          // Dedupe: only 1 notification per user per day for this type
          const existing = await db.notification.findFirst({
            where: {
              userId,
              organizationId: sub.organizationId,
              type: "SUBSCRIPTION_PAYMENT_FAILED",
              createdAt: { gte: addDays(now, -1) },
            },
          })
          if (existing) continue

          await db.notification.create({
            data: {
              title: dunningTitle,
              message: dunningMsg,
              type: "SUBSCRIPTION_PAYMENT_FAILED",
              userId,
              organizationId: sub.organizationId,
            },
          })
          created++
          billingNotifications++
        }

        for (const userId of emailIds) {
          sendNotificationEmail({
            userId,
            title: dunningTitle,
            message: dunningMsg,
            type: "SUBSCRIPTION_PAYMENT_FAILED",
          })
        }
      }
    } catch (err) {
      captureError(err, { source: "cron.billingLifecycle" })
    }

    // ── 11. Auto-generate invoices for EFT and INVOICE-method subscriptions ──
    let invoicesGenerated = 0
    let overdueInvoices = 0
    let prepaidDeductions = 0

    try {
      const in3DaysBilling = addDays(now, 3)

      // 11a. Generate invoices for EFT/INVOICE-method subs approaching period end
      const invoiceSubs = await db.subscription.findMany({
        where: {
          status: "ACTIVE",
          paymentMethod: { in: ["EFT", "INVOICE"] },
          currentPeriodEnd: { lte: in3DaysBilling },
        },
        select: {
          id: true,
          plan: true,
          billingCycle: true,
          paymentTermsDays: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          organizationId: true,
        },
      })

      for (const sub of invoiceSubs) {
        // Check if invoice already exists for this period
        const existingInvoice = await db.invoice.findFirst({
          where: {
            organizationId: sub.organizationId,
            periodStart: sub.currentPeriodStart,
            status: { in: ["OPEN", "PAID", "DRAFT"] },
          },
        })
        if (existingInvoice) continue

        const plan = PLAN_DEFINITIONS[sub.plan as PlanTier]
        if (!plan?.monthlyPriceZar) continue

        const totalCents = plan.monthlyPriceZar
        const netCents = Math.round(totalCents / (1 + VAT_RATE))
        const vatCents = totalCents - netCents
        const termsDays = sub.paymentTermsDays ?? 30
        const dueAt = addDays(sub.currentPeriodStart, termsDays)

        await db.invoice.create({
          data: {
            amountCents: netCents,
            vatCents,
            totalCents,
            status: "OPEN",
            billingCycle: sub.billingCycle,
            periodStart: sub.currentPeriodStart,
            periodEnd: sub.currentPeriodEnd,
            dueAt,
            lineItems: [
              {
                description: `${plan.name} Plan — ${sub.billingCycle === "ANNUAL" ? "Annual" : "Monthly"}`,
                quantity: 1,
                unitPriceCents: netCents,
                totalCents: netCents,
              },
              {
                description: `VAT (${Math.round(VAT_RATE * 100)}%)`,
                quantity: 1,
                unitPriceCents: vatCents,
                totalCents: vatCents,
              },
            ],
            organizationId: sub.organizationId,
          },
        })
        invoicesGenerated++

        // Notify org admins
        const orgManagers = await db.organizationUser.findMany({
          where: {
            organizationId: sub.organizationId,
            isActive: true,
            role: { in: ["OWNER", "ADMIN"] },
          },
          select: { userId: true },
        })

        const mgrIds = orgManagers.map((m) => m.userId)
        const enabledIds = await filterEnabledUsers(mgrIds, "SYSTEM", "IN_APP")
        const emailIds = await filterEnabledUsers(mgrIds, "SYSTEM", "EMAIL")

        const invTitle = "Invoice ready"
        const invMsg = `Your invoice for the current billing period is ready. Due by ${dueAt.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}.`

        for (const userId of enabledIds) {
          await db.notification.create({
            data: {
              title: invTitle,
              message: invMsg,
              type: "SYSTEM",
              userId,
              organizationId: sub.organizationId,
            },
          })
          created++
          billingNotifications++
        }

        for (const userId of emailIds) {
          sendNotificationEmail({ userId, title: invTitle, message: invMsg, type: "SYSTEM" })
        }
      }

      // 11b. Overdue invoice handling (14 days past due → UNCOLLECTIBLE)
      const graceDays = 14
      const overdueThreshold = addDays(now, -graceDays)

      const overdueOpenInvoices = await db.invoice.findMany({
        where: {
          status: "OPEN",
          dueAt: { lt: overdueThreshold },
        },
        select: { id: true, organizationId: true, dueAt: true },
      })

      for (const inv of overdueOpenInvoices) {
        await db.invoice.update({
          where: { id: inv.id },
          data: { status: "UNCOLLECTIBLE" },
        })
        overdueInvoices++
      }

      // Overdue warning (7 days past due → set subscription to PAST_DUE)
      const overdueWarningThreshold = addDays(now, -7)
      const overdueWarningInvoices = await db.invoice.findMany({
        where: {
          status: "OPEN",
          dueAt: { lt: overdueWarningThreshold, gte: overdueThreshold },
          organization: {
            subscription: {
              paymentMethod: { in: ["EFT", "INVOICE"] },
              status: "ACTIVE",
            },
          },
        },
        select: { organizationId: true },
      })

      for (const inv of overdueWarningInvoices) {
        await db.subscription.update({
          where: { organizationId: inv.organizationId },
          data: { status: "PAST_DUE", gracePeriodEndsAt: addDays(now, 7) },
        })

        const orgManagers = await db.organizationUser.findMany({
          where: {
            organizationId: inv.organizationId,
            isActive: true,
            role: { in: ["OWNER", "ADMIN"] },
          },
          select: { userId: true },
        })

        const mgrIds = orgManagers.map((m) => m.userId)
        const enabledIds = await filterEnabledUsers(mgrIds, "SUBSCRIPTION_PAYMENT_FAILED", "IN_APP")

        for (const userId of enabledIds) {
          const existing = await db.notification.findFirst({
            where: {
              userId,
              organizationId: inv.organizationId,
              type: "SUBSCRIPTION_PAYMENT_FAILED",
              createdAt: { gte: addDays(now, -1) },
            },
          })
          if (existing) continue

          await db.notification.create({
            data: {
              title: "Invoice overdue",
              message: "Your invoice is overdue. Please settle to avoid service interruption.",
              type: "SUBSCRIPTION_PAYMENT_FAILED",
              userId,
              organizationId: inv.organizationId,
            },
          })
          created++
          billingNotifications++
        }
      }

      // 11c. Prepaid auto-deduct at period renewal
      const prepaidRenewals = await db.subscription.findMany({
        where: {
          status: "ACTIVE",
          paymentMethod: "PREPAID",
          currentPeriodEnd: { lt: now },
        },
        select: {
          id: true,
          plan: true,
          billingCycle: true,
          currentPeriodEnd: true,
          organizationId: true,
        },
      })

      for (const sub of prepaidRenewals) {
        const plan = PLAN_DEFINITIONS[sub.plan as PlanTier]
        if (!plan?.monthlyPriceZar) continue

        const totalCents = plan.monthlyPriceZar
        const netCents = Math.round(totalCents / (1 + VAT_RATE))
        const vatCents = totalCents - netCents

        const accountBalance = await db.accountBalance.findUnique({
          where: { organizationId: sub.organizationId },
        })

        const balanceCents = accountBalance?.balanceCents ?? 0

        if (balanceCents >= totalCents) {
          // Sufficient balance — deduct and create PAID invoice
          await db.$transaction(async (tx) => {
            const invoice = await tx.invoice.create({
              data: {
                amountCents: netCents,
                vatCents,
                totalCents,
                status: "PAID",
                billingCycle: sub.billingCycle,
                periodStart: sub.currentPeriodEnd,
                periodEnd: sub.billingCycle === "ANNUAL"
                  ? addDays(sub.currentPeriodEnd, 365)
                  : addDays(sub.currentPeriodEnd, 30),
                dueAt: sub.currentPeriodEnd,
                paidAt: now,
                organizationId: sub.organizationId,
                lineItems: [
                  {
                    description: `${plan.name} Plan — ${sub.billingCycle === "ANNUAL" ? "Annual" : "Monthly"} (auto-deducted)`,
                    quantity: 1,
                    unitPriceCents: netCents,
                    totalCents: netCents,
                  },
                  {
                    description: `VAT (${Math.round(VAT_RATE * 100)}%)`,
                    quantity: 1,
                    unitPriceCents: vatCents,
                    totalCents: vatCents,
                  },
                ],
              },
            })

            const updatedBalance = await tx.accountBalance.update({
              where: { organizationId: sub.organizationId },
              data: {
                balanceCents: { decrement: totalCents },
                lifetimeDeductedCents: { increment: totalCents },
              },
            })

            await tx.accountTransaction.create({
              data: {
                type: "DEDUCT",
                amountCents: -totalCents,
                balanceAfterCents: updatedBalance.balanceCents,
                description: `Auto-deducted for ${plan.name} Plan — ${sub.billingCycle === "ANNUAL" ? "Annual" : "Monthly"}`,
                invoiceId: invoice.id,
                organizationId: sub.organizationId,
              },
            })
          })

          prepaidDeductions++
        } else {
          // Insufficient balance — create OPEN invoice and notify
          await db.invoice.create({
            data: {
              amountCents: netCents,
              vatCents,
              totalCents,
              status: "OPEN",
              billingCycle: sub.billingCycle,
              periodStart: sub.currentPeriodEnd,
              periodEnd: sub.billingCycle === "ANNUAL"
                ? addDays(sub.currentPeriodEnd, 365)
                : addDays(sub.currentPeriodEnd, 30),
              dueAt: addDays(now, 7),
              organizationId: sub.organizationId,
              lineItems: [
                {
                  description: `${plan.name} Plan — ${sub.billingCycle === "ANNUAL" ? "Annual" : "Monthly"}`,
                  quantity: 1,
                  unitPriceCents: netCents,
                  totalCents: netCents,
                },
                {
                  description: `VAT (${Math.round(VAT_RATE * 100)}%)`,
                  quantity: 1,
                  unitPriceCents: vatCents,
                  totalCents: vatCents,
                },
              ],
            },
          })

          // Set to PAST_DUE after grace
          await db.subscription.update({
            where: { id: sub.id },
            data: { status: "PAST_DUE", gracePeriodEndsAt: addDays(now, 7) },
          })

          const orgManagers = await db.organizationUser.findMany({
            where: {
              organizationId: sub.organizationId,
              isActive: true,
              role: { in: ["OWNER", "ADMIN"] },
            },
            select: { userId: true },
          })

          const mgrIds = orgManagers.map((m) => m.userId)
          const enabledIds = await filterEnabledUsers(mgrIds, "SUBSCRIPTION_PAYMENT_FAILED", "IN_APP")

          for (const userId of enabledIds) {
            await db.notification.create({
              data: {
                title: "Insufficient prepaid balance",
                message: "Your account balance is insufficient for the subscription renewal. Please fund your account to avoid service interruption.",
                type: "SUBSCRIPTION_PAYMENT_FAILED",
                userId,
                organizationId: sub.organizationId,
              },
            })
            created++
            billingNotifications++
          }
        }
      }
    } catch (err) {
      captureError(err, { source: "cron.alternativePayments" })
    }

    // ── 10. Work Permit auto-expiry & expiry warnings ──────
    let permitsExpired = 0
    let permitsWarned = 0
    try {
      // Auto-expire ACTIVE permits past validTo
      const expiredPermits = await db.workPermit.findMany({
        where: {
          status: "ACTIVE",
          validTo: { lt: now },
        },
        select: { id: true, title: true, organizationId: true, requestedById: true },
      })

      for (const permit of expiredPermits) {
        await db.workPermit.update({
          where: { id: permit.id },
          data: { status: "EXPIRED", closedAt: now },
        })
        permitsExpired++

        // Notify requester
        const userIds = [permit.requestedById]
        const orgManagers = await db.organizationUser.findMany({
          where: {
            organizationId: permit.organizationId,
            isActive: true,
            role: { in: ["OWNER", "ADMIN", "MANAGER"] },
          },
          select: { userId: true },
        })
        for (const m of orgManagers) {
          if (!userIds.includes(m.userId)) userIds.push(m.userId)
        }

        const title = `Work permit expired: "${permit.title}"`
        const message = `Work permit "${permit.title}" has expired and been automatically closed.`

        const enabledIds = await filterEnabledUsers(userIds, "PERMIT_EXPIRING", "IN_APP")
        const emailIds = await filterEnabledUsers(userIds, "PERMIT_EXPIRING", "EMAIL")

        for (const userId of enabledIds) {
          await db.notification.create({
            data: {
              title,
              message,
              type: "PERMIT_EXPIRING",
              userId,
              organizationId: permit.organizationId,
            },
          })
          created++
        }

        for (const userId of emailIds) {
          sendNotificationEmail({ userId, title, message, type: "PERMIT_EXPIRING" })
        }
      }

      // Warn on ACTIVE permits expiring within 24h
      const in24h = addDays(now, 1)
      const expiringPermits = await db.workPermit.findMany({
        where: {
          status: "ACTIVE",
          validTo: { gte: now, lte: in24h },
        },
        select: { id: true, title: true, organizationId: true, requestedById: true },
      })

      for (const permit of expiringPermits) {
        const userIds = [permit.requestedById]
        const orgManagers = await db.organizationUser.findMany({
          where: {
            organizationId: permit.organizationId,
            isActive: true,
            role: { in: ["OWNER", "ADMIN", "MANAGER"] },
          },
          select: { userId: true },
        })
        for (const m of orgManagers) {
          if (!userIds.includes(m.userId)) userIds.push(m.userId)
        }

        const title = `Work permit expiring soon: "${permit.title}"`
        const message = `Work permit "${permit.title}" will expire within the next 24 hours.`

        const enabledIds = await filterEnabledUsers(userIds, "PERMIT_EXPIRING", "IN_APP")

        for (const userId of enabledIds) {
          const existing = await db.notification.findFirst({
            where: {
              userId,
              organizationId: permit.organizationId,
              type: "PERMIT_EXPIRING",
              createdAt: { gte: addDays(now, -1) },
            },
          })
          if (existing) continue

          await db.notification.create({
            data: {
              title,
              message,
              type: "PERMIT_EXPIRING",
              userId,
              organizationId: permit.organizationId,
            },
          })
          created++
          permitsWarned++
        }

        const emailIds = await filterEnabledUsers(userIds, "PERMIT_EXPIRING", "EMAIL")
        for (const userId of emailIds) {
          sendNotificationEmail({ userId, title, message, type: "PERMIT_EXPIRING" })
        }
      }
    } catch (err) {
      captureError(err, { source: "cron.workPermitExpiry" })
    }

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
      incidentsNotified,
      statutoryNotified,
      objectivesNotified,
      checklistsGenerated,
      permitsExpired,
      permitsWarned,
      shareLinksExpired: expiredLinks.count,
      billing: {
        trialsExpired,
        gracePeriodsCancelled,
        periodsReset,
        billingNotifications,
        invoicesGenerated,
        overdueInvoices,
        prepaidDeductions,
      },
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
