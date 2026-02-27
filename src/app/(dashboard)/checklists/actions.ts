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

const PAGE_SIZE = 50

export async function getChecklists(page = 1) {
  const { dbOrgId } = await getAuthContext()

  const where = { organizationId: dbOrgId }

  const [checklists, total] = await Promise.all([
    db.complianceChecklist.findMany({
      where,
      include: {
        standard: { select: { id: true, code: true, name: true } },
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.complianceChecklist.count({ where }),
  ])

  return {
    checklists,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
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
          standardClause: { select: { clauseNumber: true, title: true, description: true } },
          capa: { select: { id: true, title: true, status: true, priority: true } },
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

export async function raiseCapaFromItem(
  itemId: string,
  checklistId: string
): Promise<ActionResult<{ capaId: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    const checklist = await db.complianceChecklist.findFirst({
      where: { id: checklistId, organizationId: dbOrgId },
      include: {
        standard: { select: { code: true, name: true } },
        project: { select: { id: true } },
      },
    })
    if (!checklist) return { success: false, error: "Checklist not found" }

    const item = await db.checklistItem.findFirst({
      where: { id: itemId, checklistId },
      include: { standardClause: { select: { clauseNumber: true, title: true } } },
    })
    if (!item) return { success: false, error: "Item not found" }
    if (item.isCompliant !== false) return { success: false, error: "Item is not non-compliant" }
    if (item.capaId) return { success: false, error: "Item already has a linked CAPA" }

    const clauseRef = item.standardClause
      ? ` (${checklist.standard.code} §${item.standardClause.clauseNumber})`
      : ""

    const capa = await db.capa.create({
      data: {
        title: `Non-compliance: ${item.description}`.slice(0, 200),
        description: `Raised from checklist "${checklist.title}"${clauseRef}.\n\nFinding: ${item.description}${item.evidence ? `\n\nEvidence: ${item.evidence}` : ""}`,
        type: "CORRECTIVE",
        priority: "MEDIUM",
        projectId: checklist.projectId,
        raisedById: dbUserId,
        organizationId: dbOrgId,
      },
    })

    await db.checklistItem.update({
      where: { id: itemId },
      data: { capaId: capa.id },
    })

    logAuditEvent({
      action: "RAISE_CAPA",
      entityType: "Checklist",
      entityId: checklistId,
      metadata: { itemId, capaId: capa.id, itemDescription: item.description },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/checklists/${checklistId}`)
    revalidatePath("/capas")
    return { success: true, data: { capaId: capa.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to raise CAPA" }
  }
}

// ── Template Actions ──────────────────────────────

export async function getTemplates() {
  const { dbOrgId } = await getAuthContext()

  return db.checklistTemplate.findMany({
    where: { organizationId: dbOrgId },
    include: {
      standard: { select: { id: true, code: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function saveChecklistAsTemplate(
  checklistId: string,
  name: string,
  description?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    const checklist = await db.complianceChecklist.findFirst({
      where: { id: checklistId, organizationId: dbOrgId },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: { standardClause: { select: { clauseNumber: true } } },
        },
      },
    })
    if (!checklist) return { success: false, error: "Checklist not found" }
    if (checklist.items.length === 0) return { success: false, error: "Checklist has no items" }

    const templateItems = checklist.items.map((item) => ({
      description: item.description,
      clauseNumber: item.standardClause?.clauseNumber ?? undefined,
      standardClauseId: item.standardClauseId ?? undefined,
    }))

    const template = await db.checklistTemplate.create({
      data: {
        name,
        description,
        standardId: checklist.standardId,
        items: templateItems,
        organizationId: dbOrgId,
        createdById: dbUserId,
      },
    })

    logAuditEvent({
      action: "CREATE_TEMPLATE",
      entityType: "Checklist",
      entityId: template.id,
      metadata: { name, sourceChecklistId: checklistId, itemCount: templateItems.length },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/checklists")
    return { success: true, data: { id: template.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to save template" }
  }
}

export async function createChecklistFromTemplate(
  templateId: string,
  values: ChecklistFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    const template = await db.checklistTemplate.findFirst({
      where: { id: templateId, organizationId: dbOrgId },
    })
    if (!template) return { success: false, error: "Template not found" }

    const parsed = checklistSchema.parse(values)

    const checklist = await db.complianceChecklist.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        standardId: template.standardId,
        projectId: parsed.projectId || null,
        assignedToId: parsed.assignedToId || null,
        organizationId: dbOrgId,
      },
    })

    const templateItems = template.items as Array<{
      description: string
      clauseNumber?: string
      standardClauseId?: string
    }>

    if (templateItems.length > 0) {
      await db.checklistItem.createMany({
        data: templateItems.map((item, index) => ({
          description: item.description,
          sortOrder: index + 1,
          checklistId: checklist.id,
          standardClauseId: item.standardClauseId || null,
        })),
      })
    }

    logAuditEvent({
      action: "CREATE_FROM_TEMPLATE",
      entityType: "Checklist",
      entityId: checklist.id,
      metadata: { title: checklist.title, templateId, templateName: template.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/checklists")
    return { success: true, data: { id: checklist.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create from template" }
  }
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const template = await db.checklistTemplate.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!template) return { success: false, error: "Template not found" }

    await db.checklistTemplate.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE_TEMPLATE",
      entityType: "Checklist",
      entityId: id,
      metadata: { name: template.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/checklists")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete template" }
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
