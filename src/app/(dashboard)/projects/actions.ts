"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import type { ActionResult } from "@/types"

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).default("PLANNING"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

export async function getProjects() {
  const { dbOrgId } = await getAuthContext()

  return db.project.findMany({
    where: { organizationId: dbOrgId },
    include: {
      _count: {
        select: {
          documents: true,
          assessments: true,
          capas: true,
          checklists: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getProject(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.project.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
      assessments: { orderBy: { createdAt: "desc" }, take: 10 },
      capas: { orderBy: { createdAt: "desc" }, take: 10 },
      checklists: { orderBy: { createdAt: "desc" }, take: 10 },
      auditPacks: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: {
        select: {
          documents: true,
          assessments: true,
          capas: true,
          checklists: true,
          auditPacks: true,
        },
      },
    },
  })
}

export async function createProject(values: ProjectFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = projectSchema.parse(values)

    const project = await db.project.create({
      data: {
        ...parsed,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Project",
      entityId: project.id,
      metadata: { name: project.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/projects")
    return { success: true, data: { id: project.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create project" }
  }
}

export async function updateProject(id: string, values: ProjectFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = projectSchema.parse(values)

    const existing = await db.project.findFirst({
      where: { id, organizationId: dbOrgId },
    })

    if (!existing) {
      return { success: false, error: "Project not found" }
    }

    await db.project.update({
      where: { id },
      data: parsed,
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Project",
      entityId: id,
      metadata: { name: parsed.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/projects")
    revalidatePath(`/projects/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update project" }
  }
}

export interface ProjectMetrics {
  complianceScore: {
    compliant: number
    total: number
    percentage: number
  }
  checklistProgress: {
    completed: number
    total: number
    percentage: number
  }
  overdueCAPAs: {
    count: number
    ids: string[]
  }
  riskDistribution: {
    level: string
    count: number
  }[]
}

export async function getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
  const { dbOrgId } = await getAuthContext()

  // Verify the project belongs to this org
  const project = await db.project.findFirst({
    where: { id: projectId, organizationId: dbOrgId },
    select: { id: true },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  // 1. Compliance Score — percentage of compliant checklist items
  const allChecklistItems = await db.checklistItem.findMany({
    where: {
      checklist: { projectId, organizationId: dbOrgId },
    },
    select: { isCompliant: true },
  })

  const totalItems = allChecklistItems.length
  const compliantItems = allChecklistItems.filter((item) => item.isCompliant === true).length
  const compliancePercentage = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0

  // 2. Checklist Progress — completed checklists vs total
  const checklists = await db.complianceChecklist.findMany({
    where: { projectId, organizationId: dbOrgId },
    select: { status: true },
  })

  const totalChecklists = checklists.length
  const completedChecklists = checklists.filter((cl) => cl.status === "COMPLETED").length
  const checklistPercentage = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0

  // 3. Overdue CAPAs — not CLOSED and past due date
  const now = new Date()
  const overdueCAPAs = await db.capa.findMany({
    where: {
      projectId,
      organizationId: dbOrgId,
      status: { not: "CLOSED" },
      dueDate: { lt: now },
    },
    select: { id: true },
  })

  // 4. Risk Distribution — group assessments by risk level
  const assessments = await db.assessment.findMany({
    where: {
      projectId,
      organizationId: dbOrgId,
      riskLevel: { not: null },
    },
    select: { riskLevel: true },
  })

  const riskCounts: Record<string, number> = {}
  for (const a of assessments) {
    if (a.riskLevel) {
      riskCounts[a.riskLevel] = (riskCounts[a.riskLevel] || 0) + 1
    }
  }

  // Ensure all levels appear, ordered by severity
  const riskLevels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
  const riskDistribution = riskLevels.map((level) => ({
    level,
    count: riskCounts[level] || 0,
  }))

  return {
    complianceScore: {
      compliant: compliantItems,
      total: totalItems,
      percentage: compliancePercentage,
    },
    checklistProgress: {
      completed: completedChecklists,
      total: totalChecklists,
      percentage: checklistPercentage,
    },
    overdueCAPAs: {
      count: overdueCAPAs.length,
      ids: overdueCAPAs.map((c) => c.id),
    },
    riskDistribution,
  }
}

export interface ProjectChartData {
  complianceTrend: Array<{ month: string; assessmentScore: number | null; checklistCompletion: number | null }>
  documentsByStatus: Array<{ name: string; value: number }>
  capasByPriority: Array<{ name: string; value: number }>
  capasByStatus: Array<{ name: string; value: number }>
  recentActivity: Array<{
    id: string
    action: string
    entityType: string
    entityId: string
    metadata: Record<string, unknown> | null
    createdAt: Date
    user: { firstName: string | null; lastName: string | null } | null
  }>
}

export async function getProjectChartData(projectId: string): Promise<ProjectChartData> {
  const { dbOrgId } = await getAuthContext()

  const project = await db.project.findFirst({
    where: { id: projectId, organizationId: dbOrgId },
    select: { id: true },
  })
  if (!project) throw new Error("Project not found")

  // 1. Compliance trend — monthly assessment scores + checklist completion (last 12 months)
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  const [assessments, checklists, documents, capas, auditEvents] = await Promise.all([
    db.assessment.findMany({
      where: { projectId, organizationId: dbOrgId, createdAt: { gte: twelveMonthsAgo } },
      select: { overallScore: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.complianceChecklist.findMany({
      where: { projectId, organizationId: dbOrgId, createdAt: { gte: twelveMonthsAgo } },
      select: { completionPercentage: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.document.findMany({
      where: { projectId, organizationId: dbOrgId },
      select: { status: true },
    }),
    db.capa.findMany({
      where: { projectId, organizationId: dbOrgId },
      select: { status: true, priority: true },
    }),
    db.auditTrailEvent.findMany({
      where: {
        organizationId: dbOrgId,
        entityType: { in: ["Project", "Document", "Checklist", "Assessment", "CAPA"] },
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ])

  // Filter audit events: only those referencing this project or its entities
  const projectEntityIds = new Set<string>([projectId])

  // Get entity IDs belonging to this project
  const [projectDocs, projectCapas, projectChecklists, projectAssessments] = await Promise.all([
    db.document.findMany({ where: { projectId, organizationId: dbOrgId }, select: { id: true } }),
    db.capa.findMany({ where: { projectId, organizationId: dbOrgId }, select: { id: true } }),
    db.complianceChecklist.findMany({ where: { projectId, organizationId: dbOrgId }, select: { id: true } }),
    db.assessment.findMany({ where: { projectId, organizationId: dbOrgId }, select: { id: true } }),
  ])

  for (const d of projectDocs) projectEntityIds.add(d.id)
  for (const c of projectCapas) projectEntityIds.add(c.id)
  for (const cl of projectChecklists) projectEntityIds.add(cl.id)
  for (const a of projectAssessments) projectEntityIds.add(a.id)

  const filteredActivity = auditEvents
    .filter((e) => projectEntityIds.has(e.entityId))
    .slice(0, 20)

  // Build monthly trend data
  const months: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }

  const complianceTrend = months.map((month) => {
    const monthAssessments = assessments.filter((a) => {
      const m = `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, "0")}`
      return m === month
    })
    const monthChecklists = checklists.filter((c) => {
      const m = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`
      return m === month
    })

    const avgScore = monthAssessments.length > 0
      ? Math.round(monthAssessments.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) / monthAssessments.length)
      : null
    const avgCompletion = monthChecklists.length > 0
      ? Math.round(monthChecklists.reduce((sum, c) => sum + c.completionPercentage, 0) / monthChecklists.length)
      : null

    return { month, assessmentScore: avgScore, checklistCompletion: avgCompletion }
  })

  // 2. Documents by status
  const docStatusCounts: Record<string, number> = {}
  for (const d of documents) {
    docStatusCounts[d.status] = (docStatusCounts[d.status] || 0) + 1
  }
  const documentsByStatus = Object.entries(docStatusCounts).map(([name, value]) => ({ name, value }))

  // 3. CAPAs by priority
  const capaPriorityCounts: Record<string, number> = {}
  for (const c of capas) {
    capaPriorityCounts[c.priority] = (capaPriorityCounts[c.priority] || 0) + 1
  }
  const capasByPriority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => ({
    name: p,
    value: capaPriorityCounts[p] || 0,
  }))

  // 4. CAPAs by status
  const capaStatusCounts: Record<string, number> = {}
  for (const c of capas) {
    capaStatusCounts[c.status] = (capaStatusCounts[c.status] || 0) + 1
  }
  const capasByStatus = Object.entries(capaStatusCounts).map(([name, value]) => ({ name, value }))

  // 5. Recent activity
  const recentActivity = filteredActivity.map((e) => ({
    id: e.id,
    action: e.action,
    entityType: e.entityType,
    entityId: e.entityId,
    metadata: e.metadata as Record<string, unknown> | null,
    createdAt: e.createdAt,
    user: e.user,
  }))

  return {
    complianceTrend,
    documentsByStatus,
    capasByPriority,
    capasByStatus,
    recentActivity,
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.project.findFirst({
      where: { id, organizationId: dbOrgId },
    })

    if (!existing) {
      return { success: false, error: "Project not found" }
    }

    await db.project.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "Project",
      entityId: id,
      metadata: { name: existing.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete project" }
  }
}
