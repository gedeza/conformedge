import { db } from "@/lib/db"

interface AuditEventInput {
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, unknown>
  userId?: string
  organizationId: string
}

export function logAuditEvent(input: AuditEventInput) {
  // Fire and forget — don't await, don't block the caller
  db.auditTrailEvent
    .create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (input.metadata ?? undefined) as any,
        userId: input.userId,
        organizationId: input.organizationId,
      },
    })
    .catch((err) => {
      console.error("Failed to log audit event:", err)
    })
}
