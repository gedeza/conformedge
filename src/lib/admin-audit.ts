import { db } from "@/lib/db"
import { captureError } from "@/lib/error-tracking"

/**
 * Log an admin console action to the audit trail.
 *
 * Uses the existing AuditTrailEvent model with entityType prefixed "Admin:"
 * to distinguish admin actions from regular user activity.
 *
 * Both entityId and organizationId are required by the schema, so for
 * user-targeted actions (e.g. super admin toggle) we look up the user's
 * first active organization. If none found, we fall back to the admin's org.
 */
export function logAdminAction({
  adminUserId,
  action,
  targetType,
  targetId,
  metadata,
  organizationId,
}: {
  adminUserId: string
  action: string
  targetType: string
  targetId: string
  metadata?: Record<string, unknown>
  organizationId?: string
}) {
  const doLog = async () => {
    // organizationId is required by the schema — resolve it if not provided
    let orgId = organizationId
    if (!orgId) {
      // Try to find an organization the target user belongs to
      const membership = await db.organizationUser.findFirst({
        where: { userId: targetId, isActive: true },
        select: { organizationId: true },
      })
      // If user has no org, look up the admin's org instead
      if (!membership) {
        const adminMembership = await db.organizationUser.findFirst({
          where: { userId: adminUserId, isActive: true },
          select: { organizationId: true },
        })
        orgId = adminMembership?.organizationId ?? targetId
      } else {
        orgId = membership.organizationId
      }
    }

    await db.auditTrailEvent.create({
      data: {
        action,
        entityType: `Admin:${targetType}`,
        entityId: targetId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (metadata ?? undefined) as any,
        userId: adminUserId,
        organizationId: orgId!,
      },
    })
  }

  // Fire and forget — same pattern as logAuditEvent
  doLog().catch((err) => {
    captureError(err, {
      source: "admin-audit.logAdminAction",
      userId: adminUserId,
      metadata: { action, targetType, targetId },
    })
  })
}
