import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"
import { sendExternalEmail } from "@/lib/email"

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Cron job: Check compliance obligation expiry dates.
 * - Notifies responsible users when obligations approach expiry
 * - Sends external email to vendor contactEmail
 * - Auto-expires obligations past their expiry date
 */
export async function POST(req: Request) {
  // Validate cron secret
  const authHeader = req.headers.get("authorization")
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    let notifiedCount = 0
    let expiredCount = 0
    let vendorEmailCount = 0

    // ── 1. Find obligations approaching expiry (within renewalLeadDays) ──
    const approachingExpiry = await db.complianceObligation.findMany({
      where: {
        status: "ACTIVE",
        expiryDate: { not: null, gte: now },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            members: {
              where: { isActive: true, role: { in: ["OWNER", "ADMIN", "MANAGER"] } },
              select: { userId: true },
              take: 3,
            },
          },
        },
        vendor: { select: { id: true, name: true, contactEmail: true } },
        responsibleUser: { select: { id: true, email: true, firstName: true } },
      },
    })

    for (const obligation of approachingExpiry) {
      const daysLeft = Math.ceil(
        (new Date(obligation.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      const leadDays = obligation.renewalLeadDays ?? 30

      // Only notify if within lead window
      if (daysLeft > leadDays) continue

      // Check for existing notification today (dedup)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const existingNotification = await db.notification.findFirst({
        where: {
          // entityId tracked via title
          type: "OBLIGATION_EXPIRING",
          organizationId: obligation.organizationId,
          createdAt: { gte: today },
        },
      })

      if (existingNotification) continue

      // Notify responsible user or org admins
      const targetUserId = obligation.responsibleUserId ?? obligation.organization.members[0]?.userId
      if (targetUserId) {
        await createNotification({
          userId: targetUserId,
          organizationId: obligation.organizationId,
          type: "OBLIGATION_EXPIRING",
          title: `Obligation expiring in ${daysLeft} days`,
          message: `"${obligation.title}" expires on ${new Date(obligation.expiryDate!).toLocaleDateString("en-ZA")}. Please review and renew.`,
          // entityId tracked via title
        })
        notifiedCount++
      }

      // Send external email to vendor if linked
      if (obligation.vendor?.contactEmail) {
        sendExternalEmail({
          to: obligation.vendor.contactEmail,
          subject: `[${obligation.organization.name}] Compliance obligation expiring: ${obligation.title}`,
          text: `Dear ${obligation.vendor.name},\n\nThis is a notification that the following compliance obligation is expiring in ${daysLeft} days:\n\n• ${obligation.title}\n• Expiry date: ${new Date(obligation.expiryDate!).toLocaleDateString("en-ZA")}\n\nPlease take action to renew or update the relevant documentation.\n\nRegards,\n${obligation.organization.name}\nPowered by ConformEdge`,
        })
        vendorEmailCount++
      }
    }

    // ── 2. Auto-expire obligations past their expiry date ──
    const expiredObligations = await db.complianceObligation.findMany({
      where: {
        status: "ACTIVE",
        expiryDate: { lt: now },
      },
      select: { id: true, title: true, organizationId: true, responsibleUserId: true },
    })

    for (const obligation of expiredObligations) {
      await db.complianceObligation.update({
        where: { id: obligation.id },
        data: { status: "EXPIRED" },
      })

      // Notify responsible user
      if (obligation.responsibleUserId) {
        await createNotification({
          userId: obligation.responsibleUserId,
          organizationId: obligation.organizationId,
          type: "OBLIGATION_EXPIRING",
          title: "Compliance obligation expired",
          message: `"${obligation.title}" has expired and its status has been updated to EXPIRED. Immediate action required.`,
          // entityId tracked via title
        })
      }

      expiredCount++
    }

    return NextResponse.json({
      success: true,
      notified: notifiedCount,
      expired: expiredCount,
      vendorEmails: vendorEmailCount,
    })
  } catch (error) {
    console.error("[cron/check-obligations] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
