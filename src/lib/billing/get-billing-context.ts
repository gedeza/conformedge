import { cache } from "react"
import { db } from "@/lib/db"
import type { BillingContext, PlanTier, SubscriptionStatus, BillingCycle } from "@/types"
import { PLAN_DEFINITIONS } from "./plans"

/**
 * Cached billing context fetcher — mirrors getAuthContext() pattern.
 * One DB hit per request via React cache().
 */
export const getBillingContext = cache(async function getBillingContext(
  dbOrgId: string
): Promise<BillingContext> {
  const [subscription, creditBalance, usageRecord] = await Promise.all([
    db.subscription.findUnique({
      where: { organizationId: dbOrgId },
    }),
    db.creditBalance.findUnique({
      where: { organizationId: dbOrgId },
    }),
    getCurrentUsageRecord(dbOrgId),
  ])

  // Default to Starter/Trialing if no subscription exists (shouldn't happen after bootstrap)
  const plan: PlanTier = (subscription?.plan as PlanTier) ?? "STARTER"
  const status: SubscriptionStatus = (subscription?.status as SubscriptionStatus) ?? "TRIALING"
  const billingCycle: BillingCycle = (subscription?.billingCycle as BillingCycle) ?? "MONTHLY"

  return {
    subscription: {
      plan,
      status,
      billingCycle,
      currentPeriodStart: subscription?.currentPeriodStart ?? new Date(),
      currentPeriodEnd: subscription?.currentPeriodEnd ?? new Date(),
      trialEndsAt: subscription?.trialEndsAt ?? null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    },
    creditBalance: creditBalance?.balance ?? 0,
    usage: {
      aiClassificationsUsed: usageRecord?.aiClassificationsUsed ?? 0,
      documentsCount: usageRecord?.documentsCount ?? 0,
      usersCount: usageRecord?.usersCount ?? 0,
      standardsCount: usageRecord?.standardsCount ?? 0,
    },
  }
})

/**
 * Get the usage record for the current billing period.
 * Returns null if none exists yet (will be created on first usage).
 */
async function getCurrentUsageRecord(dbOrgId: string) {
  const subscription = await db.subscription.findUnique({
    where: { organizationId: dbOrgId },
    select: { currentPeriodStart: true },
  })

  if (!subscription) return null

  return db.usageRecord.findUnique({
    where: {
      organizationId_periodStart: {
        organizationId: dbOrgId,
        periodStart: subscription.currentPeriodStart,
      },
    },
  })
}

/**
 * Check if a subscription is in an active billing state
 * (can use features — TRIALING and ACTIVE both count).
 */
export function isActiveSubscription(status: SubscriptionStatus): boolean {
  return status === "TRIALING" || status === "ACTIVE"
}

/**
 * Get the plan definition for a billing context.
 */
export function getPlanFromContext(billing: BillingContext) {
  return PLAN_DEFINITIONS[billing.subscription.plan]
}
