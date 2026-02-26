"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import type { ActionResult } from "@/types"
import type { NotificationType } from "@/types"

export async function getNotifications(opts?: {
  type?: NotificationType
  unreadOnly?: boolean
  limit?: number
}) {
  const { dbUserId, dbOrgId } = await getAuthContext()

  return db.notification.findMany({
    where: {
      userId: dbUserId,
      organizationId: dbOrgId,
      ...(opts?.type ? { type: opts.type } : {}),
      ...(opts?.unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 50,
  })
}

export async function getUnreadCount(): Promise<number> {
  const { dbUserId, dbOrgId } = await getAuthContext()

  return db.notification.count({
    where: {
      userId: dbUserId,
      organizationId: dbOrgId,
      isRead: false,
    },
  })
}

export async function markAsRead(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    await db.notification.updateMany({
      where: { id, userId: dbUserId, organizationId: dbOrgId },
      data: { isRead: true, readAt: new Date() },
    })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to mark as read" }
  }
}

export async function markAllAsRead(): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    await db.notification.updateMany({
      where: { userId: dbUserId, organizationId: dbOrgId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to mark all as read" }
  }
}

export async function deleteNotification(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const existing = await db.notification.findFirst({
      where: { id, userId: dbUserId, organizationId: dbOrgId },
    })
    if (!existing) return { success: false, error: "Notification not found" }

    await db.notification.delete({ where: { id } })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete notification" }
  }
}
