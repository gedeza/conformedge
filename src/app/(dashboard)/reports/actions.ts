"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { subMonths, startOfMonth, format, addMonths } from "date-fns"
import { calculateComplianceScore } from "@/app/(dashboard)/subcontractors/compliance-score"
import type { DateRangeParams } from "./date-utils"

function dateFilter(dateRange: DateRangeParams, field = "createdAt") {
  if (!dateRange.from && !dateRange.to) return {}
  const filter: Record<string, Date> = {}
  if (dateRange.from) filter.gte = dateRange.from
  if (dateRange.to) filter.lte = dateRange.to
  return { [field]: filter }
}

// ── Main report data fetcher ────────────────────

export async function getReportData(dateRange: DateRangeParams = {}) {
  const { dbOrgId } = await getAuthContext()

  const dateWhere = dateFilter(dateRange)
  const hasDateFilter = Boolean(dateRange.from || dateRange.to)

  const [
    // Summary counts (current state — not date-filtered)
    totalProjects,
    totalDocuments,
    totalAssessments,
    totalCapas,
    totalChecklists,
    totalSubcontractors,

    // Score aggregate
    avgScore,

    // Status distributions
    projectsByStatus,
    documentsByStatus,
    capasByStatus,
    capasByPriority,
    capasByType,
    checklistsByStatus,
    subcontractorsByTier,

    // Per-standard compliance
    checklistsWithStandard,
    assessmentsWithStandard,

    // Monthly activity
    auditEvents,

    // Upcoming deadlines
    overdueCapas,
    expiringDocs,

    // Compliance trend: assessments with dates (last 12 months)
    trendAssessments,
    // Compliance trend: checklists with dates (last 12 months)
    trendChecklists,

    // Subcontractor metrics
    subcontractorsWithCerts,
    subcontractorsByBeeLevel,
  ] = await Promise.all([
    db.project.count({ where: { organizationId: dbOrgId } }),
    db.document.count({ where: { organizationId: dbOrgId, ...dateWhere } }),
    db.assessment.count({ where: { organizationId: dbOrgId, ...dateWhere } }),
    db.capa.count({ where: { organizationId: dbOrgId, ...dateWhere } }),
    db.complianceChecklist.count({ where: { organizationId: dbOrgId, ...dateWhere } }),
    db.subcontractor.count({ where: { organizationId: dbOrgId } }),

    db.assessment.aggregate({
      where: { organizationId: dbOrgId, overallScore: { not: null }, ...dateWhere },
      _avg: { overallScore: true },
    }),

    db.project.groupBy({ by: ["status"], where: { organizationId: dbOrgId }, _count: true }),
    db.document.groupBy({ by: ["status"], where: { organizationId: dbOrgId, ...dateWhere }, _count: true }),
    db.capa.groupBy({ by: ["status"], where: { organizationId: dbOrgId, ...dateWhere }, _count: true }),
    db.capa.groupBy({ by: ["priority"], where: { organizationId: dbOrgId, ...dateWhere }, _count: true }),
    db.capa.groupBy({ by: ["type"], where: { organizationId: dbOrgId, ...dateWhere }, _count: true }),
    db.complianceChecklist.groupBy({ by: ["status"], where: { organizationId: dbOrgId, ...dateWhere }, _count: true }),
    db.subcontractor.groupBy({ by: ["tier"], where: { organizationId: dbOrgId }, _count: true }),

    db.complianceChecklist.findMany({
      where: { organizationId: dbOrgId, ...dateWhere },
      select: { completionPercentage: true, standard: { select: { code: true } } },
    }),
    db.assessment.findMany({
      where: { organizationId: dbOrgId, overallScore: { not: null }, ...dateWhere },
      select: { overallScore: true, riskLevel: true, standard: { select: { code: true } } },
    }),

    db.auditTrailEvent.findMany({
      where: {
        organizationId: dbOrgId,
        ...(hasDateFilter ? dateWhere : { createdAt: { gte: subMonths(new Date(), 6) } }),
      },
      select: { createdAt: true, action: true },
      orderBy: { createdAt: "asc" },
    }),

    db.capa.count({
      where: {
        organizationId: dbOrgId,
        status: { not: "CLOSED" },
        dueDate: { lt: new Date() },
      },
    }),
    db.document.count({
      where: {
        organizationId: dbOrgId,
        status: { not: "ARCHIVED" },
        expiresAt: { lt: new Date() },
      },
    }),

    // Compliance trend: assessments scored in last 12 months
    db.assessment.findMany({
      where: {
        organizationId: dbOrgId,
        overallScore: { not: null },
        createdAt: { gte: subMonths(new Date(), 12) },
      },
      select: { overallScore: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    // Compliance trend: checklists in last 12 months
    db.complianceChecklist.findMany({
      where: {
        organizationId: dbOrgId,
        createdAt: { gte: subMonths(new Date(), 12) },
      },
      select: { completionPercentage: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    // Subcontractors with certs for scoring + expiry
    db.subcontractor.findMany({
      where: { organizationId: dbOrgId },
      select: {
        id: true,
        name: true,
        tier: true,
        beeLevel: true,
        safetyRating: true,
        certifications: {
          select: { name: true, expiresAt: true },
        },
      },
    }),

    // BEE level distribution
    db.subcontractor.groupBy({
      by: ["beeLevel"],
      where: { organizationId: dbOrgId, beeLevel: { not: null } },
      _count: true,
    }),
  ])

  // ── Compliance by standard ──
  const standardMap = new Map<string, { checklistTotal: number; checklistSum: number; assessmentTotal: number; assessmentSum: number }>()
  for (const cl of checklistsWithStandard) {
    const code = cl.standard.code
    const entry = standardMap.get(code) ?? { checklistTotal: 0, checklistSum: 0, assessmentTotal: 0, assessmentSum: 0 }
    entry.checklistTotal++
    entry.checklistSum += cl.completionPercentage
    standardMap.set(code, entry)
  }
  for (const a of assessmentsWithStandard) {
    const code = a.standard.code
    const entry = standardMap.get(code) ?? { checklistTotal: 0, checklistSum: 0, assessmentTotal: 0, assessmentSum: 0 }
    entry.assessmentTotal++
    entry.assessmentSum += a.overallScore!
    standardMap.set(code, entry)
  }

  const complianceByStandard = Array.from(standardMap.entries())
    .map(([code, data]) => ({
      standard: code,
      checklistCompletion: data.checklistTotal > 0 ? Math.round(data.checklistSum / data.checklistTotal) : 0,
      assessmentScore: data.assessmentTotal > 0 ? Math.round(data.assessmentSum / data.assessmentTotal) : 0,
    }))
    .sort((a, b) => a.standard.localeCompare(b.standard))

  // ── Risk distribution ──
  const riskDistribution = assessmentsWithStandard.reduce<Record<string, number>>((acc, a) => {
    const level = a.riskLevel ?? "UNRATED"
    acc[level] = (acc[level] ?? 0) + 1
    return acc
  }, {})

  // ── Monthly activity trend ──
  const activityMonths = hasDateFilter ? 12 : 6
  const monthlyActivity: Array<{ month: string; events: number }> = []
  for (let i = activityMonths - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i))
    const label = format(monthStart, "MMM yyyy")
    const count = auditEvents.filter((e) => {
      const d = new Date(e.createdAt)
      return d.getFullYear() === monthStart.getFullYear() && d.getMonth() === monthStart.getMonth()
    }).length
    monthlyActivity.push({ month: label, events: count })
  }

  // ── Compliance trend (last 12 months) ──
  const complianceTrend: Array<{
    month: string
    assessmentScore: number | null
    checklistCompletion: number | null
  }> = []
  for (let i = 11; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i))
    const monthEnd = startOfMonth(addMonths(monthStart, 1))
    const label = format(monthStart, "MMM yyyy")

    const monthAssessments = trendAssessments.filter((a) => {
      const d = new Date(a.createdAt)
      return d >= monthStart && d < monthEnd
    })
    const monthChecklists = trendChecklists.filter((c) => {
      const d = new Date(c.createdAt)
      return d >= monthStart && d < monthEnd
    })

    complianceTrend.push({
      month: label,
      assessmentScore: monthAssessments.length > 0
        ? Math.round(monthAssessments.reduce((sum, a) => sum + a.overallScore!, 0) / monthAssessments.length)
        : null,
      checklistCompletion: monthChecklists.length > 0
        ? Math.round(monthChecklists.reduce((sum, c) => sum + c.completionPercentage, 0) / monthChecklists.length)
        : null,
    })
  }

  // ── Subcontractor metrics ──
  const now = new Date()
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  // Cert expiry countdown (next 90 days)
  const certExpiryCountdown: Array<{
    subcontractorName: string
    certName: string
    expiresAt: string
    daysUntilExpiry: number
  }> = []

  const scoredSubcontractors: Array<{
    name: string
    score: number
    tier: string
  }> = []

  for (const sub of subcontractorsWithCerts) {
    // Compliance scores
    const score = calculateComplianceScore(sub)
    scoredSubcontractors.push({ name: sub.name, score: score.total, tier: score.tier })

    // Cert expiry
    for (const cert of sub.certifications) {
      if (!cert.expiresAt) continue
      const expiry = new Date(cert.expiresAt)
      if (expiry > now && expiry <= ninetyDaysFromNow) {
        const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        certExpiryCountdown.push({
          subcontractorName: sub.name,
          certName: cert.name,
          expiresAt: format(expiry, "dd MMM yyyy"),
          daysUntilExpiry: daysUntil,
        })
      }
    }
  }

  certExpiryCountdown.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
  scoredSubcontractors.sort((a, b) => b.score - a.score)

  const beeDistribution = subcontractorsByBeeLevel.map((r) => ({
    level: `Level ${r.beeLevel}`,
    count: r._count,
  }))

  return {
    summary: {
      totalProjects,
      totalDocuments,
      totalAssessments,
      totalCapas,
      totalChecklists,
      totalSubcontractors,
      avgComplianceScore: avgScore._avg.overallScore ?? null,
      overdueCapas,
      expiringDocs,
    },
    projectsByStatus: projectsByStatus.map((r) => ({ status: r.status, count: r._count })),
    documentsByStatus: documentsByStatus.map((r) => ({ status: r.status, count: r._count })),
    capasByStatus: capasByStatus.map((r) => ({ status: r.status, count: r._count })),
    capasByPriority: capasByPriority.map((r) => ({ priority: r.priority, count: r._count })),
    capasByType: capasByType.map((r) => ({ type: r.type, count: r._count })),
    checklistsByStatus: checklistsByStatus.map((r) => ({ status: r.status, count: r._count })),
    subcontractorsByTier: subcontractorsByTier.map((r) => ({ tier: r.tier, count: r._count })),
    complianceByStandard,
    riskDistribution: Object.entries(riskDistribution).map(([level, count]) => ({ level, count })),
    monthlyActivity,
    complianceTrend,
    subcontractorMetrics: {
      beeDistribution,
      certExpiryCountdown: certExpiryCountdown.slice(0, 10),
      scoredSubcontractors: scoredSubcontractors.slice(0, 10),
    },
  }
}

export type ReportData = Awaited<ReturnType<typeof getReportData>>
