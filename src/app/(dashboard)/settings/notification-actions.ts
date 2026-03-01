"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import type { NotificationType } from "@/types"
import type { ActionResult } from "@/types"

type Channel = "IN_APP" | "EMAIL"

export type NotificationPreferenceMap = Record<
  NotificationType,
  { IN_APP: boolean; EMAIL: boolean }
>

const NOTIFICATION_TYPES: NotificationType[] = [
  "DOCUMENT_EXPIRY",
  "CAPA_DUE",
  "ASSESSMENT_SCHEDULED",
  "CERT_EXPIRY",
  "SYSTEM",
  "APPROVAL_REQUEST",
  "CERT_UPLOAD",
  "CHECKLIST_DUE",
]

/**
 * Get all notification preferences for current user.
 * Opt-out model: missing row = enabled (true).
 */
export async function getNotificationPreferences(): Promise<NotificationPreferenceMap> {
  const { dbUserId } = await getAuthContext()

  const optOuts = await db.notificationPreference.findMany({
    where: { userId: dbUserId },
    select: { type: true, channel: true },
  })

  const optOutSet = new Set(optOuts.map((o) => `${o.type}:${o.channel}`))

  const map = {} as NotificationPreferenceMap
  for (const type of NOTIFICATION_TYPES) {
    map[type] = {
      IN_APP: !optOutSet.has(`${type}:IN_APP`),
      EMAIL: !optOutSet.has(`${type}:EMAIL`),
    }
  }

  return map
}

/**
 * Toggle a notification preference for current user.
 * isEnabled=true → delete opt-out row (enable).
 * isEnabled=false → create opt-out row (disable).
 */
export async function updateNotificationPreference(
  type: NotificationType,
  channel: Channel,
  isEnabled: boolean
): Promise<ActionResult> {
  try {
    const { dbUserId } = await getAuthContext()

    if (isEnabled) {
      // Remove opt-out row → notification is enabled
      await db.notificationPreference.deleteMany({
        where: { userId: dbUserId, type, channel },
      })
    } else {
      // Create opt-out row → notification is disabled
      await db.notificationPreference.upsert({
        where: { userId_type_channel: { userId: dbUserId, type, channel } },
        create: { userId: dbUserId, type, channel },
        update: {},
      })
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update preference",
    }
  }
}
