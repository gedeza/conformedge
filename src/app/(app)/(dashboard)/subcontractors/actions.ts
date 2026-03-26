"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { getBillingContext, checkSubcontractorLimit } from "@/lib/billing"
import type { ActionResult } from "@/types"

const subcontractorSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  registrationNumber: z.string().max(50).optional(),
  beeLevel: z.coerce.number().min(1).max(8).optional(),
  safetyRating: z.coerce.number().min(0).max(100).optional(),
  tier: z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE", "UNRATED"]).default("UNRATED"),
  // Contact details
  contactPerson: z.string().max(200).optional(),
  contactEmail: z.string().email().max(200).optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional(),
  physicalAddress: z.string().max(500).optional(),
  // Trade & compliance
  tradeTypes: z.array(z.string()).optional(),
  taxClearanceExpiry: z.coerce.date().optional(),
  liabilityExpiry: z.coerce.date().optional(),
})

export type SubcontractorFormValues = z.infer<typeof subcontractorSchema>

const certificationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  issuedBy: z.string().max(200).optional(),
  issuedDate: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  fileUrl: z.string().optional(),
})

export type CertificationFormValues = z.infer<typeof certificationSchema>

const PAGE_SIZE = 100

export async function getSubcontractors(page = 1) {
  const { dbOrgId } = await getAuthContext()
  const where = { organizationId: dbOrgId }

  const [subcontractors, total] = await Promise.all([
    db.subcontractor.findMany({
      where,
      include: {
        certifications: { orderBy: { expiresAt: "asc" }, take: 10 },
        _count: { select: { certifications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.subcontractor.count({ where }),
  ])

  return {
    subcontractors,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getSubcontractor(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.subcontractor.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      certifications: { orderBy: { expiresAt: "asc" } },
    },
  })
}

export async function createSubcontractor(values: SubcontractorFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    // Enforce subcontractor limit per plan tier
    const billing = await getBillingContext(dbOrgId)
    const subCount = await db.subcontractor.count({ where: { organizationId: dbOrgId } })
    const limitCheck = checkSubcontractorLimit(billing, subCount)
    if (!limitCheck.allowed) return { success: false, error: limitCheck.reason! }

    const parsed = subcontractorSchema.parse(values)

    const sub = await db.subcontractor.create({
      data: {
        name: parsed.name,
        registrationNumber: parsed.registrationNumber || null,
        beeLevel: parsed.beeLevel?.toString() ?? null,
        safetyRating: parsed.safetyRating ?? null,
        tier: parsed.tier,
        contactPerson: parsed.contactPerson || null,
        contactEmail: parsed.contactEmail || null,
        contactPhone: parsed.contactPhone || null,
        physicalAddress: parsed.physicalAddress || null,
        tradeTypes: parsed.tradeTypes && parsed.tradeTypes.length > 0 ? parsed.tradeTypes : undefined,
        taxClearanceExpiry: parsed.taxClearanceExpiry || null,
        liabilityExpiry: parsed.liabilityExpiry || null,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Subcontractor",
      entityId: sub.id,
      metadata: { name: sub.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/subcontractors")
    return { success: true, data: { id: sub.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create subcontractor" }
  }
}

export async function updateSubcontractor(id: string, values: SubcontractorFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = subcontractorSchema.parse(values)

    const existing = await db.subcontractor.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Subcontractor not found" }

    await db.subcontractor.update({
      where: { id },
      data: {
        name: parsed.name,
        registrationNumber: parsed.registrationNumber || null,
        beeLevel: parsed.beeLevel?.toString() ?? null,
        safetyRating: parsed.safetyRating ?? null,
        tier: parsed.tier,
        contactPerson: parsed.contactPerson || null,
        contactEmail: parsed.contactEmail || null,
        contactPhone: parsed.contactPhone || null,
        physicalAddress: parsed.physicalAddress || null,
        tradeTypes: parsed.tradeTypes && parsed.tradeTypes.length > 0 ? parsed.tradeTypes : undefined,
        taxClearanceExpiry: parsed.taxClearanceExpiry || null,
        liabilityExpiry: parsed.liabilityExpiry || null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Subcontractor",
      entityId: id,
      metadata: { name: parsed.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/subcontractors")
    revalidatePath(`/subcontractors/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update subcontractor" }
  }
}

export async function deleteSubcontractor(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.subcontractor.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Subcontractor not found" }

    await db.subcontractor.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "Subcontractor",
      entityId: id,
      metadata: { name: existing.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/subcontractors")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete subcontractor" }
  }
}

// ── Compliance Scoring ──────────────────────────────

import { calculateComplianceScore, type ComplianceScore, type VendorScoringWeights } from "./compliance-score"

export async function recalculateComplianceScore(subcontractorId: string): Promise<ActionResult<ComplianceScore>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const [sub, org] = await Promise.all([
      db.subcontractor.findFirst({
        where: { id: subcontractorId, organizationId: dbOrgId },
        include: { certifications: { select: { expiresAt: true } } },
      }),
      db.organization.findUnique({
        where: { id: dbOrgId },
        select: { settings: true },
      }),
    ])
    if (!sub) return { success: false, error: "Subcontractor not found" }

    const settings = (org?.settings as Record<string, unknown>) ?? {}
    const customWeights = settings.vendorScoringWeights as Partial<VendorScoringWeights> | undefined
    const score = calculateComplianceScore(sub, customWeights)

    await db.subcontractor.update({
      where: { id: subcontractorId },
      data: { tier: score.tier },
    })

    logAuditEvent({
      action: "RECALCULATE_SCORE",
      entityType: "Subcontractor",
      entityId: subcontractorId,
      metadata: { score: score.total, tier: score.tier, previousTier: sub.tier },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/subcontractors/${subcontractorId}`)
    revalidatePath("/subcontractors")
    return { success: true, data: score }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to recalculate score" }
  }
}

export async function addCertification(subcontractorId: string, values: CertificationFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = certificationSchema.parse(values)

    const sub = await db.subcontractor.findFirst({ where: { id: subcontractorId, organizationId: dbOrgId } })
    if (!sub) return { success: false, error: "Subcontractor not found" }

    await db.subcontractorCertification.create({
      data: { ...parsed, subcontractorId },
    })

    logAuditEvent({
      action: "ADD_CERTIFICATION",
      entityType: "Subcontractor",
      entityId: subcontractorId,
      metadata: { certName: parsed.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/subcontractors/${subcontractorId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add certification" }
  }
}

export async function updateCertification(id: string, subcontractorId: string, values: CertificationFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = certificationSchema.parse(values)

    const sub = await db.subcontractor.findFirst({ where: { id: subcontractorId, organizationId: dbOrgId } })
    if (!sub) return { success: false, error: "Subcontractor not found" }

    await db.subcontractorCertification.update({
      where: { id },
      data: parsed,
    })

    logAuditEvent({
      action: "UPDATE_CERTIFICATION",
      entityType: "Subcontractor",
      entityId: subcontractorId,
      metadata: { certId: id, certName: parsed.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/subcontractors/${subcontractorId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update certification" }
  }
}

export async function reviewCertification(
  id: string,
  subcontractorId: string,
  status: "APPROVED" | "REJECTED",
  notes?: string
): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const sub = await db.subcontractor.findFirst({ where: { id: subcontractorId, organizationId: dbOrgId } })
    if (!sub) return { success: false, error: "Subcontractor not found" }

    const cert = await db.subcontractorCertification.findFirst({ where: { id, subcontractorId } })
    if (!cert) return { success: false, error: "Certification not found" }

    await db.subcontractorCertification.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewNotes: notes || null,
      },
    })

    logAuditEvent({
      action: `REVIEW_CERTIFICATION_${status}`,
      entityType: "SubcontractorCertification",
      entityId: id,
      metadata: { subcontractorId, certName: cert.name, status, notes },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/subcontractors/${subcontractorId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to review certification" }
  }
}

export async function deleteCertification(id: string, subcontractorId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const sub = await db.subcontractor.findFirst({ where: { id: subcontractorId, organizationId: dbOrgId } })
    if (!sub) return { success: false, error: "Subcontractor not found" }

    await db.subcontractorCertification.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE_CERTIFICATION",
      entityType: "Subcontractor",
      entityId: subcontractorId,
      metadata: { certId: id },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/subcontractors/${subcontractorId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete certification" }
  }
}
