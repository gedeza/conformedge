"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext, getOrgMembers } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import type { ActionResult } from "@/types"

const capaSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["CORRECTIVE", "PREVENTIVE"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "VERIFICATION", "CLOSED"]).default("OPEN"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  rootCause: z.string().max(2000).optional(),
  dueDate: z.coerce.date().optional(),
  projectId: z.string().optional(),
  assignedToId: z.string().optional(),
})

export type CapaFormValues = z.infer<typeof capaSchema>

const capaActionSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  dueDate: z.coerce.date().optional(),
  assignedToId: z.string().optional(),
})

export type CapaActionFormValues = z.infer<typeof capaActionSchema>

const PAGE_SIZE = 50

export async function getCapas(page = 1) {
  const { dbOrgId } = await getAuthContext()

  const where = { organizationId: dbOrgId }

  const [capas, total] = await Promise.all([
    db.capa.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        raisedBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { capaActions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.capa.count({ where }),
  ])

  return {
    capas,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getCapa(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.capa.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      project: { select: { id: true, name: true } },
      raisedBy: { select: { id: true, firstName: true, lastName: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      capaActions: {
        orderBy: { createdAt: "asc" },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      linkedItems: {
        include: {
          checklist: {
            select: {
              id: true,
              title: true,
              standard: { select: { code: true, name: true } },
            },
          },
          standardClause: { select: { clauseNumber: true, title: true } },
        },
      },
    },
  })
}

export async function createCapa(values: CapaFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = capaSchema.parse(values)

    const capa = await db.capa.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        type: parsed.type,
        status: parsed.status,
        priority: parsed.priority,
        rootCause: parsed.rootCause,
        dueDate: parsed.dueDate,
        projectId: parsed.projectId || null,
        assignedToId: parsed.assignedToId || null,
        raisedById: dbUserId,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Capa",
      entityId: capa.id,
      metadata: { title: capa.title, type: capa.type },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/capas")
    return { success: true, data: { id: capa.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create CAPA" }
  }
}

export async function updateCapa(id: string, values: CapaFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = capaSchema.parse(values)

    const existing = await db.capa.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "CAPA not found" }

    const data: Record<string, unknown> = {
      title: parsed.title,
      description: parsed.description,
      type: parsed.type,
      status: parsed.status,
      priority: parsed.priority,
      rootCause: parsed.rootCause,
      dueDate: parsed.dueDate,
      projectId: parsed.projectId || null,
      assignedToId: parsed.assignedToId || null,
    }

    if (parsed.status === "CLOSED" && existing.status !== "CLOSED") {
      data.closedDate = new Date()
    }

    await db.capa.update({ where: { id }, data })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Capa",
      entityId: id,
      metadata: { title: parsed.title, status: parsed.status },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/capas")
    revalidatePath(`/capas/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update CAPA" }
  }
}

export async function deleteCapa(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.capa.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "CAPA not found" }

    await db.capa.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "Capa",
      entityId: id,
      metadata: { title: existing.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/capas")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete CAPA" }
  }
}

export async function addCapaAction(capaId: string, values: CapaActionFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = capaActionSchema.parse(values)

    const capa = await db.capa.findFirst({ where: { id: capaId, organizationId: dbOrgId } })
    if (!capa) return { success: false, error: "CAPA not found" }

    await db.capaAction.create({
      data: {
        description: parsed.description,
        dueDate: parsed.dueDate,
        assignedToId: parsed.assignedToId || null,
        capaId,
      },
    })

    logAuditEvent({
      action: "ADD_ACTION",
      entityType: "Capa",
      entityId: capaId,
      metadata: { description: parsed.description },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/capas/${capaId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add action" }
  }
}

export async function toggleCapaActionComplete(actionId: string, capaId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const capa = await db.capa.findFirst({ where: { id: capaId, organizationId: dbOrgId } })
    if (!capa) return { success: false, error: "CAPA not found" }

    const action = await db.capaAction.findUnique({ where: { id: actionId } })
    if (!action) return { success: false, error: "Action not found" }

    await db.capaAction.update({
      where: { id: actionId },
      data: {
        isCompleted: !action.isCompleted,
        completedDate: !action.isCompleted ? new Date() : null,
      },
    })

    logAuditEvent({
      action: action.isCompleted ? "UNCOMPLETE_ACTION" : "COMPLETE_ACTION",
      entityType: "Capa",
      entityId: capaId,
      metadata: { actionId },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/capas/${capaId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle action" }
  }
}

export async function escalateCapa(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const capa = await db.capa.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!capa) return { success: false, error: "CAPA not found" }
    if (capa.status === "CLOSED") return { success: false, error: "Cannot escalate a closed CAPA" }

    const escalation: Record<string, string> = {
      LOW: "MEDIUM",
      MEDIUM: "HIGH",
      HIGH: "CRITICAL",
    }
    const newPriority = escalation[capa.priority]
    if (!newPriority) return { success: false, error: "Already at maximum priority (CRITICAL)" }

    await db.capa.update({
      where: { id },
      data: { priority: newPriority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" },
    })

    logAuditEvent({
      action: "ESCALATE",
      entityType: "Capa",
      entityId: id,
      metadata: { from: capa.priority, to: newPriority, title: capa.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/capas")
    revalidatePath(`/capas/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to escalate CAPA" }
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

export async function getMembers() {
  const { dbOrgId } = await getAuthContext()
  return getOrgMembers(dbOrgId)
}
