"use server"

import { z } from "zod/v4"
import { db } from "@/lib/db"
import { validateShareToken, logShareAccess } from "@/lib/share-link"
import { logAuditEvent } from "@/lib/audit"
import { notifyOrgMembers } from "@/lib/notifications"
import type { ActionResult } from "@/types"

const portalCertSchema = z.object({
  name: z.string().min(1, "Certificate name is required").max(200),
  issuedBy: z.string().max(200).optional(),
  issuedDate: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  fileUrl: z.string().optional(),
})

export type PortalCertValues = z.infer<typeof portalCertSchema>

export async function addPortalCertification(
  token: string,
  values: PortalCertValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const shareLink = await validateShareToken(token)
    if (!shareLink) return { success: false, error: "Invalid or expired link" }
    if (shareLink.type !== "SUBCONTRACTOR" || !shareLink.entityId) {
      return { success: false, error: "Invalid link type" }
    }

    const parsed = portalCertSchema.parse(values)

    // Verify subcontractor belongs to org
    const sub = await db.subcontractor.findFirst({
      where: { id: shareLink.entityId, organizationId: shareLink.organizationId },
      select: { id: true, name: true },
    })
    if (!sub) return { success: false, error: "Subcontractor not found" }

    const cert = await db.subcontractorCertification.create({
      data: {
        name: parsed.name,
        issuedBy: parsed.issuedBy || undefined,
        issuedDate: parsed.issuedDate || undefined,
        expiresAt: parsed.expiresAt || undefined,
        fileUrl: parsed.fileUrl || undefined,
        status: "PENDING_REVIEW",
        subcontractorId: sub.id,
      },
    })

    // Audit trail (no userId — external portal action)
    logAuditEvent({
      action: "PORTAL_CERT_UPLOAD",
      entityType: "SubcontractorCertification",
      entityId: cert.id,
      metadata: { via: "subcontractor-portal", certName: parsed.name, subcontractorName: sub.name },
      organizationId: shareLink.organizationId,
    })

    // Log share access
    logShareAccess({
      shareLinkId: shareLink.id,
      action: "UPLOAD",
      metadata: { certName: parsed.name },
    })

    // Notify org admins
    notifyOrgMembers({
      title: "New Certificate Upload",
      message: `${sub.name} uploaded "${parsed.name}" via the subcontractor portal. Review required.`,
      type: "CERT_UPLOAD",
      organizationId: shareLink.organizationId,
    })

    return { success: true, data: { id: cert.id } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload certification",
    }
  }
}
