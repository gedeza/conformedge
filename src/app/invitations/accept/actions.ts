"use server"

import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit"
import { isValidInvitationCode } from "@/lib/invitations"
import type { ActionResult } from "@/types"

export interface InvitationDetails {
  id: string
  email: string
  role: string
  customMessage: string | null
  organizationName: string
  inviterName: string
  expiresAt: string
  status: string
}

export async function getInvitationByCode(code: string): Promise<ActionResult<InvitationDetails>> {
  if (!isValidInvitationCode(code)) {
    return { success: false, error: "Invalid invitation link" }
  }

  const invitation = await db.invitation.findUnique({
    where: { invitationCode: code },
    include: {
      organization: { select: { name: true } },
      invitedBy: { select: { firstName: true, lastName: true } },
    },
  })

  if (!invitation) {
    return { success: false, error: "Invitation not found" }
  }

  if (invitation.status === "REVOKED") {
    return { success: false, error: "This invitation has been revoked" }
  }

  if (invitation.status === "ACCEPTED") {
    return { success: false, error: "This invitation has already been accepted" }
  }

  if (invitation.status === "EXPIRED" || new Date() > new Date(invitation.expiresAt)) {
    return { success: false, error: "This invitation has expired" }
  }

  return {
    success: true,
    data: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      customMessage: invitation.customMessage,
      organizationName: invitation.organization.name,
      inviterName: `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`,
      expiresAt: invitation.expiresAt.toISOString(),
      status: invitation.status,
    },
  }
}

export async function acceptInvitation(code: string): Promise<ActionResult> {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return { success: false, error: "You must be signed in to accept an invitation" }
    }

    if (!isValidInvitationCode(code)) {
      return { success: false, error: "Invalid invitation link" }
    }

    const invitation = await db.invitation.findUnique({
      where: { invitationCode: code },
      include: {
        organization: { select: { id: true, clerkOrgId: true, name: true } },
      },
    })

    if (!invitation) {
      return { success: false, error: "Invitation not found" }
    }

    if (invitation.status !== "PENDING") {
      return { success: false, error: `This invitation is ${invitation.status.toLowerCase()}` }
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      // Auto-mark as expired
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      })
      return { success: false, error: "This invitation has expired" }
    }

    // Get or create the DB user
    const dbUser = await db.user.findUnique({
      where: { clerkUserId },
    })

    if (!dbUser) {
      return { success: false, error: "User not found. Please complete your profile setup first." }
    }

    // Check if already a member
    const existingMembership = await db.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: dbUser.id,
          organizationId: invitation.organization.id,
        },
      },
    })

    if (existingMembership) {
      // Mark invitation as accepted even if already a member
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      })
      return { success: true }
    }

    // Map our role to Clerk role
    const clerkRole = invitation.role === "OWNER" ? "org:admin" : "org:member"

    // Add user to Clerk org
    const clerk = await clerkClient()
    await clerk.organizations.createOrganizationMembership({
      organizationId: invitation.organization.clerkOrgId,
      userId: clerkUserId,
      role: clerkRole,
    })

    // Create OrganizationUser with specified role
    await db.organizationUser.create({
      data: {
        userId: dbUser.id,
        organizationId: invitation.organization.id,
        role: invitation.role,
      },
    })

    // Mark invitation as accepted
    await db.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    })

    logAuditEvent({
      action: "INVITE_ACCEPTED",
      entityType: "Invitation",
      entityId: invitation.id,
      metadata: {
        email: invitation.email,
        role: invitation.role,
        userId: dbUser.id,
      },
      userId: dbUser.id,
      organizationId: invitation.organization.id,
    })

    return { success: true }
  } catch (err) {
    console.error("acceptInvitation error:", err)
    return { success: false, error: "Failed to accept invitation. Please try again." }
  }
}
