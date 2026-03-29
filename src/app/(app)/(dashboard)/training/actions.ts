"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { trainingSchema, type TrainingFormValues } from "./schema"
import type { ActionResult } from "@/types"

const PAGE_SIZE = 50

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

export async function getTrainingRecords(page = 1, filters?: {
  category?: string
  status?: string
  traineeId?: string
  siteId?: string | null
}) {
  const { dbOrgId } = await getAuthContext()

  const where: Record<string, unknown> = { organizationId: dbOrgId }
  if (filters?.category) where.category = filters.category
  if (filters?.status) where.status = filters.status
  if (filters?.traineeId) where.traineeId = filters.traineeId
  if (filters?.siteId) where.siteId = filters.siteId

  const [records, total] = await Promise.all([
    db.trainingRecord.findMany({
      where,
      include: {
        trainee: { select: { id: true, firstName: true, lastName: true, email: true } },
        site: { select: { id: true, name: true, code: true } },
      },
      orderBy: { trainingDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.trainingRecord.count({ where }),
  ])

  return {
    records,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getTrainingRecord(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.trainingRecord.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      trainee: { select: { id: true, firstName: true, lastName: true, email: true } },
      site: { select: { id: true, name: true, code: true } },
      recordedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })
}

export async function getTrainingStats() {
  const { dbOrgId } = await getAuthContext()
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [total, completed, expired, expiring, byCategory] = await Promise.all([
    db.trainingRecord.count({ where: { organizationId: dbOrgId } }),
    db.trainingRecord.count({ where: { organizationId: dbOrgId, status: "COMPLETED" } }),
    db.trainingRecord.count({ where: { organizationId: dbOrgId, status: "EXPIRED" } }),
    db.trainingRecord.count({
      where: {
        organizationId: dbOrgId,
        status: "COMPLETED",
        expiryDate: { gte: now, lte: thirtyDaysFromNow },
      },
    }),
    db.trainingRecord.groupBy({
      by: ["category"],
      where: { organizationId: dbOrgId },
      _count: true,
    }),
  ])

  return { total, completed, expired, expiring, byCategory }
}

export async function getTrainingOptions() {
  const { dbOrgId } = await getAuthContext()

  const [members, sites] = await Promise.all([
    db.organizationUser.findMany({
      where: { organizationId: dbOrgId, isActive: true },
      select: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { user: { firstName: "asc" } },
    }),
    db.site.findMany({
      where: { organizationId: dbOrgId, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
  ])

  return {
    members: members.map((m) => m.user),
    sites,
  }
}

export async function getCompetencyMatrix() {
  const { dbOrgId } = await getAuthContext()

  const [members, records] = await Promise.all([
    db.organizationUser.findMany({
      where: { organizationId: dbOrgId, isActive: true },
      select: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { user: { firstName: "asc" } },
    }),
    db.trainingRecord.findMany({
      where: { organizationId: dbOrgId },
      select: {
        traineeId: true,
        category: true,
        status: true,
        expiryDate: true,
        trainingDate: true,
      },
      orderBy: { trainingDate: "desc" },
    }),
  ])

  // Build matrix: for each employee × category, find latest training
  const now = new Date()
  const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  type CellStatus = "current" | "expiring" | "expired" | "not_assessed"

  const matrix = members.map((m) => {
    const userId = m.user.id
    const userRecords = records.filter((r) => r.traineeId === userId)

    const categories: Record<string, CellStatus> = {}
    const categoryList = [
      "INDUCTION", "FIRST_AID", "FIRE_FIGHTING", "WORKING_AT_HEIGHTS",
      "SCAFFOLDING", "CRANE_OPERATOR", "FORKLIFT_OPERATOR", "CONFINED_SPACE",
      "HAZARDOUS_CHEMICALS", "ELECTRICAL", "EXCAVATION", "H_AND_S_REPRESENTATIVE",
    ]

    for (const cat of categoryList) {
      const catRecords = userRecords.filter((r) => r.category === cat)
      if (catRecords.length === 0) {
        categories[cat] = "not_assessed"
        continue
      }

      // Use the latest record
      const latest = catRecords[0]
      if (latest.status === "EXPIRED") {
        categories[cat] = "expired"
      } else if (latest.expiryDate && latest.expiryDate <= sixtyDays) {
        categories[cat] = latest.expiryDate <= now ? "expired" : "expiring"
      } else {
        categories[cat] = "current"
      }
    }

    return {
      userId,
      name: `${m.user.firstName} ${m.user.lastName}`,
      categories,
    }
  })

  return matrix
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

export async function createTrainingRecord(values: TrainingFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbOrgId, dbUserId, role } = await getAuthContext()

    if (!canCreate(role)) {
      return { success: false, error: "Insufficient permissions" }
    }

    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "trainingRecords")
    if (!access.allowed) {
      return { success: false, error: access.reason ?? "Training Records requires Professional plan or higher" }
    }

    const parsed = trainingSchema.parse(values)

    const record = await db.trainingRecord.create({
      data: {
        title: parsed.title,
        category: parsed.category as any,
        status: parsed.expiryDate && parsed.expiryDate < new Date() ? "EXPIRED" : parsed.certificateNumber ? "COMPLETED" : "PLANNED",
        description: parsed.description ?? null,
        trainingDate: parsed.trainingDate,
        duration: parsed.duration ?? null,
        location: parsed.location ?? null,
        trainerName: parsed.trainerName ?? null,
        trainerAccreditation: parsed.trainerAccreditation ?? null,
        trainingProvider: parsed.trainingProvider ?? null,
        providerAccreditationNo: parsed.providerAccreditationNo ?? null,
        certificateNumber: parsed.certificateNumber ?? null,
        certificateFileKey: parsed.certificateFileKey ?? null,
        certificateFileName: parsed.certificateFileName ?? null,
        issuedDate: parsed.issuedDate ?? null,
        expiryDate: parsed.expiryDate ?? null,
        assessmentResult: parsed.assessmentResult ?? null,
        saqaUnitStandard: parsed.saqaUnitStandard ?? null,
        nqfLevel: parsed.nqfLevel ?? null,
        notes: parsed.notes ?? null,
        traineeId: parsed.traineeId,
        organizationId: dbOrgId,
        siteId: parsed.siteId ?? null,
        recordedById: dbUserId,
      },
    })

    logAuditEvent({
      action: "CREATED",
      entityType: "TRAINING",
      entityId: record.id,
      userId: dbUserId,
      organizationId: dbOrgId,
      metadata: { title: record.title, category: record.category, traineeId: record.traineeId },
    })

    revalidatePath("/training")
    return { success: true, data: { id: record.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create training record" }
  }
}

export async function updateTrainingRecord(id: string, values: TrainingFormValues): Promise<ActionResult> {
  try {
    const { dbOrgId, dbUserId, role } = await getAuthContext()

    if (!canEdit(role)) {
      return { success: false, error: "Insufficient permissions" }
    }

    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "trainingRecords")
    if (!access.allowed) {
      return { success: false, error: access.reason ?? "Training Records requires Professional plan or higher" }
    }

    const existing = await db.trainingRecord.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!existing) {
      return { success: false, error: "Training record not found" }
    }

    const parsed = trainingSchema.parse(values)

    await db.trainingRecord.update({
      where: { id },
      data: {
        title: parsed.title,
        category: parsed.category as any,
        status: parsed.expiryDate && parsed.expiryDate < new Date() ? "EXPIRED" : parsed.certificateNumber ? "COMPLETED" : "PLANNED",
        description: parsed.description ?? null,
        trainingDate: parsed.trainingDate,
        duration: parsed.duration ?? null,
        location: parsed.location ?? null,
        trainerName: parsed.trainerName ?? null,
        trainerAccreditation: parsed.trainerAccreditation ?? null,
        trainingProvider: parsed.trainingProvider ?? null,
        providerAccreditationNo: parsed.providerAccreditationNo ?? null,
        certificateNumber: parsed.certificateNumber ?? null,
        certificateFileKey: parsed.certificateFileKey ?? null,
        certificateFileName: parsed.certificateFileName ?? null,
        issuedDate: parsed.issuedDate ?? null,
        expiryDate: parsed.expiryDate ?? null,
        assessmentResult: parsed.assessmentResult ?? null,
        saqaUnitStandard: parsed.saqaUnitStandard ?? null,
        nqfLevel: parsed.nqfLevel ?? null,
        notes: parsed.notes ?? null,
        traineeId: parsed.traineeId,
        siteId: parsed.siteId ?? null,
      },
    })

    logAuditEvent({
      action: "UPDATED",
      entityType: "TRAINING",
      entityId: id,
      userId: dbUserId,
      organizationId: dbOrgId,
      metadata: { title: parsed.title, category: parsed.category },
    })

    revalidatePath("/training")
    revalidatePath(`/training/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update training record" }
  }
}

export async function deleteTrainingRecord(id: string): Promise<ActionResult> {
  try {
    const { dbOrgId, dbUserId, role } = await getAuthContext()

    if (!canDelete(role)) {
      return { success: false, error: "Insufficient permissions" }
    }

    const record = await db.trainingRecord.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!record) {
      return { success: false, error: "Training record not found" }
    }

    await db.trainingRecord.update({
      where: { id },
      data: { status: "REVOKED" },
    })

    logAuditEvent({
      action: "DELETED",
      entityType: "TRAINING",
      entityId: id,
      userId: dbUserId,
      organizationId: dbOrgId,
      metadata: { title: record.title, category: record.category },
    })

    revalidatePath("/training")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete training record" }
  }
}
