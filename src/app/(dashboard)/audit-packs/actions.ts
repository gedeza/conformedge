"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import type { ActionResult } from "@/types"

const auditPackSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  projectId: z.string().min(1, "Project is required"),
})

export type AuditPackFormValues = z.infer<typeof auditPackSchema>

export async function getAuditPacks() {
  const { dbOrgId } = await getAuthContext()

  return db.auditPack.findMany({
    where: { organizationId: dbOrgId },
    include: {
      project: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAuditPack(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.auditPack.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      project: {
        include: {
          documents: { include: { classifications: { include: { standardClause: { include: { standard: true } } } } } },
          assessments: { include: { standard: true, questions: { include: { answers: true } } } },
          capas: { include: { capaActions: true } },
          checklists: { include: { standard: true, items: true } },
        },
      },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })
}

export async function createAuditPack(values: AuditPackFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()
    const parsed = auditPackSchema.parse(values)

    const pack = await db.auditPack.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        projectId: parsed.projectId,
        createdById: dbUserId,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "AuditPack",
      entityId: pack.id,
      metadata: { title: pack.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/audit-packs")
    return { success: true, data: { id: pack.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create audit pack" }
  }
}

export async function deleteAuditPack(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const existing = await db.auditPack.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Audit pack not found" }

    await db.auditPack.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "AuditPack",
      entityId: id,
      metadata: { title: existing.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/audit-packs")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete audit pack" }
  }
}

export async function compileAuditPack(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const pack = await db.auditPack.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!pack) return { success: false, error: "Audit pack not found" }

    await db.auditPack.update({
      where: { id },
      data: {
        status: "READY",
        generatedAt: new Date(),
      },
    })

    logAuditEvent({
      action: "COMPILE",
      entityType: "AuditPack",
      entityId: id,
      metadata: { title: pack.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/audit-packs/${id}`)
    revalidatePath("/audit-packs")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to compile audit pack" }
  }
}

export async function getProjectOptions() {
  const { dbOrgId } = await getAuthContext()
  return db.project.findMany({
    where: { organizationId: dbOrgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
