"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
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
    const { dbUserId, dbOrgId } = await getAuthContext()
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
    const { dbUserId, dbOrgId } = await getAuthContext()
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

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

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
