"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import type { ActionResult } from "@/types"

const subcontractorSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  registrationNumber: z.string().max(50).optional(),
  beeLevel: z.coerce.number().min(1).max(8).optional(),
  safetyRating: z.coerce.number().min(0).max(100).optional(),
  tier: z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE", "UNRATED"]).default("UNRATED"),
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

export async function getSubcontractors() {
  const { dbOrgId } = await getAuthContext()

  return db.subcontractor.findMany({
    where: { organizationId: dbOrgId },
    include: {
      certifications: { orderBy: { expiresAt: "asc" } },
      _count: { select: { certifications: true } },
    },
    orderBy: { createdAt: "desc" },
  })
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
    const parsed = subcontractorSchema.parse(values)

    const sub = await db.subcontractor.create({
      data: {
        ...parsed,
        beeLevel: parsed.beeLevel?.toString() ?? null,
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
        ...parsed,
        beeLevel: parsed.beeLevel?.toString() ?? null,
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

export interface ComplianceScore {
  total: number
  certScore: number
  safetyScore: number
  beeScore: number
  tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "UNRATED"
  breakdown: string[]
}

export function calculateComplianceScore(sub: {
  safetyRating: number | null
  beeLevel: string | null
  certifications: Array<{ expiresAt: Date | null }>
}): ComplianceScore {
  const breakdown: string[] = []
  const now = new Date()

  // Certification score (40% weight): valid + not expired certs
  const totalCerts = sub.certifications.length
  const validCerts = sub.certifications.filter((c) => {
    if (!c.expiresAt) return true
    return new Date(c.expiresAt) > now
  }).length
  const certScore = totalCerts > 0 ? (validCerts / Math.max(totalCerts, 3)) * 40 : 0
  breakdown.push(`Certifications: ${validCerts}/${totalCerts} valid (${certScore.toFixed(0)}/40)`)

  // Safety rating (35% weight)
  const safetyScore = sub.safetyRating ? (sub.safetyRating / 100) * 35 : 0
  breakdown.push(`Safety: ${sub.safetyRating ?? 0}% (${safetyScore.toFixed(0)}/35)`)

  // BEE level (25% weight): Level 1 = 100%, Level 8 = 12.5%
  const beeNum = sub.beeLevel ? parseInt(sub.beeLevel) : 0
  const beeScore = beeNum > 0 ? ((9 - beeNum) / 8) * 25 : 0
  breakdown.push(`BEE Level ${beeNum || "N/A"}: (${beeScore.toFixed(0)}/25)`)

  const total = Math.round(certScore + safetyScore + beeScore)

  let tier: ComplianceScore["tier"]
  if (total >= 85) tier = "PLATINUM"
  else if (total >= 70) tier = "GOLD"
  else if (total >= 50) tier = "SILVER"
  else if (total >= 25) tier = "BRONZE"
  else tier = "UNRATED"

  return { total, certScore: Math.round(certScore), safetyScore: Math.round(safetyScore), beeScore: Math.round(beeScore), tier, breakdown }
}

export async function recalculateComplianceScore(subcontractorId: string): Promise<ActionResult<ComplianceScore>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const sub = await db.subcontractor.findFirst({
      where: { id: subcontractorId, organizationId: dbOrgId },
      include: { certifications: { select: { expiresAt: true } } },
    })
    if (!sub) return { success: false, error: "Subcontractor not found" }

    const score = calculateComplianceScore(sub)

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
