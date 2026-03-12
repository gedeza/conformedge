// @ts-nocheck — Dormant file: custom invitations disabled in favor of Clerk's built-in system
"use server"

import { revalidatePath } from "next/cache"
import { addDays } from "date-fns"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canManageOrg } from "@/lib/permissions"
import { generateInvitationCode } from "@/lib/invitations"
import { sendInvitationEmail } from "@/lib/email"
import { APP_URL } from "@/lib/constants"
import type { ActionResult } from "@/types"

const INVITATION_EXPIRY_DAYS = 7

const sendInvitationSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["ADMIN", "MANAGER", "AUDITOR", "VIEWER"]),
  customMessage: z.string().max(500).optional(),
})

export type SendInvitationValues = z.infer<typeof sendInvitationSchema>

export async function sendInvitation(values: SendInvitationValues): Promise<ActionResult<{ id: string }>> {
  // Feature disabled — invitations are handled via Clerk's built-in system
  return { success: false, error: "Custom invitations are disabled. Use the organization profile to invite members." }

  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }

    const parsed = sendInvitationSchema.parse(values)
    const email = parsed.email.toLowerCase()

    // Check if user is already a member of this org
    const existingMember = await db.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { organizationId: dbOrgId, isActive: true },
        },
      },
    })
    if (existingMember && existingMember.memberships.length > 0) {
      return { success: false, error: "This user is already a member of your organization" }
    }

    // Check for existing pending invitation
    const existingInvite = await db.invitation.findFirst({
      where: {
        email,
        organizationId: dbOrgId,
        status: "PENDING",
      },
    })
    if (existingInvite) {
      return { success: false, error: "A pending invitation already exists for this email" }
    }

    // Get org and inviter info for the email
    const [org, inviter] = await Promise.all([
      db.organization.findUnique({ where: { id: dbOrgId }, select: { name: true } }),
      db.user.findUnique({ where: { id: dbUserId }, select: { firstName: true, lastName: true } }),
    ])
    if (!org || !inviter) return { success: false, error: "Organization or user not found" }

    const invitationCode = generateInvitationCode()
    const expiresAt = addDays(new Date(), INVITATION_EXPIRY_DAYS)

    const invitation = await db.invitation.create({
      data: {
        invitationCode,
        email,
        role: parsed.role,
        customMessage: parsed.customMessage || null,
        expiresAt,
        organizationId: dbOrgId,
        invitedById: dbUserId,
      },
    })

    const acceptUrl = `${APP_URL}/invitations/accept?code=${invitationCode}`
    const inviterName = `${inviter.firstName} ${inviter.lastName}`

    sendInvitationEmail({
      toEmail: email,
      organizationName: org.name,
      inviterName,
      role: parsed.role,
      customMessage: parsed.customMessage,
      acceptUrl,
      expiresAt,
    })

    logAuditEvent({
      action: "INVITE_SENT",
      entityType: "Invitation",
      entityId: invitation.id,
      metadata: { email, role: parsed.role },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true, data: { id: invitation.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? "Validation error" }
    }
    console.error("sendInvitation error:", err)
    return { success: false, error: "Failed to send invitation" }
  }
}

export async function getInvitations() {
  const { dbOrgId } = await getAuthContext()

  return db.invitation.findMany({
    where: { organizationId: dbOrgId },
    include: {
      invitedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export type InvitationItem = Awaited<ReturnType<typeof getInvitations>>[number]

export async function revokeInvitation(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }

    const invitation = await db.invitation.findFirst({
      where: { id, organizationId: dbOrgId, status: "PENDING" },
    })
    if (!invitation) return { success: false, error: "Invitation not found or not pending" }

    await db.invitation.update({
      where: { id },
      data: { status: "REVOKED", revokedAt: new Date() },
    })

    logAuditEvent({
      action: "INVITE_REVOKED",
      entityType: "Invitation",
      entityId: id,
      metadata: { email: invitation.email },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (err) {
    console.error("revokeInvitation error:", err)
    return { success: false, error: "Failed to revoke invitation" }
  }
}

export async function resendInvitation(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }

    const invitation = await db.invitation.findFirst({
      where: { id, organizationId: dbOrgId, status: "PENDING" },
    })
    if (!invitation) return { success: false, error: "Invitation not found or not pending" }

    // Generate a new code and extend expiry
    const newCode = generateInvitationCode()
    const newExpiresAt = addDays(new Date(), INVITATION_EXPIRY_DAYS)

    await db.invitation.update({
      where: { id },
      data: { invitationCode: newCode, expiresAt: newExpiresAt },
    })

    const [org, inviter] = await Promise.all([
      db.organization.findUnique({ where: { id: dbOrgId }, select: { name: true } }),
      db.user.findUnique({ where: { id: dbUserId }, select: { firstName: true, lastName: true } }),
    ])
    if (!org || !inviter) return { success: false, error: "Organization or user not found" }

    const acceptUrl = `${APP_URL}/invitations/accept?code=${newCode}`
    const inviterName = `${inviter.firstName} ${inviter.lastName}`

    sendInvitationEmail({
      toEmail: invitation.email,
      organizationName: org.name,
      inviterName,
      role: invitation.role,
      customMessage: invitation.customMessage,
      acceptUrl,
      expiresAt: newExpiresAt,
    })

    logAuditEvent({
      action: "INVITE_RESENT",
      entityType: "Invitation",
      entityId: id,
      metadata: { email: invitation.email },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (err) {
    console.error("resendInvitation error:", err)
    return { success: false, error: "Failed to resend invitation" }
  }
}
