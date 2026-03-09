"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import type { ActionResult } from "@/types"

const objectiveSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  targetValue: z.coerce.number().positive("Target must be positive"),
  unit: z.string().max(50).optional(),
  measurementFrequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]),
  dueDate: z.coerce.date().optional(),
  standardId: z.string().optional(),
  standardClauseId: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
})

export type ObjectiveFormValues = z.infer<typeof objectiveSchema>

const measurementSchema = z.object({
  value: z.coerce.number(),
  notes: z.string().max(500).optional(),
  measuredAt: z.coerce.date().optional(),
})

export type MeasurementFormValues = z.infer<typeof measurementSchema>

const PAGE_SIZE = 50

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export async function getObjectives(page = 1) {
  const { dbOrgId } = await getAuthContext()

  const where = { organizationId: dbOrgId }

  const [objectives, total] = await Promise.all([
    db.objective.findMany({
      where,
      include: {
        standard: { select: { id: true, code: true, name: true } },
        standardClause: { select: { id: true, clauseNumber: true, title: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { measurements: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.objective.count({ where }),
  ])

  return {
    objectives,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getObjective(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.objective.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      standard: { select: { id: true, code: true, name: true } },
      standardClause: { select: { id: true, clauseNumber: true, title: true } },
      owner: { select: { id: true, firstName: true, lastName: true } },
      measurements: {
        orderBy: { measuredAt: "desc" },
        include: {
          recordedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  })
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createObjective(values: ObjectiveFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = objectiveSchema.parse(values)

    const objective = await db.objective.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        targetValue: parsed.targetValue,
        unit: parsed.unit || null,
        measurementFrequency: parsed.measurementFrequency,
        dueDate: parsed.dueDate || null,
        standardId: parsed.standardId || null,
        standardClauseId: parsed.standardClauseId || null,
        ownerId: parsed.ownerId,
        organizationId: dbOrgId,
        status: "ACTIVE",
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Objective",
      entityId: objective.id,
      metadata: { title: objective.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/objectives")
    revalidatePath("/dashboard")
    return { success: true, data: { id: objective.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create objective" }
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateObjective(id: string, values: ObjectiveFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = objectiveSchema.parse(values)

    const existing = await db.objective.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Objective not found" }

    await db.objective.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description,
        targetValue: parsed.targetValue,
        unit: parsed.unit || null,
        measurementFrequency: parsed.measurementFrequency,
        dueDate: parsed.dueDate || null,
        standardId: parsed.standardId || null,
        standardClauseId: parsed.standardClauseId || null,
        ownerId: parsed.ownerId,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Objective",
      entityId: id,
      metadata: { title: parsed.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/objectives")
    revalidatePath(`/objectives/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update objective" }
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deleteObjective(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.objective.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Objective not found" }

    await db.objective.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "Objective",
      entityId: id,
      metadata: { title: existing.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/objectives")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete objective" }
  }
}

// ─────────────────────────────────────────────
// CANCEL
// ─────────────────────────────────────────────

export async function cancelObjective(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.objective.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Objective not found" }
    if (existing.status === "CANCELLED") return { success: false, error: "Already cancelled" }

    await db.objective.update({ where: { id }, data: { status: "CANCELLED" } })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Objective",
      entityId: id,
      metadata: { title: existing.title, action: "cancelled" },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/objectives")
    revalidatePath(`/objectives/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to cancel objective" }
  }
}

// ─────────────────────────────────────────────
// MEASUREMENTS
// ─────────────────────────────────────────────

export async function addMeasurement(objectiveId: string, values: MeasurementFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = measurementSchema.parse(values)

    const objective = await db.objective.findFirst({ where: { id: objectiveId, organizationId: dbOrgId } })
    if (!objective) return { success: false, error: "Objective not found" }

    await db.$transaction(async (tx) => {
      await tx.objectiveMeasurement.create({
        data: {
          value: parsed.value,
          notes: parsed.notes || null,
          measuredAt: parsed.measuredAt || new Date(),
          objectiveId,
          recordedById: dbUserId,
        },
      })

      // Update currentValue to latest measurement
      await tx.objective.update({
        where: { id: objectiveId },
        data: { currentValue: parsed.value },
      })
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Objective",
      entityId: objectiveId,
      metadata: { title: objective.title, measurement: parsed.value, unit: objective.unit },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/objectives/${objectiveId}`)
    revalidatePath("/objectives")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to record measurement" }
  }
}

// ─────────────────────────────────────────────
// DASHBOARD / HELPERS
// ─────────────────────────────────────────────

export async function getObjectiveSummary() {
  const { dbOrgId } = await getAuthContext()

  const objectives = await db.objective.findMany({
    where: { organizationId: dbOrgId, status: { notIn: ["DRAFT", "CANCELLED"] } },
    select: {
      id: true,
      title: true,
      currentValue: true,
      targetValue: true,
      unit: true,
      dueDate: true,
      createdAt: true,
      status: true,
    },
  })

  return objectives
}

export async function getStandardsForObjectives() {
  const { dbOrgId } = await getAuthContext()

  // Get standards the org uses (has assessments or checklists for)
  const standards = await db.standard.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  })

  return standards
}

export async function getClausesForStandard(standardId: string) {
  return db.standardClause.findMany({
    where: { standardId },
    select: { id: true, clauseNumber: true, title: true },
    orderBy: { clauseNumber: "asc" },
  })
}

export async function getMembers() {
  const { dbOrgId } = await getAuthContext()
  const orgUsers = await db.organizationUser.findMany({
    where: { organizationId: dbOrgId, isActive: true },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  })
  return orgUsers.map((ou) => ({
    id: ou.user.id,
    name: `${ou.user.firstName} ${ou.user.lastName}`,
  }))
}
