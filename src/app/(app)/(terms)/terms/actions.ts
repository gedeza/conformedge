"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit"

export async function getActiveTermsVersion() {
  const version = await db.termsVersion.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { effectiveAt: "desc" },
  })
  return version
}

export async function checkUserHasAccepted(versionId: string) {
  const { userId } = await auth()
  if (!userId) return false

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  })
  if (!user) return false

  const acceptance = await db.termsAcceptance.findUnique({
    where: {
      userId_versionId: {
        userId: user.id,
        versionId,
      },
    },
  })

  return !!acceptance
}

export async function acceptTerms(versionId: string) {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  // Verify the version exists and is active
  const version = await db.termsVersion.findUnique({
    where: { id: versionId },
  })
  if (!version || version.status !== "ACTIVE") {
    return { success: false, error: "Invalid or inactive terms version" }
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  })
  if (!user) {
    return { success: false, error: "User not found" }
  }

  // Capture request metadata for audit
  const headersList = await headers()
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  const userAgent = headersList.get("user-agent") || "unknown"

  // Create acceptance record (upsert to handle re-acceptance)
  await db.termsAcceptance.upsert({
    where: {
      userId_versionId: {
        userId: user.id,
        versionId,
      },
    },
    create: {
      userId: user.id,
      versionId,
      ipAddress,
      userAgent,
    },
    update: {
      ipAddress,
      userAgent,
      acceptedAt: new Date(),
    },
  })

  // Update Clerk publicMetadata for fast middleware checks
  try {
    const clerk = await clerkClient()
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        termsAcceptedAt: new Date().toISOString(),
        termsVersionId: versionId,
      },
    })
  } catch (error) {
    // Log but don't fail — DB record is the source of truth
    console.error("Failed to update Clerk metadata for terms acceptance:", error)
  }

  // Audit trail — organizationId is "PLATFORM" since terms are accepted before org context
  logAuditEvent({
    action: "ACCEPT_TERMS",
    entityType: "TermsVersion",
    entityId: versionId,
    userId: user.id,
    organizationId: "PLATFORM",
    metadata: { version: version.version, ip: ipAddress },
  })

  return { success: true }
}
