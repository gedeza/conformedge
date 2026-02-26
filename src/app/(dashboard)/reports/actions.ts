"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { subMonths, startOfMonth, format } from "date-fns"

export async function getReportData() {
  const { dbOrgId } = await getAuthContext()

  const [
    // Summary counts
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

    // Monthly activity (last 6 months)
    auditEvents,

    // Upcoming deadlines
    overdueCapas,
    expiringDocs,
  ] = await Promise.all([
    db.project.count({ where: { organizationId: dbOrgId } }),
    db.document.count({ where: { organizationId: dbOrgId } }),
    db.assessment.count({ where: { organizationId: dbOrgId } }),
    db.capa.count({ where: { organizationId: dbOrgId } }),
    db.complianceChecklist.count({ where: { organizationId: dbOrgId } }),
    db.subcontractor.count({ where: { organizationId: dbOrgId } }),

    db.assessment.aggregate({
      where: { organizationId: dbOrgId, overallScore: { not: null } },
      _avg: { overallScore: true },
    }),

    db.project.groupBy({ by: ["status"], where: { organizationId: dbOrgId }, _count: true }),
    db.document.groupBy({ by: ["status"], where: { organizationId: dbOrgId }, _count: true }),
    db.capa.groupBy({ by: ["status"], where: { organizationId: dbOrgId }, _count: true }),
    db.capa.groupBy({ by: ["priority"], where: { organizationId: dbOrgId }, _count: true }),
    db.capa.groupBy({ by: ["type"], where: { organizationId: dbOrgId }, _count: true }),
    db.complianceChecklist.groupBy({ by: ["status"], where: { organizationId: dbOrgId }, _count: true }),
    db.subcontractor.groupBy({ by: ["tier"], where: { organizationId: dbOrgId }, _count: true }),

    db.complianceChecklist.findMany({
      where: { organizationId: dbOrgId },
      select: { completionPercentage: true, standard: { select: { code: true } } },
    }),
    db.assessment.findMany({
      where: { organizationId: dbOrgId, overallScore: { not: null } },
      select: { overallScore: true, riskLevel: true, standard: { select: { code: true } } },
    }),

    db.auditTrailEvent.findMany({
      where: {
        organizationId: dbOrgId,
        createdAt: { gte: subMonths(new Date(), 6) },
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
  ])

  // Compliance by standard (avg checklist completion + avg assessment score)
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

  // Assessment risk distribution
  const riskDistribution = assessmentsWithStandard.reduce<Record<string, number>>((acc, a) => {
    const level = a.riskLevel ?? "UNRATED"
    acc[level] = (acc[level] ?? 0) + 1
    return acc
  }, {})

  // Monthly activity trend (last 6 months)
  const monthlyActivity: Array<{ month: string; events: number }> = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i))
    const label = format(monthStart, "MMM yyyy")
    const count = auditEvents.filter((e) => {
      const d = new Date(e.createdAt)
      return d.getFullYear() === monthStart.getFullYear() && d.getMonth() === monthStart.getMonth()
    }).length
    monthlyActivity.push({ month: label, events: count })
  }

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
  }
}
