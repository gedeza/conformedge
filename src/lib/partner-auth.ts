import { cache } from "react"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import type { PartnerRole } from "@/types"

export interface PartnerContext {
  /** Clerk user ID */
  userId: string
  /** DB user ID */
  dbUserId: string
  /** Partner record ID */
  partnerId: string
  /** Partner name */
  partnerName: string
  /** User's role within the partner organization */
  partnerRole: PartnerRole
  /** IDs of client organizations this partner user can access */
  clientOrgIds: string[]
}

/**
 * Get authenticated partner context.
 * Returns null if the current user is not a partner user.
 * Throws if not authenticated.
 */
export const getPartnerContext = cache(async function getPartnerContext(): Promise<PartnerContext | null> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  })

  if (!user) {
    throw new Error("User not found in database")
  }

  // Find active partner membership
  const partnerUser = await db.partnerUser.findFirst({
    where: { userId: user.id, isActive: true },
    include: {
      partner: {
        select: {
          id: true,
          name: true,
          status: true,
          clientOrganizations: {
            where: { isActive: true },
            select: { organizationId: true },
          },
        },
      },
    },
  })

  if (!partnerUser) return null

  // Partner must be ACTIVE to access client orgs
  if (partnerUser.partner.status !== "ACTIVE") return null

  return {
    userId,
    dbUserId: user.id,
    partnerId: partnerUser.partner.id,
    partnerName: partnerUser.partner.name,
    partnerRole: partnerUser.role as PartnerRole,
    clientOrgIds: partnerUser.partner.clientOrganizations.map((co) => co.organizationId),
  }
})

/**
 * Validate that a partner user has access to a specific client organization.
 * Returns the PartnerOrganization record or null.
 */
export async function validatePartnerOrgAccess(partnerId: string, organizationId: string) {
  return db.partnerOrganization.findFirst({
    where: {
      partnerId,
      organizationId,
      isActive: true,
    },
  })
}

/**
 * Get partner details with client org summary for the partner dashboard.
 */
export async function getPartnerDashboardData(partnerId: string) {
  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    include: {
      clientOrganizations: {
        where: { isActive: true },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              industry: true,
              createdAt: true,
              _count: {
                select: {
                  members: { where: { isActive: true } },
                  documents: true,
                  capas: true,
                  incidents: true,
                  assessments: true,
                },
              },
            },
          },
        },
        orderBy: { onboardedAt: "desc" },
      },
      partnerUsers: {
        where: { isActive: true },
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
      },
    },
  })

  return partner
}
