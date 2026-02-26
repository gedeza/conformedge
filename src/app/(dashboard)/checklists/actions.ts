"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext, getOrgMembers } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete, canConduct } from "@/lib/permissions"
import type { ActionResult } from "@/types"

const checklistSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  standardId: z.string().min(1, "Standard is required"),
  projectId: z.string().optional(),
  assignedToId: z.string().optional(),
})

export type ChecklistFormValues = z.infer<typeof checklistSchema>

export async function getChecklists() {
  const { dbOrgId } = await getAuthContext()

  return db.complianceChecklist.findMany({
    where: { organizationId: dbOrgId },
    include: {
      standard: { select: { id: true, code: true, name: true } },
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getChecklist(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.complianceChecklist.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      standard: { select: { id: true, code: true, name: true } },
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          standardClause: { select: { clauseNumber: true, title: true } },
        },
      },
    },
  })
}

export async function createChecklist(values: ChecklistFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = checklistSchema.parse(values)

    const checklist = await db.complianceChecklist.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        standardId: parsed.standardId,
        projectId: parsed.projectId || null,
        assignedToId: parsed.assignedToId || null,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Checklist",
      entityId: checklist.id,
      metadata: { title: checklist.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/checklists")
    return { success: true, data: { id: checklist.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create checklist" }
  }
}

export async function updateChecklist(id: string, values: ChecklistFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = checklistSchema.parse(values)

    const existing = await db.complianceChecklist.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Checklist not found" }

    await db.complianceChecklist.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description,
        standardId: parsed.standardId,
        projectId: parsed.projectId || null,
        assignedToId: parsed.assignedToId || null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Checklist",
      entityId: id,
      metadata: { title: parsed.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/checklists")
    revalidatePath(`/checklists/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update checklist" }
  }
}

export async function deleteChecklist(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.complianceChecklist.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Checklist not found" }

    await db.complianceChecklist.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "Checklist",
      entityId: id,
      metadata: { title: existing.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/checklists")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete checklist" }
  }
}

export async function generateItemsFromStandard(checklistId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const checklist = await db.complianceChecklist.findFirst({
      where: { id: checklistId, organizationId: dbOrgId },
      include: {
        standard: { include: { clauses: { orderBy: { clauseNumber: "asc" } } } },
        items: true,
      },
    })

    if (!checklist) return { success: false, error: "Checklist not found" }
    if (checklist.items.length > 0) return { success: false, error: "Items already exist" }

    const items = checklist.standard.clauses.map((clause, index) => ({
      description: `${clause.clauseNumber}: ${clause.title}`,
      sortOrder: index + 1,
      checklistId,
      standardClauseId: clause.id,
    }))

    await db.checklistItem.createMany({ data: items })

    logAuditEvent({
      action: "GENERATE_ITEMS",
      entityType: "Checklist",
      entityId: checklistId,
      metadata: { count: items.length },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/checklists/${checklistId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate items" }
  }
}

export async function toggleItemCompliance(
  itemId: string,
  checklistId: string,
  isCompliant: boolean | null
): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canConduct(role)) return { success: false, error: "Insufficient permissions" }

    const checklist = await db.complianceChecklist.findFirst({ where: { id: checklistId, organizationId: dbOrgId } })
    if (!checklist) return { success: false, error: "Checklist not found" }

    await db.checklistItem.update({
      where: { id: itemId },
      data: { isCompliant },
    })

    await recalculateCompletion(checklistId)

    logAuditEvent({
      action: "TOGGLE_COMPLIANCE",
      entityType: "Checklist",
      entityId: checklistId,
      metadata: { itemId, isCompliant },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/checklists/${checklistId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update item" }
  }
}

export async function updateItemEvidence(
  itemId: string,
  checklistId: string,
  evidence: string
): Promise<ActionResult> {
  try {
    const { dbOrgId, role } = await getAuthContext()
    if (!canConduct(role)) return { success: false, error: "Insufficient permissions" }

    const checklist = await db.complianceChecklist.findFirst({ where: { id: checklistId, organizationId: dbOrgId } })
    if (!checklist) return { success: false, error: "Checklist not found" }

    await db.checklistItem.update({
      where: { id: itemId },
      data: { evidence },
    })

    revalidatePath(`/checklists/${checklistId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update evidence" }
  }
}

async function recalculateCompletion(checklistId: string) {
  const items = await db.checklistItem.findMany({ where: { checklistId } })
  const total = items.length
  if (total === 0) return

  const assessed = items.filter((i) => i.isCompliant !== null).length
  const completionPercentage = (assessed / total) * 100

  let status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  if (assessed === 0) status = "NOT_STARTED"
  else if (assessed === total) status = "COMPLETED"
  else status = "IN_PROGRESS"

  await db.complianceChecklist.update({
    where: { id: checklistId },
    data: { completionPercentage, status },
  })
}

export async function addChecklistItem(
  checklistId: string,
  description: string,
  standardClauseId?: string
): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const checklist = await db.complianceChecklist.findFirst({
      where: { id: checklistId, organizationId: dbOrgId },
      include: { items: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 } },
    })
    if (!checklist) return { success: false, error: "Checklist not found" }

    const nextOrder = (checklist.items[0]?.sortOrder ?? 0) + 1

    await db.checklistItem.create({
      data: {
        description,
        sortOrder: nextOrder,
        checklistId,
        standardClauseId: standardClauseId || null,
      },
    })

    await recalculateCompletion(checklistId)

    logAuditEvent({
      action: "ADD_ITEM",
      entityType: "Checklist",
      entityId: checklistId,
      metadata: { description },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/checklists/${checklistId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add item" }
  }
}

export async function getStandards() {
  return db.standard.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  })
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
