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
