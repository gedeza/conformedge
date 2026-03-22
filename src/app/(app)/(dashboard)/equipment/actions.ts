"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import type { ActionResult } from "@/types"

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(5000).optional(),
  category: z.string().min(1, "Category is required"),
  manufacturer: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  serialNumber: z.string().max(200).optional(),
  location: z.string().max(500).optional(),
  swl: z.string().max(100).optional(),
  ceMarking: z.boolean().default(false),
  purchaseDate: z.coerce.date().optional(),
  commissionDate: z.coerce.date().optional(),
  warrantyExpiry: z.coerce.date().optional(),
  projectId: z.string().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  notes: z.string().max(5000).optional(),
})

export type EquipmentFormValues = z.infer<typeof equipmentSchema>

const PAGE_SIZE = 50

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

async function generateAssetNumber(orgId: string): Promise<string> {
  const lastEquipment = await db.equipment.findFirst({
    where: { organizationId: orgId },
    orderBy: { assetNumber: "desc" },
    select: { assetNumber: true },
  })

  if (!lastEquipment) return "EQ-001"

  const match = lastEquipment.assetNumber.match(/EQ-(\d+)/)
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1
  return `EQ-${String(nextNum).padStart(3, "0")}`
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export async function getEquipment(page = 1, filters?: { status?: string; category?: string }) {
  const { dbOrgId } = await getAuthContext()

  const where: Record<string, unknown> = { organizationId: dbOrgId }
  if (filters?.status) where.status = filters.status
  if (filters?.category) where.category = filters.category

  const [equipment, total] = await Promise.all([
    db.equipment.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        _count: {
          select: {
            calibrationRecords: true,
            maintenanceRecords: true,
            repairRecords: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.equipment.count({ where }),
  ])

  return {
    equipment,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getEquipmentDetail(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.equipment.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      project: { select: { id: true, name: true } },
      calibrationRecords: {
        include: { recordedBy: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { calibrationDate: "desc" },
      },
      maintenanceRecords: {
        include: { recordedBy: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { scheduledDate: "desc" },
      },
      repairRecords: {
        include: {
          recordedBy: { select: { id: true, firstName: true, lastName: true } },
          capa: { select: { id: true, title: true, status: true } },
        },
        orderBy: { repairDate: "desc" },
      },
    },
  })
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createEquipment(values: EquipmentFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "equipmentManagement")
    if (!access.allowed) return { success: false, error: access.reason ?? "Equipment management requires a Professional plan or higher." }

    const parsed = equipmentSchema.parse(values)
    const assetNumber = await generateAssetNumber(dbOrgId)

    const equipment = await db.equipment.create({
      data: {
        assetNumber,
        name: parsed.name,
        description: parsed.description || null,
        category: parsed.category,
        manufacturer: parsed.manufacturer || null,
        model: parsed.model || null,
        serialNumber: parsed.serialNumber || null,
        location: parsed.location || null,
        swl: parsed.swl || null,
        ceMarking: parsed.ceMarking,
        purchaseDate: parsed.purchaseDate || null,
        commissionDate: parsed.commissionDate || null,
        warrantyExpiry: parsed.warrantyExpiry || null,
        projectId: parsed.projectId || null,
        specifications: parsed.specifications ?? undefined,
        notes: parsed.notes || null,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Equipment",
      entityId: equipment.id,
      metadata: {
        assetNumber: equipment.assetNumber,
        name: equipment.name,
        category: equipment.category,
      },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/equipment")
    revalidatePath("/dashboard")
    return { success: true, data: { id: equipment.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create equipment" }
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateEquipment(id: string, values: EquipmentFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.equipment.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Equipment not found" }

    const parsed = equipmentSchema.parse(values)

    await db.equipment.update({
      where: { id },
      data: {
        name: parsed.name,
        description: parsed.description || null,
        category: parsed.category,
        manufacturer: parsed.manufacturer || null,
        model: parsed.model || null,
        serialNumber: parsed.serialNumber || null,
        location: parsed.location || null,
        swl: parsed.swl || null,
        ceMarking: parsed.ceMarking,
        purchaseDate: parsed.purchaseDate || null,
        commissionDate: parsed.commissionDate || null,
        warrantyExpiry: parsed.warrantyExpiry || null,
        projectId: parsed.projectId || null,
        specifications: parsed.specifications ?? undefined,
        notes: parsed.notes || null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Equipment",
      entityId: id,
      metadata: { name: parsed.name, category: parsed.category },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/equipment")
    revalidatePath(`/equipment/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update equipment" }
  }
}

// ─────────────────────────────────────────────
// DELETE (soft — decommission)
// ─────────────────────────────────────────────

export async function deleteEquipment(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.equipment.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Equipment not found" }

    await db.equipment.update({
      where: { id },
      data: { status: "DECOMMISSIONED", decommissionDate: new Date() },
    })

    logAuditEvent({
      action: "DELETE",
      entityType: "Equipment",
      entityId: id,
      metadata: { name: existing.name, assetNumber: existing.assetNumber },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/equipment")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to decommission equipment" }
  }
}

// ─────────────────────────────────────────────
// STATUS TRANSITIONS
// ─────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  ACTIVE: ["INACTIVE", "UNDER_REPAIR", "QUARANTINED", "DECOMMISSIONED"],
  INACTIVE: ["ACTIVE", "DECOMMISSIONED"],
  UNDER_REPAIR: ["ACTIVE", "QUARANTINED", "DECOMMISSIONED"],
  QUARANTINED: ["ACTIVE", "UNDER_REPAIR", "DECOMMISSIONED"],
  DECOMMISSIONED: [],
}

export async function updateEquipmentStatus(id: string, newStatus: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.equipment.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Equipment not found" }

    const allowed = VALID_TRANSITIONS[existing.status] || []
    if (!allowed.includes(newStatus)) {
      return { success: false, error: `Cannot transition from ${existing.status} to ${newStatus}` }
    }

    const data: Record<string, unknown> = { status: newStatus }
    if (newStatus === "DECOMMISSIONED") data.decommissionDate = new Date()

    await db.equipment.update({ where: { id }, data })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Equipment",
      entityId: id,
      metadata: { name: existing.name, transition: `${existing.status} → ${newStatus}` },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/equipment")
    revalidatePath(`/equipment/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update status" }
  }
}

// ─────────────────────────────────────────────
// DASHBOARD METRICS
// ─────────────────────────────────────────────

export async function getEquipmentMetrics() {
  const { dbOrgId } = await getAuthContext()
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [totalActive, underRepair, quarantined, overdueCalibrations, upcomingMaintenance] = await Promise.all([
    db.equipment.count({ where: { organizationId: dbOrgId, status: "ACTIVE" } }),
    db.equipment.count({ where: { organizationId: dbOrgId, status: "UNDER_REPAIR" } }),
    db.equipment.count({ where: { organizationId: dbOrgId, status: "QUARANTINED" } }),
    db.equipment.count({
      where: { organizationId: dbOrgId, status: "ACTIVE", nextCalibrationDue: { lt: now } },
    }),
    db.maintenanceRecord.count({
      where: {
        organizationId: dbOrgId,
        status: "SCHEDULED",
        scheduledDate: { lte: thirtyDaysFromNow },
      },
    }),
  ])

  return { totalActive, underRepair, quarantined, overdueCalibrations, upcomingMaintenance }
}

// ─────────────────────────────────────────────
// CALIBRATION RECORDS
// ─────────────────────────────────────────────

const calibrationSchema = z.object({
  calibrationDate: z.coerce.date(),
  nextDueDate: z.coerce.date(),
  certificateNumber: z.string().max(200).optional(),
  calibratedBy: z.string().min(1, "Calibrated by is required").max(200),
  result: z.enum(["PASS", "FAIL", "CONDITIONAL"]),
  deviation: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
})

export type CalibrationFormValues = z.infer<typeof calibrationSchema>

export async function addCalibrationRecord(equipmentId: string, values: CalibrationFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    const equipment = await db.equipment.findFirst({ where: { id: equipmentId, organizationId: dbOrgId } })
    if (!equipment) return { success: false, error: "Equipment not found" }

    const parsed = calibrationSchema.parse(values)

    const record = await db.calibrationRecord.create({
      data: {
        equipmentId,
        calibrationDate: parsed.calibrationDate,
        nextDueDate: parsed.nextDueDate,
        certificateNumber: parsed.certificateNumber || null,
        calibratedBy: parsed.calibratedBy,
        result: parsed.result,
        deviation: parsed.deviation || null,
        notes: parsed.notes || null,
        organizationId: dbOrgId,
        recordedById: dbUserId,
      },
    })

    // Update equipment's next calibration due date
    await db.equipment.update({
      where: { id: equipmentId },
      data: { nextCalibrationDue: parsed.nextDueDate },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "CalibrationRecord",
      entityId: record.id,
      metadata: { equipmentName: equipment.name, result: parsed.result, calibratedBy: parsed.calibratedBy },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/equipment/${equipmentId}`)
    revalidatePath("/equipment")
    return { success: true, data: { id: record.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add calibration record" }
  }
}

export async function deleteCalibrationRecord(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const record = await db.calibrationRecord.findFirst({
      where: { id, organizationId: dbOrgId },
      include: { equipment: { select: { id: true, name: true } } },
    })
    if (!record) return { success: false, error: "Record not found" }

    await db.calibrationRecord.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "CalibrationRecord",
      entityId: id,
      metadata: { equipmentName: record.equipment.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/equipment/${record.equipmentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete calibration record" }
  }
}

// ─────────────────────────────────────────────
// MAINTENANCE RECORDS
// ─────────────────────────────────────────────

const maintenanceSchema = z.object({
  scheduledDate: z.coerce.date(),
  maintenanceType: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required").max(5000),
  performedBy: z.string().max(200).optional(),
  cost: z.coerce.number().min(0).optional(),
  notes: z.string().max(5000).optional(),
})

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>

export async function addMaintenanceRecord(equipmentId: string, values: MaintenanceFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    const equipment = await db.equipment.findFirst({ where: { id: equipmentId, organizationId: dbOrgId } })
    if (!equipment) return { success: false, error: "Equipment not found" }

    const parsed = maintenanceSchema.parse(values)

    const record = await db.maintenanceRecord.create({
      data: {
        equipmentId,
        scheduledDate: parsed.scheduledDate,
        maintenanceType: parsed.maintenanceType,
        description: parsed.description,
        performedBy: parsed.performedBy || null,
        cost: parsed.cost ?? null,
        notes: parsed.notes || null,
        organizationId: dbOrgId,
        recordedById: dbUserId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "MaintenanceRecord",
      entityId: record.id,
      metadata: { equipmentName: equipment.name, type: parsed.maintenanceType },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/equipment/${equipmentId}`)
    return { success: true, data: { id: record.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add maintenance record" }
  }
}

export async function updateMaintenanceStatus(id: string, status: string, completedDate?: Date): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const record = await db.maintenanceRecord.findFirst({
      where: { id, organizationId: dbOrgId },
      include: { equipment: { select: { id: true, name: true } } },
    })
    if (!record) return { success: false, error: "Record not found" }

    const data: Record<string, unknown> = { status }
    if (status === "COMPLETE") data.completedDate = completedDate || new Date()

    await db.maintenanceRecord.update({ where: { id }, data })

    logAuditEvent({
      action: "UPDATE",
      entityType: "MaintenanceRecord",
      entityId: id,
      metadata: { equipmentName: record.equipment.name, transition: `${record.status} → ${status}` },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/equipment/${record.equipmentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update maintenance status" }
  }
}

export async function deleteMaintenanceRecord(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const record = await db.maintenanceRecord.findFirst({
      where: { id, organizationId: dbOrgId },
      include: { equipment: { select: { id: true, name: true } } },
    })
    if (!record) return { success: false, error: "Record not found" }

    await db.maintenanceRecord.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "MaintenanceRecord",
      entityId: id,
      metadata: { equipmentName: record.equipment.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/equipment/${record.equipmentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete maintenance record" }
  }
}

// ─────────────────────────────────────────────
// REPAIR RECORDS
// ─────────────────────────────────────────────

const repairSchema = z.object({
  repairDate: z.coerce.date(),
  description: z.string().min(1, "Description is required").max(5000),
  supplierName: z.string().min(1, "Supplier is required").max(200),
  supplierReference: z.string().max(200).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]).default("MEDIUM"),
  cost: z.coerce.number().min(0).optional(),
  verifiedBy: z.string().max(200).optional(),
  verificationNotes: z.string().max(5000).optional(),
  returnToServiceDate: z.coerce.date().optional(),
})

export type RepairFormValues = z.infer<typeof repairSchema>

export async function addRepairRecord(equipmentId: string, values: RepairFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    const equipment = await db.equipment.findFirst({ where: { id: equipmentId, organizationId: dbOrgId } })
    if (!equipment) return { success: false, error: "Equipment not found" }

    const parsed = repairSchema.parse(values)

    const record = await db.repairRecord.create({
      data: {
        equipmentId,
        repairDate: parsed.repairDate,
        description: parsed.description,
        supplierName: parsed.supplierName,
        supplierReference: parsed.supplierReference || null,
        priority: parsed.priority,
        cost: parsed.cost ?? null,
        verifiedBy: parsed.verifiedBy || null,
        verificationNotes: parsed.verificationNotes || null,
        returnToServiceDate: parsed.returnToServiceDate || null,
        organizationId: dbOrgId,
        recordedById: dbUserId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "RepairRecord",
      entityId: record.id,
      metadata: { equipmentName: equipment.name, supplier: parsed.supplierName, priority: parsed.priority },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/equipment/${equipmentId}`)
    return { success: true, data: { id: record.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add repair record" }
  }
}

export async function deleteRepairRecord(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const record = await db.repairRecord.findFirst({
      where: { id, organizationId: dbOrgId },
      include: { equipment: { select: { id: true, name: true } } },
    })
    if (!record) return { success: false, error: "Record not found" }

    await db.repairRecord.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "RepairRecord",
      entityId: id,
      metadata: { equipmentName: record.equipment.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/equipment/${record.equipmentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete repair record" }
  }
}

// ─────────────────────────────────────────────
// HELPER QUERIES
// ─────────────────────────────────────────────

export async function getProjectOptions() {
  const { dbOrgId } = await getAuthContext()
  return db.project.findMany({
    where: { organizationId: dbOrgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
