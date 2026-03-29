"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { getBillingContext, checkVendorLimit } from "@/lib/billing"
import type { ActionResult } from "@/types"

const vendorSchema = z.object({
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
  // B-BBEE scorecard
  beeEntityType: z.string().max(20).optional().nullable(),
  beeBlackOwnership: z.coerce.number().min(0).max(100).optional().nullable(),
  beeScorecard: z.record(z.string(), z.unknown()).optional().nullable(),
  beeScore: z.coerce.number().min(0).max(109).optional().nullable(),
  beeCertExpiry: z.coerce.date().optional().nullable(),
  beeVerifier: z.string().max(200).optional().nullable(),
  // Trade & compliance
  tradeTypes: z.array(z.string()).optional(),
  taxClearanceExpiry: z.coerce.date().optional(),
  liabilityExpiry: z.coerce.date().optional(),
})

export type VendorFormValues = z.infer<typeof vendorSchema>

const certificationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  issuedBy: z.string().max(200).optional(),
  issuedDate: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  fileUrl: z.string().optional(),
})

export type CertificationFormValues = z.infer<typeof certificationSchema>

const PAGE_SIZE = 100

export async function getVendors(page = 1) {
  const { dbOrgId } = await getAuthContext()
  const where = { organizationId: dbOrgId }

  const [vendors, total] = await Promise.all([
    db.vendor.findMany({
      where,
      include: {
        certifications: { orderBy: { expiresAt: "asc" }, take: 10 },
        _count: { select: { certifications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.vendor.count({ where }),
  ])

  return {
    vendors,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getVendor(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.vendor.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      certifications: { orderBy: { expiresAt: "asc" } },
    },
  })
}

export async function createVendor(values: VendorFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    // Enforce vendor limit per plan tier
    const billing = await getBillingContext(dbOrgId)
    const subCount = await db.vendor.count({ where: { organizationId: dbOrgId } })
    const limitCheck = checkVendorLimit(billing, subCount)
    if (!limitCheck.allowed) return { success: false, error: limitCheck.reason! }

    const parsed = vendorSchema.parse(values)

    const sub = await db.vendor.create({
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
        beeEntityType: parsed.beeEntityType ?? null,
        beeBlackOwnership: parsed.beeBlackOwnership ?? null,
        beeScorecard: (parsed.beeScorecard as any) ?? undefined,
        beeScore: parsed.beeScore ?? null,
        beeCertExpiry: parsed.beeCertExpiry ?? null,
        beeVerifier: parsed.beeVerifier ?? null,
        tradeTypes: parsed.tradeTypes && parsed.tradeTypes.length > 0 ? parsed.tradeTypes : undefined,
        taxClearanceExpiry: parsed.taxClearanceExpiry || null,
        liabilityExpiry: parsed.liabilityExpiry || null,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Vendor",
      entityId: sub.id,
      metadata: { name: sub.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/vendors")
    return { success: true, data: { id: sub.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create vendor" }
  }
}

export async function updateVendor(id: string, values: VendorFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = vendorSchema.parse(values)

    const existing = await db.vendor.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Vendor not found" }

    await db.vendor.update({
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
        beeEntityType: parsed.beeEntityType ?? null,
        beeBlackOwnership: parsed.beeBlackOwnership ?? null,
        beeScorecard: (parsed.beeScorecard as any) ?? undefined,
        beeScore: parsed.beeScore ?? null,
        beeCertExpiry: parsed.beeCertExpiry ?? null,
        beeVerifier: parsed.beeVerifier ?? null,
        tradeTypes: parsed.tradeTypes && parsed.tradeTypes.length > 0 ? parsed.tradeTypes : undefined,
        taxClearanceExpiry: parsed.taxClearanceExpiry || null,
        liabilityExpiry: parsed.liabilityExpiry || null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Vendor",
      entityId: id,
      metadata: { name: parsed.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/vendors")
    revalidatePath(`/vendors/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update vendor" }
  }
}

export async function updateBeeScorecard(id: string, values: {
  beeEntityType: string | null
  beeBlackOwnership: number | null
  beeScorecard: Record<string, unknown> | null
  beeScore: number | null
  beeCertExpiry: Date | null
  beeVerifier: string | null
  beeLevel: number | null
}): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.vendor.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Vendor not found" }

    await db.vendor.update({
      where: { id },
      data: {
        beeEntityType: values.beeEntityType,
        beeBlackOwnership: values.beeBlackOwnership,
        beeScorecard: (values.beeScorecard as any) ?? undefined,
        beeScore: values.beeScore,
        beeCertExpiry: values.beeCertExpiry,
        beeVerifier: values.beeVerifier,
        beeLevel: values.beeLevel?.toString() ?? null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Vendor",
      entityId: id,
      metadata: { action: "bee_scorecard_update", beeLevel: values.beeLevel, beeScore: values.beeScore },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/vendors/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update B-BBEE scorecard" }
  }
}

export async function deleteVendor(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.vendor.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Vendor not found" }

    await db.vendor.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "Vendor",
      entityId: id,
      metadata: { name: existing.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/vendors")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete vendor" }
  }
}

// ── Compliance Scoring ──────────────────────────────

import { calculateComplianceScore, type ComplianceScore, type VendorScoringWeights } from "./compliance-score"

export async function recalculateComplianceScore(vendorId: string): Promise<ActionResult<ComplianceScore>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const [sub, org] = await Promise.all([
      db.vendor.findFirst({
        where: { id: vendorId, organizationId: dbOrgId },
        include: { certifications: { select: { expiresAt: true } } },
      }),
      db.organization.findUnique({
        where: { id: dbOrgId },
        select: { settings: true },
      }),
    ])
    if (!sub) return { success: false, error: "Vendor not found" }

    const settings = (org?.settings as Record<string, unknown>) ?? {}
    const customWeights = settings.vendorScoringWeights as Partial<VendorScoringWeights> | undefined
    const score = calculateComplianceScore(sub, customWeights)

    await db.vendor.update({
      where: { id: vendorId },
      data: { tier: score.tier },
    })

    logAuditEvent({
      action: "RECALCULATE_SCORE",
      entityType: "Vendor",
      entityId: vendorId,
      metadata: { score: score.total, tier: score.tier, previousTier: sub.tier },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/vendors/${vendorId}`)
    revalidatePath("/vendors")
    return { success: true, data: score }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to recalculate score" }
  }
}

export async function addCertification(vendorId: string, values: CertificationFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = certificationSchema.parse(values)

    const sub = await db.vendor.findFirst({ where: { id: vendorId, organizationId: dbOrgId } })
    if (!sub) return { success: false, error: "Vendor not found" }

    await db.vendorCertification.create({
      data: { ...parsed, vendorId },
    })

    logAuditEvent({
      action: "ADD_CERTIFICATION",
      entityType: "Vendor",
      entityId: vendorId,
      metadata: { certName: parsed.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/vendors/${vendorId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add certification" }
  }
}

export async function updateCertification(id: string, vendorId: string, values: CertificationFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = certificationSchema.parse(values)

    const sub = await db.vendor.findFirst({ where: { id: vendorId, organizationId: dbOrgId } })
    if (!sub) return { success: false, error: "Vendor not found" }

    await db.vendorCertification.update({
      where: { id },
      data: parsed,
    })

    logAuditEvent({
      action: "UPDATE_CERTIFICATION",
      entityType: "Vendor",
      entityId: vendorId,
      metadata: { certId: id, certName: parsed.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/vendors/${vendorId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update certification" }
  }
}

export async function reviewCertification(
  id: string,
  vendorId: string,
  status: "APPROVED" | "REJECTED",
  notes?: string
): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const sub = await db.vendor.findFirst({ where: { id: vendorId, organizationId: dbOrgId } })
    if (!sub) return { success: false, error: "Vendor not found" }

    const cert = await db.vendorCertification.findFirst({ where: { id, vendorId } })
    if (!cert) return { success: false, error: "Certification not found" }

    await db.vendorCertification.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewNotes: notes || null,
      },
    })

    logAuditEvent({
      action: `REVIEW_CERTIFICATION_${status}`,
      entityType: "VendorCertification",
      entityId: id,
      metadata: { vendorId, certName: cert.name, status, notes },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/vendors/${vendorId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to review certification" }
  }
}

export async function deleteCertification(id: string, vendorId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const sub = await db.vendor.findFirst({ where: { id: vendorId, organizationId: dbOrgId } })
    if (!sub) return { success: false, error: "Vendor not found" }

    await db.vendorCertification.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE_CERTIFICATION",
      entityType: "Vendor",
      entityId: vendorId,
      metadata: { certId: id },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/vendors/${vendorId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete certification" }
  }
}
