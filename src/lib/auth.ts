import { cache } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export interface AuthContext {
  userId: string
  orgId: string
  dbUserId: string
  dbOrgId: string
  role: string
}

export const getAuthContext = cache(async function getAuthContext(): Promise<AuthContext> {
  const { userId, orgId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (!orgId) {
    throw new Error("No organization selected")
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  })

  if (!user) {
    throw new Error("User not found in database")
  }

  const org = await db.organization.findUnique({
    where: { clerkOrgId: orgId },
  })

  if (!org) {
    throw new Error("Organization not found in database")
  }

  const membership = await db.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: org.id,
      },
    },
  })

  if (!membership || !membership.isActive) {
    throw new Error("Not a member of this organization")
  }

  return {
    userId,
    orgId,
    dbUserId: user.id,
    dbOrgId: org.id,
    role: membership.role,
  }
})

export async function getOrgMembers(dbOrgId: string) {
  const members = await db.organizationUser.findMany({
    where: { organizationId: dbOrgId, isActive: true },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
        },
      },
    },
  })

  return members.map((m) => ({
    id: m.user.id,
    name: `${m.user.firstName} ${m.user.lastName}`,
    email: m.user.email,
    role: m.role,
    imageUrl: m.user.imageUrl,
  }))
}

export async function getCurrentUser() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  return db.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  })
}
