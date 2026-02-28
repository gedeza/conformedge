import { db } from "@/lib/db"
import type { NotificationType } from "@/types"

type Channel = "IN_APP" | "EMAIL"

/**
 * Check if a notification is enabled for a specific user/type/channel.
 * Opt-out model: no row = enabled (default). A row means disabled.
 */
export async function isNotificationEnabled(
  userId: string,
  type: NotificationType,
  channel: Channel
): Promise<boolean> {
  const optOut = await db.notificationPreference.findUnique({
    where: { userId_type_channel: { userId, type, channel } },
  })
  return !optOut // No row = enabled
}

/**
 * Filter a list of userIds to only those who have NOT opted out of a
 * given notification type + channel.
 * Returns the subset of userIds that should still receive the notification.
 */
export async function filterEnabledUsers(
  userIds: string[],
  type: NotificationType,
  channel: Channel
): Promise<string[]> {
  if (userIds.length === 0) return []

  const optOuts = await db.notificationPreference.findMany({
    where: {
      userId: { in: userIds },
      type,
      channel,
    },
    select: { userId: true },
  })

  const optedOut = new Set(optOuts.map((o) => o.userId))
  return userIds.filter((id) => !optedOut.has(id))
}
