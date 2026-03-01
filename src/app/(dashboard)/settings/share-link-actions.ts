"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canManageOrg } from "@/lib/permissions"
import { generateShareToken, hashShareToken } from "@/lib/share-tokens"
import { APP_URL } from "@/lib/constants"
import type { ActionResult } from "@/types"

const portalConfigSchema = z.object({
  documents: z.boolean().default(true),
  assessments: z.boolean().default(false),
  capas: z.boolean().default(false),
  checklists: z.boolean().default(false),
  subcontractors: z.boolean().default(false),
})

const createShareLinkSchema = z.object({
  type: z.enum(["DOCUMENT", "AUDIT_PACK", "PORTAL"]),
  entityId: z.string().optional(),
  label: z.string().min(1, "Label is required").max(200),
  recipientEmail: z.email().optional().or(z.literal("")),
  recipientName: z.string().max(200).optional(),
  expiresAt: z.coerce.date(),
  maxViews: z.number().int().positive().optional(),
  allowDownload: z.boolean().default(true),
  portalConfig: portalConfigSchema.optional(),
})

export type CreateShareLinkValues = z.infer<typeof createShareLinkSchema>

export async function getShareLinks() {
  const { dbOrgId } = await getAuthContext()

  return db.shareLink.findMany({
    where: { organizationId: dbOrgId },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      _count: { select: { accessLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export type ShareLinkItem = Awaited<ReturnType<typeof getShareLinks>>[number]

export async function createShareLink(values: CreateShareLinkValues): Promise<ActionResult<{ id: string; url: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }

    const parsed = createShareLinkSchema.parse(values)

    // Validate entityId exists and belongs to org for DOCUMENT / AUDIT_PACK
    if (parsed.type === "DOCUMENT") {
      if (!parsed.entityId) return { success: false, error: "Document ID is required" }
      const doc = await db.document.findFirst({ where: { id: parsed.entityId, organizationId: dbOrgId } })
      if (!doc) return { success: false, error: "Document not found" }
    } else if (parsed.type === "AUDIT_PACK") {
      if (!parsed.entityId) return { success: false, error: "Audit Pack ID is required" }
      const pack = await db.auditPack.findFirst({ where: { id: parsed.entityId, organizationId: dbOrgId } })
      if (!pack) return { success: false, error: "Audit Pack not found" }
    }

    const rawToken = generateShareToken()
    const tokenHash = hashShareToken(rawToken)

    const shareLink = await db.shareLink.create({
      data: {
        tokenHash,
        type: parsed.type,
        label: parsed.label,
        recipientEmail: parsed.recipientEmail || undefined,
        recipientName: parsed.recipientName || undefined,
        entityId: parsed.entityId || undefined,
        portalConfig: parsed.type === "PORTAL" ? (parsed.portalConfig ?? { documents: true }) : undefined,
        expiresAt: parsed.expiresAt,
        maxViews: parsed.maxViews ?? undefined,
        allowDownload: parsed.allowDownload,
        organizationId: dbOrgId,
        createdById: dbUserId,
      },
    })

    logAuditEvent({
      action: "CREATE_SHARE_LINK",
      entityType: "ShareLink",
      entityId: shareLink.id,
      metadata: { type: parsed.type, label: parsed.label, recipientEmail: parsed.recipientEmail },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true, data: { id: shareLink.id, url: `${APP_URL}/shared/${rawToken}` } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create share link" }
  }
}

export async function revokeShareLink(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }

    const link = await db.shareLink.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!link) return { success: false, error: "Share link not found" }

    await db.shareLink.update({
      where: { id },
      data: { status: "REVOKED", revokedAt: new Date() },
    })

    logAuditEvent({
      action: "REVOKE_SHARE_LINK",
      entityType: "ShareLink",
      entityId: id,
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to revoke share link" }
  }
}

export async function deleteShareLink(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }

    const link = await db.shareLink.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!link) return { success: false, error: "Share link not found" }

    await db.shareLink.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE_SHARE_LINK",
      entityType: "ShareLink",
      entityId: id,
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete share link" }
  }
}

export async function getShareLinkAccessLog(id: string) {
  const { dbOrgId, role } = await getAuthContext()
  if (!canManageOrg(role)) return []

  const link = await db.shareLink.findFirst({ where: { id, organizationId: dbOrgId } })
  if (!link) return []

  return db.shareLinkAccess.findMany({
    where: { shareLinkId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}
