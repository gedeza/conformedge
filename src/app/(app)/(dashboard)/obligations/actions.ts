"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { createNotification } from "@/lib/notifications"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { obligationSchema, type ObligationFormValues } from "./schema"
import type { ActionResult } from "@/types"

const PAGE_SIZE = 50

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

export async function getObligations(page = 1, filters?: {
  status?: string
  obligationType?: string
  vendorId?: string
  projectId?: string
}) {
  const { dbOrgId } = await getAuthContext()

  const where: Record<string, unknown> = { organizationId: dbOrgId }
  if (filters?.status) where.status = filters.status
  if (filters?.obligationType) where.obligationType = filters.obligationType
  if (filters?.vendorId) where.vendorId = filters.vendorId
  if (filters?.projectId) where.projectId = filters.projectId

  const [obligations, total] = await Promise.all([
    db.complianceObligation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        vendor: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        responsibleUser: { select: { id: true, firstName: true, lastName: true } },
        document: { select: { id: true, title: true, status: true } },
        standardClause: { select: { id: true, clauseNumber: true, title: true, standard: { select: { code: true, name: true } } } },
      },
    }),
    db.complianceObligation.count({ where }),
  ])

  return {
    obligations,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getObligationDetail(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.complianceObligation.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      vendor: { select: { id: true, name: true, contactEmail: true, contactPerson: true, beeLevel: true, tier: true } },
      project: { select: { id: true, name: true, status: true } },
      responsibleUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      lastReviewedBy: { select: { id: true, firstName: true, lastName: true } },
      document: { select: { id: true, title: true, status: true, fileUrl: true, fileType: true } },
      standardClause: {
        select: {
          id: true, clauseNumber: true, title: true, description: true,
          standard: { select: { code: true, name: true, standardType: true } },
        },
      },
      monitoringPoints: { select: { id: true, name: true, pointType: true } },
    },
  })
}

export async function getObligationStats() {
  const { dbOrgId } = await getAuthContext()

  const [total, active, expiringSoon, expired] = await Promise.all([
    db.complianceObligation.count({ where: { organizationId: dbOrgId } }),
    db.complianceObligation.count({ where: { organizationId: dbOrgId, status: "ACTIVE" } }),
    db.complianceObligation.count({
      where: {
        organizationId: dbOrgId,
        status: "ACTIVE",
        expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), gte: new Date() },
      },
    }),
    db.complianceObligation.count({
      where: {
        organizationId: dbOrgId,
        status: "ACTIVE",
        expiryDate: { lt: new Date() },
      },
    }),
  ])

  return { total, active, expiringSoon, expired }
}

// ─────────────────────────────────────────────
// Options for dropdowns
// ─────────────────────────────────────────────

export async function getObligationOptions() {
  const { dbOrgId } = await getAuthContext()

  const [vendors, projects, members, clauses] = await Promise.all([
    db.vendor.findMany({
      where: { organizationId: dbOrgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.project.findMany({
      where: { organizationId: dbOrgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.organizationUser.findMany({
      where: { organizationId: dbOrgId, isActive: true },
      select: { user: { select: { id: true, firstName: true, lastName: true } } },
    }),
    db.standardClause.findMany({
      where: {
        standard: {
          standardType: { in: ["STATUTORY", "PROFESSIONAL_BODY"] },
          organizationStandards: { some: { organizationId: dbOrgId, isActive: true } },
        },
        parentId: { not: null }, // Only sub-clauses
      },
      select: {
        id: true,
        clauseNumber: true,
        title: true,
        standard: { select: { code: true, name: true } },
      },
      orderBy: [{ standard: { code: "asc" } }, { clauseNumber: "asc" }],
    }),
  ])

  return {
    vendors,
    projects,
    members: members.map((m) => m.user),
    clauses,
  }
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

export async function createObligation(values: ObligationFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "complianceObligations")
    if (!access.allowed) return { success: false, error: access.reason ?? "Compliance Obligations require an Enterprise plan." }

    const parsed = obligationSchema.parse(values)

    const obligation = await db.complianceObligation.create({
      data: {
        title: parsed.title,
        obligationType: parsed.obligationType,
        organizationId: dbOrgId,
        standardClauseId: parsed.standardClauseId ?? null,
        vendorId: parsed.vendorId ?? null,
        projectId: parsed.projectId ?? null,
        responsibleUserId: parsed.responsibleUserId ?? null,
        status: "ACTIVE",
        effectiveDate: parsed.effectiveDate ?? null,
        expiryDate: parsed.expiryDate ?? null,
        renewalLeadDays: parsed.renewalLeadDays ?? 30,
        documentId: parsed.documentId ?? null,
        metadata: parsed.metadata ? JSON.parse(JSON.stringify(parsed.metadata)) : undefined,
        notes: parsed.notes ?? null,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "ComplianceObligation",
      entityId: obligation.id,
      metadata: { title: obligation.title, type: obligation.obligationType, vendorId: obligation.vendorId },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/obligations")
    revalidatePath("/dashboard")
    if (parsed.vendorId) revalidatePath(`/vendors/${parsed.vendorId}`)

    return { success: true, data: { id: obligation.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create obligation" }
  }
}

export async function updateObligation(id: string, values: ObligationFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.complianceObligation.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Obligation not found" }

    const parsed = obligationSchema.parse(values)

    await db.complianceObligation.update({
      where: { id },
      data: {
        title: parsed.title,
        obligationType: parsed.obligationType,
        standardClauseId: parsed.standardClauseId ?? null,
        vendorId: parsed.vendorId ?? null,
        projectId: parsed.projectId ?? null,
        responsibleUserId: parsed.responsibleUserId ?? null,
        effectiveDate: parsed.effectiveDate ?? null,
        expiryDate: parsed.expiryDate ?? null,
        renewalLeadDays: parsed.renewalLeadDays ?? 30,
        documentId: parsed.documentId ?? null,
        metadata: parsed.metadata ? JSON.parse(JSON.stringify(parsed.metadata)) : undefined,
        notes: parsed.notes ?? null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "ComplianceObligation",
      entityId: id,
      metadata: { title: parsed.title, type: parsed.obligationType },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/obligations")
    revalidatePath(`/obligations/${id}`)
    if (parsed.vendorId) revalidatePath(`/vendors/${parsed.vendorId}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update obligation" }
  }
}

export async function updateObligationStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.complianceObligation.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Obligation not found" }

    await db.complianceObligation.update({
      where: { id },
      data: { status: status as "PENDING" | "ACTIVE" | "EXPIRED" | "REVOKED" | "NOT_APPLICABLE" },
    })

    logAuditEvent({
      action: "STATUS_CHANGE",
      entityType: "ComplianceObligation",
      entityId: id,
      metadata: { from: existing.status, to: status },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/obligations")
    revalidatePath(`/obligations/${id}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update status" }
  }
}

export async function reviewObligation(id: string, notes?: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.complianceObligation.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Obligation not found" }

    await db.complianceObligation.update({
      where: { id },
      data: {
        lastReviewedAt: new Date(),
        lastReviewedById: dbUserId,
        notes: notes ?? existing.notes,
      },
    })

    logAuditEvent({
      action: "REVIEW",
      entityType: "ComplianceObligation",
      entityId: id,
      metadata: { title: existing.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/obligations/${id}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to review obligation" }
  }
}

export async function deleteObligation(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.complianceObligation.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Obligation not found" }

    await db.complianceObligation.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "ComplianceObligation",
      entityId: id,
      metadata: { title: existing.title, type: existing.obligationType },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/obligations")
    if (existing.vendorId) revalidatePath(`/vendors/${existing.vendorId}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete obligation" }
  }
}

// ─────────────────────────────────────────────
// Vendor obligations query (for vendor detail tab)
// ─────────────────────────────────────────────

export async function getVendorObligations(vendorId: string) {
  const { dbOrgId } = await getAuthContext()

  return db.complianceObligation.findMany({
    where: { organizationId: dbOrgId, vendorId },
    orderBy: { expiryDate: "asc" },
    include: {
      project: { select: { id: true, name: true } },
      responsibleUser: { select: { id: true, firstName: true, lastName: true } },
      document: { select: { id: true, title: true, status: true } },
      standardClause: { select: { id: true, clauseNumber: true, title: true, standard: { select: { code: true } } } },
    },
  })
}
