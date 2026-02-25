"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"

export async function getDashboardMetrics() {
  const { dbOrgId } = await getAuthContext()

  const [
    activeProjects,
    totalDocuments,
    completedAssessments,
    openCapas,
    totalChecklists,
    recentActivity,
    avgComplianceScore,
  ] = await Promise.all([
    db.project.count({
      where: { organizationId: dbOrgId, status: "ACTIVE" },
    }),
    db.document.count({
      where: { organizationId: dbOrgId },
    }),
    db.assessment.count({
      where: { organizationId: dbOrgId, completedDate: { not: null } },
    }),
    db.capa.count({
      where: {
        organizationId: dbOrgId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
    db.complianceChecklist.count({
      where: { organizationId: dbOrgId },
    }),
    db.auditTrailEvent.findMany({
      where: { organizationId: dbOrgId },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.assessment.aggregate({
      where: {
        organizationId: dbOrgId,
        overallScore: { not: null },
      },
      _avg: { overallScore: true },
    }),
  ])

  return {
    activeProjects,
    totalDocuments,
    completedAssessments,
    openCapas,
    totalChecklists,
    recentActivity,
    avgComplianceScore: avgComplianceScore._avg.overallScore ?? null,
  }
}
