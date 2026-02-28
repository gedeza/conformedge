import { db } from "@/lib/db"
import { sendNotificationEmail, sendNotificationEmailBulk } from "@/lib/email"
import { isNotificationEnabled, filterEnabledUsers } from "@/lib/notification-preferences"
import type { NotificationType } from "@/types"

interface NotificationInput {
  title: string
  message: string
  type: NotificationType
  userId: string
  organizationId: string
}

/** Fire-and-forget notification creation with preference checks */
export function createNotification(input: NotificationInput) {
  Promise.all([
    isNotificationEnabled(input.userId, input.type, "IN_APP"),
    isNotificationEnabled(input.userId, input.type, "EMAIL"),
  ])
    .then(async ([inAppEnabled, emailEnabled]) => {
      if (inAppEnabled) {
        await db.notification.create({
          data: {
            title: input.title,
            message: input.message,
            type: input.type,
            userId: input.userId,
            organizationId: input.organizationId,
          },
        })
      }

      if (emailEnabled) {
        sendNotificationEmail({
          userId: input.userId,
          title: input.title,
          message: input.message,
          type: input.type,
        })
      }
    })
    .catch((err) => {
      console.error("Failed to create notification:", err)
    })
}

/** Create notification for all active members of an organization, respecting preferences */
export function notifyOrgMembers(
  input: Omit<NotificationInput, "userId"> & { excludeUserId?: string }
) {
  db.organizationUser
    .findMany({
      where: { organizationId: input.organizationId, isActive: true },
      select: { userId: true },
    })
    .then(async (members) => {
      const allIds = input.excludeUserId
        ? members.filter((m) => m.userId !== input.excludeUserId).map((m) => m.userId)
        : members.map((m) => m.userId)

      if (allIds.length === 0) return

      // Filter per channel
      const [inAppIds, emailIds] = await Promise.all([
        filterEnabledUsers(allIds, input.type, "IN_APP"),
        filterEnabledUsers(allIds, input.type, "EMAIL"),
      ])

      if (inAppIds.length > 0) {
        await db.notification.createMany({
          data: inAppIds.map((userId) => ({
            title: input.title,
            message: input.message,
            type: input.type,
            userId,
            organizationId: input.organizationId,
          })),
        })
      }

      if (emailIds.length > 0) {
        sendNotificationEmailBulk({
          userIds: emailIds,
          title: input.title,
          message: input.message,
          type: input.type,
        })
      }
    })
    .catch((err) => {
      console.error("Failed to notify org members:", err)
    })
}
