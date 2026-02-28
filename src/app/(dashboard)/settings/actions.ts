"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext, getOrgMembers } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canManageOrg } from "@/lib/permissions"
import type { Prisma } from "@/generated/prisma/client"
import type { ActionResult } from "@/types"

const orgSettingsSchema = z.object({
  industry: z.string().max(100).optional(),
  country: z.string().max(2).default("ZA"),
  autoClassifyOnUpload: z.boolean().optional(),
})

export async function getOrgSettings() {
  const { dbOrgId } = await getAuthContext()

  const org = await db.organization.findUnique({
    where: { id: dbOrgId },
    select: { id: true, name: true, industry: true, country: true, settings: true },
  })

  return org
}

export async function updateOrgSettings(values: z.infer<typeof orgSettingsSchema>): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = orgSettingsSchema.parse(values)

    // Merge autoClassifyOnUpload into the settings JSON column
    const org = await db.organization.findUnique({ where: { id: dbOrgId }, select: { settings: true } })
    const existingSettings = (org?.settings as Record<string, unknown>) ?? {}
    const mergedSettings = { ...existingSettings }
    if (parsed.autoClassifyOnUpload !== undefined) {
      mergedSettings.autoClassifyOnUpload = parsed.autoClassifyOnUpload
    }

    await db.organization.update({
      where: { id: dbOrgId },
      data: {
        industry: parsed.industry,
        country: parsed.country,
        settings: mergedSettings as Prisma.InputJsonValue,
      },
    })

    logAuditEvent({
      action: "UPDATE_SETTINGS",
      entityType: "Organization",
      entityId: dbOrgId,
      metadata: parsed,
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update settings" }
  }
}

export async function getMembers() {
  const { dbOrgId } = await getAuthContext()
  return getOrgMembers(dbOrgId)
}

export async function updateMemberRole(userId: string, role: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role: callerRole } = await getAuthContext()

    if (!canManageOrg(callerRole)) {
      return { success: false, error: "Insufficient permissions" }
    }

    const membership = await db.organizationUser.findFirst({
      where: { userId, organizationId: dbOrgId },
    })

    if (!membership) return { success: false, error: "Member not found" }

    await db.organizationUser.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId: dbOrgId,
        },
      },
      data: {
        role: role as "OWNER" | "ADMIN" | "MANAGER" | "AUDITOR" | "VIEWER",
      },
    })

    logAuditEvent({
      action: "UPDATE_ROLE",
      entityType: "OrganizationUser",
      entityId: userId,
      metadata: { role },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update role" }
  }
}

export async function getStandardsList() {
  return db.standard.findMany({
    select: { id: true, code: true, name: true, version: true, isActive: true },
    orderBy: { code: "asc" },
  })
}

export async function toggleStandardActive(standardId: string, isActive: boolean): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()

    if (!canManageOrg(role)) {
      return { success: false, error: "Insufficient permissions" }
    }

    await db.standard.update({
      where: { id: standardId },
      data: { isActive },
    })

    logAuditEvent({
      action: isActive ? "ENABLE_STANDARD" : "DISABLE_STANDARD",
      entityType: "Standard",
      entityId: standardId,
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle standard" }
  }
}
