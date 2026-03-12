import { cache } from "react"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export interface SuperAdminContext {
  userId: string
  dbUserId: string
  email: string
  firstName: string
  lastName: string
}

/**
 * Get super admin context. Returns null if user is not a super admin.
 * Cached per-request via React cache().
 */
export const getSuperAdminContext = cache(async function getSuperAdminContext(): Promise<SuperAdminContext | null> {
  const { userId } = await auth()

  if (!userId) return null

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isSuperAdmin: true,
    },
  })

  if (!user || !user.isSuperAdmin) return null

  return {
    userId,
    dbUserId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  }
})
