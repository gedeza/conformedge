import { db } from "@/lib/db"
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import type { PartnerRiskLevel, PartnerAlertType, Prisma } from "@/generated/prisma/client"

// ─────────────────────────────────────────────
// Score Weights
// ─────────────────────────────────────────────

const WEIGHTS = {
  activity: 0.30,
  clientDensity: 0.20,
  revenue: 0.25,
  featureUtilization: 0.15,
  compliance: 0.10,
}

const CLIENT_DENSITY_THRESHOLD = 8 // users per client — above this gets penalized

// ─────────────────────────────────────────────
// Risk Level Thresholds
// ─────────────────────────────────────────────

function getRiskLevel(score: number): PartnerRiskLevel {
  if (score >= 80) return "LOW"
  if (score >= 60) return "MEDIUM"
  if (score >= 40) return "HIGH"
  return "CRITICAL"
}

// ─────────────────────────────────────────────
// Scoring Functions
// ─────────────────────────────────────────────

function calcActivityScore(active: number, total: number): number {
  if (total === 0) return 100 // No users = no penalty
  return Math.round((active / total) * 100)
}

function calcClientDensityScore(avgUsersPerClient: number): number {
  if (avgUsersPerClient <= CLIENT_DENSITY_THRESHOLD) return 100
  // Penalize linearly above threshold, floor at 0
  const penalty = (avgUsersPerClient - CLIENT_DENSITY_THRESHOLD) * 10
  return Math.max(0, Math.round(100 - penalty))
}

function calcRevenueScore(growthPercent: number, totalRevenueCents: number): number {
  // Base score from absolute revenue (max 50 pts)
  const absoluteScore = Math.min(50, Math.round(totalRevenueCents / 10000)) // R100 = 1 point
  // Growth component (max 50 pts)
  let growthScore: number
  if (growthPercent >= 10) growthScore = 50
  else if (growthPercent >= 0) growthScore = 30 + Math.round(growthPercent * 2)
  else if (growthPercent >= -15) growthScore = Math.max(0, 30 + Math.round(growthPercent * 2))
  else growthScore = 0
  return Math.min(100, absoluteScore + growthScore)
}

// ─────────────────────────────────────────────
// Main: Calculate & Store Partner Scores
// ─────────────────────────────────────────────

export async function calculatePartnerScore(partnerId: string, periodDate?: Date) {
  const now = periodDate ?? new Date()
  const periodMonth = format(now, "yyyy-MM")
  const periodStart = startOfMonth(now)
  const periodEnd = endOfMonth(now)
  const thirtyDaysAgo = subDays(now, 30)

  // Fetch partner with client orgs
  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    include: {
      clientOrganizations: {
        where: { isActive: true },
        select: { organizationId: true },
      },
      invoices: {
        where: { periodStart: { gte: startOfMonth(subMonths(now, 2)) } },
        orderBy: { periodStart: "desc" },
        take: 2,
        select: { totalCents: true, periodStart: true },
      },
    },
  })

  if (!partner) return null

  const clientOrgIds = partner.clientOrganizations.map(c => c.organizationId)
  const totalClientOrgs = clientOrgIds.length

  // User activity metrics
  let totalUsers = 0
  let activeUsers = 0

  if (clientOrgIds.length > 0) {
    const userCounts = await db.organizationUser.groupBy({
      by: ["organizationId"],
      where: { organizationId: { in: clientOrgIds }, isActive: true },
      _count: true,
    })
    totalUsers = userCounts.reduce((sum, g) => sum + g._count, 0)

    // Count users who logged in within the period
    const activeCount = await db.user.count({
      where: {
        memberships: {
          some: {
            organizationId: { in: clientOrgIds },
            isActive: true,
          },
        },
        lastLoginAt: { gte: thirtyDaysAgo },
      },
    })
    activeUsers = activeCount
  }

  const activityScore = calcActivityScore(activeUsers, totalUsers)
  const avgUsersPerClient = totalClientOrgs > 0 ? totalUsers / totalClientOrgs : 0
  const clientDensityScore = calcClientDensityScore(avgUsersPerClient)

  // Revenue metrics
  const currentInvoice = partner.invoices[0]
  const previousInvoice = partner.invoices[1]
  const totalRevenueCents = currentInvoice?.totalCents ?? 0
  const previousRevenueCents = previousInvoice?.totalCents ?? 0
  const revenueGrowthPercent = previousRevenueCents > 0
    ? ((totalRevenueCents - previousRevenueCents) / previousRevenueCents) * 100
    : 0
  const revenueScore = calcRevenueScore(revenueGrowthPercent, totalRevenueCents)

  // Feature utilization — count distinct entity types in audit trail across client orgs
  let featureUtilizationScore = 100
  if (clientOrgIds.length > 0) {
    const entityTypes = await db.auditTrailEvent.groupBy({
      by: ["entityType"],
      where: {
        organizationId: { in: clientOrgIds },
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    })
    // Score based on variety of modules used (max ~12 entity types = 100%)
    const maxEntityTypes = 12
    featureUtilizationScore = Math.min(100, Math.round((entityTypes.length / maxEntityTypes) * 100))
  }

  // Compliance score — based on open alerts
  const openAlerts = await db.partnerAlert.count({
    where: { partnerId, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
  })
  const complianceScore = Math.max(0, 100 - (openAlerts * 15))

  // Weighted composite
  const overallScore = Math.round(
    activityScore * WEIGHTS.activity +
    clientDensityScore * WEIGHTS.clientDensity +
    revenueScore * WEIGHTS.revenue +
    featureUtilizationScore * WEIGHTS.featureUtilization +
    complianceScore * WEIGHTS.compliance
  )

  const riskLevel = getRiskLevel(overallScore)

  // Upsert score
  const score = await db.partnerAuditScore.upsert({
    where: {
      partnerId_periodMonth: { partnerId, periodMonth },
    },
    create: {
      partnerId,
      periodMonth,
      totalUsers,
      activeUsers,
      activityScore,
      totalClientOrgs,
      avgUsersPerClient,
      clientDensityScore,
      totalRevenueCents,
      revenueGrowthPercent,
      revenueScore,
      featureUtilizationScore,
      overallScore,
      riskLevel,
    },
    update: {
      totalUsers,
      activeUsers,
      activityScore,
      totalClientOrgs,
      avgUsersPerClient,
      clientDensityScore,
      totalRevenueCents,
      revenueGrowthPercent,
      revenueScore,
      featureUtilizationScore,
      overallScore,
      riskLevel,
    },
  })

  // Generate alerts based on scores
  await generateAlerts(partnerId, {
    activityScore,
    activeUsers,
    totalUsers,
    avgUsersPerClient,
    revenueGrowthPercent,
    totalClientOrgs,
  })

  return score
}

// ─────────────────────────────────────────────
// Alert Generation
// ─────────────────────────────────────────────

interface AlertMetrics {
  activityScore: number
  activeUsers: number
  totalUsers: number
  avgUsersPerClient: number
  revenueGrowthPercent: number
  totalClientOrgs: number
}

async function generateAlerts(partnerId: string, metrics: AlertMetrics) {
  const alertsToCreate: Array<{
    alertType: "LOW_USER_ACTIVITY" | "GHOST_SEATS" | "CLIENT_DENSITY_HIGH" | "REVENUE_DECLINE"
    severity: PartnerRiskLevel
    title: string
    description: string
    metadata: Record<string, unknown>
  }> = []

  // Ghost seats — critical
  if (metrics.totalUsers > 0 && metrics.activityScore < 20) {
    alertsToCreate.push({
      alertType: "GHOST_SEATS",
      severity: "HIGH",
      title: `Ghost seats detected — only ${metrics.activityScore}% of users are active`,
      description: `${metrics.activeUsers} of ${metrics.totalUsers} allocated users logged in within the last 30 days. This indicates potential seat waste or inflated licensing.`,
      metadata: { activeUsers: metrics.activeUsers, totalUsers: metrics.totalUsers, activityPercent: metrics.activityScore },
    })
  }
  // Low activity — medium
  else if (metrics.totalUsers > 0 && metrics.activityScore < 40) {
    alertsToCreate.push({
      alertType: "LOW_USER_ACTIVITY",
      severity: "MEDIUM",
      title: `Low user activity — ${metrics.activityScore}% of seats active`,
      description: `${metrics.activeUsers} of ${metrics.totalUsers} users logged in within the last 30 days.`,
      metadata: { activeUsers: metrics.activeUsers, totalUsers: metrics.totalUsers, activityPercent: metrics.activityScore },
    })
  }

  // Client density — high
  if (metrics.avgUsersPerClient > CLIENT_DENSITY_THRESHOLD && metrics.totalClientOrgs > 0) {
    alertsToCreate.push({
      alertType: "CLIENT_DENSITY_HIGH",
      severity: "HIGH",
      title: `High client density — ${metrics.avgUsersPerClient.toFixed(1)} users per client org`,
      description: `Average of ${metrics.avgUsersPerClient.toFixed(1)} users across ${metrics.totalClientOrgs} client organizations exceeds the ${CLIENT_DENSITY_THRESHOLD}-user threshold. This may indicate seat stuffing.`,
      metadata: { avgUsersPerClient: metrics.avgUsersPerClient, totalClientOrgs: metrics.totalClientOrgs, threshold: CLIENT_DENSITY_THRESHOLD },
    })
  }

  // Revenue decline — high
  if (metrics.revenueGrowthPercent < -15) {
    alertsToCreate.push({
      alertType: "REVENUE_DECLINE",
      severity: "HIGH",
      title: `Revenue declined ${Math.abs(metrics.revenueGrowthPercent).toFixed(0)}% month-over-month`,
      description: `Partner revenue dropped by ${Math.abs(metrics.revenueGrowthPercent).toFixed(1)}% compared to the previous month. Investigate potential client churn or downgrades.`,
      metadata: { revenueGrowthPercent: metrics.revenueGrowthPercent },
    })
  }

  // Create alerts (skip duplicates — don't re-alert for same type if one is already OPEN)
  for (const alert of alertsToCreate) {
    const existing = await db.partnerAlert.findFirst({
      where: {
        partnerId,
        alertType: alert.alertType,
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
      },
    })
    if (!existing) {
      await db.partnerAlert.create({
        data: {
          partner: { connect: { id: partnerId } },
          alertType: alert.alertType,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          metadata: alert.metadata as Prisma.InputJsonValue,
        },
      })
    }
  }
}

// ─────────────────────────────────────────────
// Calculate All Partner Scores (batch)
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Event-Driven Alerts (called from partner actions)
// ─────────────────────────────────────────────

/**
 * Create a partner alert if one of the same type isn't already open.
 * Used for event-driven alerts (CLIENT_CHURN, INACTIVE_CLIENT, STATUS_CHANGE, etc.)
 */
export async function createPartnerAlert(
  partnerId: string,
  alertType: PartnerAlertType,
  severity: PartnerRiskLevel,
  title: string,
  description: string,
  metadata: Record<string, unknown> = {}
) {
  const existing = await db.partnerAlert.findFirst({
    where: {
      partnerId,
      alertType,
      status: { in: ["OPEN", "ACKNOWLEDGED"] },
    },
  })
  if (existing) return null

  return db.partnerAlert.create({
    data: {
      partner: { connect: { id: partnerId } },
      alertType,
      severity,
      title,
      description,
      metadata: metadata as Prisma.InputJsonValue,
    },
  })
}

/**
 * Check for user spike: if total users across client orgs jumped >50% in a single action
 */
export async function checkUserSpikeAlert(partnerId: string) {
  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    include: {
      clientOrganizations: {
        where: { isActive: true },
        select: { organizationId: true },
      },
    },
  })
  if (!partner || partner.clientOrganizations.length === 0) return

  const orgIds = partner.clientOrganizations.map(c => c.organizationId)
  const totalUsers = await db.organizationUser.count({
    where: { organizationId: { in: orgIds }, isActive: true },
  })

  // Check against last score snapshot
  const lastScore = await db.partnerAuditScore.findFirst({
    where: { partnerId },
    orderBy: { createdAt: "desc" },
    select: { totalUsers: true },
  })

  if (lastScore && lastScore.totalUsers > 0) {
    const growthPercent = ((totalUsers - lastScore.totalUsers) / lastScore.totalUsers) * 100
    if (growthPercent > 50) {
      await createPartnerAlert(
        partnerId,
        "USER_SPIKE",
        "HIGH",
        `User spike detected — ${growthPercent.toFixed(0)}% increase`,
        `Total users jumped from ${lastScore.totalUsers} to ${totalUsers} (${growthPercent.toFixed(0)}% increase). Verify this is expected growth.`,
        { previousUsers: lastScore.totalUsers, currentUsers: totalUsers, growthPercent }
      )
    }
  }
}

export async function calculateAllPartnerScores() {
  const activePartners = await db.partner.findMany({
    where: { status: { in: ["ACTIVE", "APPROVED"] } },
    select: { id: true },
  })

  const results = []
  for (const partner of activePartners) {
    const score = await calculatePartnerScore(partner.id)
    if (score) results.push(score)
  }

  return results
}
