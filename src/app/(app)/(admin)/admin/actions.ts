"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getSuperAdminContext } from "@/lib/admin-auth"
import type { ActionResult } from "@/types"

// ─────────────────────────────────────────────
// OVERVIEW METRICS
// ─────────────────────────────────────────────

export async function getAdminOverview() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalOrgs,
    totalUsers,
    activeSubscriptions,
    trialSubscriptions,
    totalPartners,
    totalDocuments,
    totalCapas,
    totalIncidents,
    recentOrgs,
    recentUsers,
    subscriptionsByPlan,
  ] = await Promise.all([
    db.organization.count(),
    db.user.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.count({ where: { status: "TRIALING" } }),
    db.partner.count({ where: { status: "ACTIVE" } }),
    db.document.count(),
    db.capa.count(),
    db.incident.count(),
    db.organization.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.subscription.groupBy({
      by: ["plan"],
      _count: true,
      where: { status: { in: ["ACTIVE", "TRIALING"] } },
    }),
  ])

  // Calculate MRR from active subscriptions
  const subscriptions = await db.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { plan: true },
  })

  // Plan prices in cents
  const planPrices: Record<string, number> = {
    STARTER: 229900,
    PROFESSIONAL: 449900,
    BUSINESS: 849900,
    ENTERPRISE: 1699900,
  }

  const mrrCents = subscriptions.reduce(
    (sum, s) => sum + (planPrices[s.plan] ?? 0),
    0
  )

  // Partner MRR
  const partnerInvoices = await db.partnerInvoice.findMany({
    where: {
      status: { in: ["OPEN", "PAID"] },
      periodStart: { gte: thirtyDaysAgo },
    },
    select: { totalCents: true },
  })
  const partnerMrrCents = partnerInvoices.reduce((sum, i) => sum + i.totalCents, 0)

  return {
    totalOrgs,
    totalUsers,
    activeSubscriptions,
    trialSubscriptions,
    totalPartners,
    totalDocuments,
    totalCapas,
    totalIncidents,
    recentOrgs,
    recentUsers,
    mrrCents,
    partnerMrrCents,
    subscriptionsByPlan: subscriptionsByPlan.map((s) => ({
      plan: s.plan,
      count: s._count,
    })),
  }
}

// ─────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────

export async function getAdminOrganizations() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  return db.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      createdAt: true,
      subscription: {
        select: { plan: true, status: true, trialEndsAt: true },
      },
      _count: {
        select: {
          members: { where: { isActive: true } },
          documents: true,
          capas: true,
          incidents: true,
        },
      },
      partnerOrganizations: {
        where: { isActive: true },
        select: {
          partner: { select: { name: true, tier: true } },
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAdminOrgDetail(orgId: string) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  return db.organization.findUnique({
    where: { id: orgId },
    include: {
      subscription: true,
      creditBalance: true,
      members: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              lastLoginAt: true,
              isSuperAdmin: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          documents: true,
          assessments: true,
          capas: true,
          checklists: true,
          subcontractors: true,
          incidents: true,
          objectives: true,
          workPermits: true,
          projects: true,
        },
      },
      partnerOrganizations: {
        where: { isActive: true },
        include: {
          partner: { select: { id: true, name: true, tier: true, status: true } },
        },
      },
      usageRecords: {
        orderBy: { periodStart: "desc" },
        take: 3,
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })
}

// ─────────────────────────────────────────────
// SUBSCRIPTION MANAGEMENT
// ─────────────────────────────────────────────

const updateSubscriptionSchema = z.object({
  orgId: z.string().uuid(),
  plan: z.enum(["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"]).optional(),
  status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELLED", "PAUSED"]).optional(),
})

export async function adminUpdateSubscription(
  data: z.infer<typeof updateSubscriptionSchema>
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const parsed = updateSubscriptionSchema.parse(data)

    const sub = await db.subscription.findUnique({
      where: { organizationId: parsed.orgId },
    })
    if (!sub) return { success: false, error: "No subscription found for this organization" }

    await db.subscription.update({
      where: { organizationId: parsed.orgId },
      data: {
        ...(parsed.plan && { plan: parsed.plan }),
        ...(parsed.status && { status: parsed.status }),
      },
    })

    revalidatePath(`/admin/organizations/${parsed.orgId}`)
    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (err) {
    console.error("adminUpdateSubscription error:", err)
    return { success: false, error: "Failed to update subscription" }
  }
}

const adjustCreditsSchema = z.object({
  orgId: z.string().uuid(),
  amount: z.number().int(),
  description: z.string().min(1).max(500),
})

export async function adminAdjustCredits(
  data: z.infer<typeof adjustCreditsSchema>
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const parsed = adjustCreditsSchema.parse(data)

    await db.$transaction(async (tx) => {
      const balance = await tx.creditBalance.upsert({
        where: { organizationId: parsed.orgId },
        update: {
          balance: { increment: parsed.amount },
          lifetimeEarned: parsed.amount > 0 ? { increment: parsed.amount } : undefined,
        },
        create: {
          organizationId: parsed.orgId,
          balance: parsed.amount,
          lifetimeEarned: Math.max(0, parsed.amount),
        },
      })

      await tx.creditTransaction.create({
        data: {
          type: "ADJUSTMENT",
          amount: parsed.amount,
          balanceAfter: balance.balance,
          description: `[Admin] ${parsed.description}`,
          organizationId: parsed.orgId,
        },
      })
    })

    revalidatePath(`/admin/organizations/${parsed.orgId}`)
    return { success: true }
  } catch (err) {
    console.error("adminAdjustCredits error:", err)
    return { success: false, error: "Failed to adjust credits" }
  }
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export async function getAdminUsers() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  return db.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isSuperAdmin: true,
      lastLoginAt: true,
      createdAt: true,
      memberships: {
        where: { isActive: true },
        select: {
          role: true,
          organization: { select: { name: true } },
        },
      },
      partnerUsers: {
        where: { isActive: true },
        select: {
          role: true,
          partner: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function adminToggleSuperAdmin(
  userId: string,
  isSuperAdmin: boolean
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    // Prevent removing your own superadmin access
    if (userId === ctx.dbUserId && !isSuperAdmin) {
      return { success: false, error: "Cannot remove your own super admin access" }
    }

    await db.user.update({
      where: { id: userId },
      data: { isSuperAdmin },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    console.error("adminToggleSuperAdmin error:", err)
    return { success: false, error: "Failed to update user" }
  }
}

// ─────────────────────────────────────────────
// SUBSCRIPTIONS LIST
// ─────────────────────────────────────────────

export async function getAdminSubscriptions() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  return db.subscription.findMany({
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

// ─────────────────────────────────────────────
// PARTNERS LIST
// ─────────────────────────────────────────────

export async function getAdminPartners() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  return db.partner.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      tier: true,
      status: true,
      contactEmail: true,
      createdAt: true,
      commissionPercent: true,
      basePlatformFeeCents: true,
      _count: {
        select: {
          clientOrganizations: { where: { isActive: true } },
          partnerUsers: { where: { isActive: true } },
          referrals: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}
