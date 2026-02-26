import { db } from "@/lib/db"
import { sendNotificationEmail, sendNotificationEmailBulk } from "@/lib/email"
import type { NotificationType } from "@/types"

interface NotificationInput {
  title: string
  message: string
  type: NotificationType
  userId: string
  organizationId: string
}

/** Fire-and-forget notification creation (same pattern as logAuditEvent) */
export function createNotification(input: NotificationInput) {
  db.notification
    .create({
      data: {
        title: input.title,
        message: input.message,
        type: input.type,
        userId: input.userId,
        organizationId: input.organizationId,
      },
    })
    .then(() => {
      sendNotificationEmail({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
      })
    })
    .catch((err) => {
      console.error("Failed to create notification:", err)
    })
}

/** Create notification for all active members of an organization */
export function notifyOrgMembers(
  input: Omit<NotificationInput, "userId"> & { excludeUserId?: string }
) {
  db.organizationUser
    .findMany({
      where: { organizationId: input.organizationId, isActive: true },
      select: { userId: true },
    })
    .then((members) => {
      const targets = input.excludeUserId
        ? members.filter((m) => m.userId !== input.excludeUserId)
        : members

      if (targets.length === 0) return

      return db.notification
        .createMany({
          data: targets.map((m) => ({
            title: input.title,
            message: input.message,
            type: input.type,
            userId: m.userId,
            organizationId: input.organizationId,
          })),
        })
        .then(() => {
          sendNotificationEmailBulk({
            userIds: targets.map((m) => m.userId),
            title: input.title,
            message: input.message,
            type: input.type,
          })
        })
    })
    .catch((err) => {
      console.error("Failed to notify org members:", err)
    })
}
