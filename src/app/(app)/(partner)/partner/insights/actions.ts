"use server"

import { db } from "@/lib/db"
import { getPartnerContext } from "@/lib/partner-auth"
import { isPartnerAdmin } from "@/lib/permissions"
import { calculatePartnerScore } from "@/lib/billing/partner-compliance"
import { logAuditEvent } from "@/lib/audit"
import type { ActionResult } from "@/types"

// ─────────────────────────────────────────────
// READ — Dashboard Data
// ─────────────────────────────────────────────

export async function getPartnerInsightsData() {
  const ctx = await getPartnerContext()
  if (!ctx || !isPartnerAdmin(ctx.partnerRole)) {
    throw new Error("Partner Admin access required")
  }

  const [partner, latestScores, openAlerts, scoreHistory] = await Promise.all([
    db.partner.findUnique({
      where: { id: ctx.partnerId },
      include: {
        clientOrganizations: {
          where: { isActive: true },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                _count: { select: { members: { where: { isActive: true } } } },
              },
            },
          },
        },
      },
    }),
    db.partnerAuditScore.findFirst({
      where: { partnerId: ctx.partnerId },
      orderBy: { createdAt: "desc" },
    }),
    db.partnerAlert.findMany({
      where: { partnerId: ctx.partnerId, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.partnerAuditScore.findMany({
      where: { partnerId: ctx.partnerId },
      orderBy: { periodMonth: "asc" },
      take: 6,
      select: {
        periodMonth: true,
        overallScore: true,
        activityScore: true,
        clientDensityScore: true,
        revenueScore: true,
        riskLevel: true,
        totalUsers: true,
        activeUsers: true,
        totalClientOrgs: true,
        totalRevenueCents: true,
      },
    }),
  ])

  return {
    partner,
    latestScore: latestScores,
    openAlerts,
    scoreHistory,
    partnerId: ctx.partnerId,
  }
}

// ─────────────────────────────────────────────
// ACTION — Recalculate Scores
// ─────────────────────────────────────────────

export async function recalculatePartnerScore(): Promise<ActionResult> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx || !isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Partner Admin access required" }
    }

    const score = await calculatePartnerScore(ctx.partnerId)

    if (!score) {
      return { success: false, error: "Failed to calculate score" }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to recalculate" }
  }
}

// ─────────────────────────────────────────────
// ACTION — Resolve / Dismiss Alert
// ─────────────────────────────────────────────

export async function resolvePartnerAlert(
  alertId: string,
  action: "RESOLVED" | "DISMISSED"
): Promise<ActionResult> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx || !isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Partner Admin access required" }
    }

    const alert = await db.partnerAlert.findFirst({
      where: { id: alertId, partnerId: ctx.partnerId },
    })

    if (!alert) return { success: false, error: "Alert not found" }
    if (alert.status === "RESOLVED" || alert.status === "DISMISSED") {
      return { success: false, error: "Alert already resolved" }
    }

    await db.partnerAlert.update({
      where: { id: alertId },
      data: {
        status: action,
        resolvedAt: new Date(),
        resolvedById: ctx.dbUserId,
      },
    })

    logAuditEvent({
      action: `PARTNER_ALERT_${action}`,
      entityType: "PartnerAlert",
      entityId: alertId,
      metadata: { alertType: alert.alertType, title: alert.title },
      userId: ctx.dbUserId,
      organizationId: ctx.clientOrgIds[0] ?? "",
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to resolve alert" }
  }
}
