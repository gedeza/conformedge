"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { notifyOrgMembers } from "@/lib/notifications"
import type { ActionResult } from "@/types"

const permitSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  permitType: z.enum(["HOT_WORK", "CONFINED_SPACE", "WORKING_AT_HEIGHTS", "ELECTRICAL", "EXCAVATION", "LIFTING", "GENERAL"]),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  location: z.string().min(1, "Location is required").max(500),
  description: z.string().min(1, "Description is required").max(5000),
  hazardsIdentified: z.string().max(5000).optional(),
  precautions: z.string().max(5000).optional(),
  ppeRequirements: z.string().max(2000).optional(),
  emergencyProcedures: z.string().max(5000).optional(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  projectId: z.string().optional(),
  issuedById: z.string().optional(),
  checklistItems: z.array(z.string().min(1)).optional(),
})

export type PermitFormValues = z.infer<typeof permitSchema>

const extensionSchema = z.object({
  newValidTo: z.coerce.date(),
  reason: z.string().min(1, "Reason is required").max(2000),
})

export type ExtensionFormValues = z.infer<typeof extensionSchema>

const PAGE_SIZE = 50

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING_APPROVAL", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "DRAFT"],
  APPROVED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["SUSPENDED", "CLOSED", "CANCELLED"],
  SUSPENDED: ["ACTIVE", "CANCELLED", "CLOSED"],
  CLOSED: [],
  CANCELLED: [],
  EXPIRED: [],
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export async function getPermits(page = 1) {
  const { dbOrgId } = await getAuthContext()
  const where = { organizationId: dbOrgId }

  const [permits, total] = await Promise.all([
    db.workPermit.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
        issuedBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { checklistItems: true, extensions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.workPermit.count({ where }),
  ])

  return {
    permits,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getPermit(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.workPermit.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      project: { select: { id: true, name: true } },
      requestedBy: { select: { id: true, firstName: true, lastName: true } },
      issuedBy: { select: { id: true, firstName: true, lastName: true } },
      checklistItems: {
        orderBy: { sortOrder: "asc" },
        include: { checkedBy: { select: { id: true, firstName: true, lastName: true } } },
      },
      extensions: {
        orderBy: { createdAt: "desc" },
        include: {
          requestedBy: { select: { id: true, firstName: true, lastName: true } },
          reviewedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  })
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createPermit(values: PermitFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = permitSchema.parse(values)

    if (parsed.validTo <= parsed.validFrom) {
      return { success: false, error: "Valid To must be after Valid From" }
    }

    const permit = await db.$transaction(async (tx) => {
      // Generate permit number with collision-safe approach
      const year = new Date().getFullYear()
      const lastPermit = await tx.workPermit.findFirst({
        where: { organizationId: dbOrgId },
        orderBy: { createdAt: "desc" },
        select: { permitNumber: true },
      })
      // Extract sequence from last permit number (e.g. PTW-2026-0042 → 42)
      let seq = 1
      if (lastPermit?.permitNumber) {
        const match = lastPermit.permitNumber.match(/(\d+)$/)
        if (match) seq = parseInt(match[1], 10) + 1
      }
      const permitNumber = `PTW-${year}-${seq.toString().padStart(4, "0")}`

      const p = await tx.workPermit.create({
        data: {
          permitNumber,
          title: parsed.title,
          permitType: parsed.permitType,
          riskLevel: parsed.riskLevel,
          location: parsed.location,
          description: parsed.description,
          hazardsIdentified: parsed.hazardsIdentified || null,
          precautions: parsed.precautions || null,
          ppeRequirements: parsed.ppeRequirements || null,
          emergencyProcedures: parsed.emergencyProcedures || null,
          validFrom: parsed.validFrom,
          validTo: parsed.validTo,
          projectId: parsed.projectId || null,
          issuedById: parsed.issuedById || null,
          requestedById: dbUserId,
          organizationId: dbOrgId,
        },
      })

      // Create checklist items
      if (parsed.checklistItems && parsed.checklistItems.length > 0) {
        await tx.workPermitChecklist.createMany({
          data: parsed.checklistItems.map((desc, index) => ({
            description: desc,
            sortOrder: index + 1,
            permitId: p.id,
          })),
        })
      }

      return p
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "WorkPermit",
      entityId: permit.id,
      metadata: { title: permit.title, type: permit.permitType, permitNumber: permit.permitNumber },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/permits")
    revalidatePath("/dashboard")
    return { success: true, data: { id: permit.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create permit" }
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updatePermit(id: string, values: PermitFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = permitSchema.parse(values)

    const existing = await db.workPermit.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Permit not found" }
    if (existing.status !== "DRAFT") return { success: false, error: "Only draft permits can be edited" }

    if (parsed.validTo <= parsed.validFrom) {
      return { success: false, error: "Valid To must be after Valid From" }
    }

    await db.$transaction(async (tx) => {
      await tx.workPermit.update({
        where: { id },
        data: {
          title: parsed.title,
          permitType: parsed.permitType,
          riskLevel: parsed.riskLevel,
          location: parsed.location,
          description: parsed.description,
          hazardsIdentified: parsed.hazardsIdentified || null,
          precautions: parsed.precautions || null,
          ppeRequirements: parsed.ppeRequirements || null,
          emergencyProcedures: parsed.emergencyProcedures || null,
          validFrom: parsed.validFrom,
          validTo: parsed.validTo,
          projectId: parsed.projectId || null,
          issuedById: parsed.issuedById || null,
        },
      })

      // Replace checklist items
      if (parsed.checklistItems) {
        await tx.workPermitChecklist.deleteMany({ where: { permitId: id } })
        if (parsed.checklistItems.length > 0) {
          await tx.workPermitChecklist.createMany({
            data: parsed.checklistItems.map((desc, index) => ({
              description: desc,
              sortOrder: index + 1,
              permitId: id,
            })),
          })
        }
      }
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "WorkPermit",
      entityId: id,
      metadata: { title: parsed.title, type: parsed.permitType },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/permits")
    revalidatePath(`/permits/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update permit" }
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deletePermit(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.workPermit.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Permit not found" }
    if (!["DRAFT", "CANCELLED"].includes(existing.status)) {
      return { success: false, error: "Only draft or cancelled permits can be deleted" }
    }

    await db.workPermit.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "WorkPermit",
      entityId: id,
      metadata: { title: existing.title, permitNumber: existing.permitNumber },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/permits")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete permit" }
  }
}

// ─────────────────────────────────────────────
// STATE TRANSITIONS
// ─────────────────────────────────────────────

export async function transitionPermit(id: string, newStatus: string, closureNotes?: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    // EXPIRED is cron-only — reject from UI
    if (newStatus === "EXPIRED") {
      return { success: false, error: "Permits can only be expired by the system" }
    }

    const existing = await db.workPermit.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Permit not found" }

    const allowed = VALID_TRANSITIONS[existing.status] || []
    if (!allowed.includes(newStatus)) {
      return { success: false, error: `Cannot transition from ${existing.status} to ${newStatus}` }
    }

    const data: Record<string, unknown> = { status: newStatus }

    if (newStatus === "APPROVED") {
      data.approvedAt = new Date()
      data.issuedById = dbUserId
    } else if (newStatus === "ACTIVE") {
      data.activatedAt = new Date()
    } else if (newStatus === "CLOSED") {
      data.closedAt = new Date()
      if (closureNotes) data.closureNotes = closureNotes
    } else if (newStatus === "SUSPENDED" && closureNotes) {
      data.closureNotes = closureNotes
    }

    await db.workPermit.update({ where: { id }, data })

    logAuditEvent({
      action: "UPDATE",
      entityType: "WorkPermit",
      entityId: id,
      metadata: { title: existing.title, transition: `${existing.status} → ${newStatus}` },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    // Notify requester when permit is approved
    if (newStatus === "APPROVED" && existing.requestedById !== dbUserId) {
      notifyOrgMembers({
        title: "Work permit approved",
        message: `Permit "${existing.title}" (${existing.permitNumber}) has been approved.`,
        type: "SYSTEM",
        organizationId: dbOrgId,
        excludeUserId: dbUserId,
      })
    }

    revalidatePath("/permits")
    revalidatePath(`/permits/${id}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to transition permit" }
  }
}

// ─────────────────────────────────────────────
// CHECKLIST ITEMS
// ─────────────────────────────────────────────

export async function checkPermitItem(permitId: string, itemId: string, isChecked: boolean): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const permit = await db.workPermit.findFirst({ where: { id: permitId, organizationId: dbOrgId } })
    if (!permit) return { success: false, error: "Permit not found" }

    await db.workPermitChecklist.update({
      where: { id: itemId },
      data: {
        isChecked,
        checkedById: isChecked ? dbUserId : null,
        checkedAt: isChecked ? new Date() : null,
      },
    })

    revalidatePath(`/permits/${permitId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update checklist item" }
  }
}

// ─────────────────────────────────────────────
// EXTENSIONS
// ─────────────────────────────────────────────

export async function requestExtension(permitId: string, values: ExtensionFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = extensionSchema.parse(values)

    const permit = await db.workPermit.findFirst({ where: { id: permitId, organizationId: dbOrgId } })
    if (!permit) return { success: false, error: "Permit not found" }
    if (permit.status !== "ACTIVE") return { success: false, error: "Only active permits can be extended" }
    if (parsed.newValidTo <= permit.validTo) {
      return { success: false, error: "New end date must be after current end date" }
    }

    // Only one pending extension at a time
    const pendingExtension = await db.workPermitExtension.findFirst({
      where: { permitId, status: "PENDING" },
    })
    if (pendingExtension) {
      return { success: false, error: "An extension request is already pending" }
    }

    await db.workPermitExtension.create({
      data: {
        permitId,
        originalValidTo: permit.validTo,
        newValidTo: parsed.newValidTo,
        reason: parsed.reason,
        requestedById: dbUserId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "WorkPermitExtension",
      entityId: permitId,
      metadata: { title: permit.title, reason: parsed.reason },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/permits/${permitId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to request extension" }
  }
}

export async function reviewExtension(
  extensionId: string,
  decision: "APPROVED" | "REJECTED",
  notes?: string
): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const extension = await db.workPermitExtension.findFirst({
      where: { id: extensionId },
      include: { permit: { select: { id: true, organizationId: true, title: true } } },
    })
    if (!extension || extension.permit.organizationId !== dbOrgId) {
      return { success: false, error: "Extension not found" }
    }
    if (extension.status !== "PENDING") {
      return { success: false, error: "Extension has already been reviewed" }
    }

    await db.$transaction(async (tx) => {
      await tx.workPermitExtension.update({
        where: { id: extensionId },
        data: {
          status: decision,
          reviewedById: dbUserId,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
        },
      })

      if (decision === "APPROVED") {
        await tx.workPermit.update({
          where: { id: extension.permitId },
          data: { validTo: extension.newValidTo },
        })
      }
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "WorkPermitExtension",
      entityId: extensionId,
      metadata: { decision, permitTitle: extension.permit.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/permits/${extension.permitId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to review extension" }
  }
}

// ─────────────────────────────────────────────
// DASHBOARD / HELPERS
// ─────────────────────────────────────────────

export async function getActivePermitsSummary() {
  try {
    const { dbOrgId } = await getAuthContext()

    const [activeCount, pendingCount, expiringWithin24h] = await Promise.all([
      db.workPermit.count({
        where: { organizationId: dbOrgId, status: "ACTIVE" },
      }),
      db.workPermit.count({
        where: { organizationId: dbOrgId, status: "PENDING_APPROVAL" },
      }),
      db.workPermit.count({
        where: {
          organizationId: dbOrgId,
          status: "ACTIVE",
          validTo: { gte: new Date(), lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    const recentPermits = await db.workPermit.findMany({
      where: { organizationId: dbOrgId, status: { in: ["ACTIVE", "APPROVED", "PENDING_APPROVAL"] } },
      select: {
        id: true,
        title: true,
        permitNumber: true,
        permitType: true,
        status: true,
        validTo: true,
        location: true,
      },
      orderBy: { validTo: "asc" },
      take: 5,
    })

    return { activeCount, pendingCount, expiringWithin24h, recentPermits }
  } catch {
    return null
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
  const orgUsers = await db.organizationUser.findMany({
    where: { organizationId: dbOrgId, isActive: true },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  })
  return orgUsers.map((ou) => ({
    id: ou.user.id,
    name: `${ou.user.firstName} ${ou.user.lastName}`,
  }))
}
