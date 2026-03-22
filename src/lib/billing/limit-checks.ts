import type { BillingContext, LimitCheckResult, PlanTier } from "@/types"
import { PLAN_DEFINITIONS, type FeatureGates, minimumTierForFeature } from "./plans"
import { isActiveSubscription } from "./get-billing-context"

// ─────────────────────────────────────────────
// Soft Limits (Count-Based)
// ─────────────────────────────────────────────

/**
 * Check if the org can add more users.
 * During TRIALING, user limits are NOT enforced (per design decision).
 */
export function checkUserLimit(billing: BillingContext, currentUserCount: number): LimitCheckResult {
  if (!isActiveSubscription(billing.subscription.status)) {
    return { allowed: false, reason: "Subscription is not active." }
  }

  // Trial orgs get unlimited invites — enforce on conversion only
  if (billing.subscription.status === "TRIALING") {
    return { allowed: true }
  }

  const plan = PLAN_DEFINITIONS[billing.subscription.plan]
  if (plan.limits.maxUsers === null) {
    return { allowed: true }
  }

  if (currentUserCount >= plan.limits.maxUsers) {
    const upgrade = getNextTier(billing.subscription.plan)
    const additionalFee = plan.limits.additionalUserFeeZar
      ? ` Additional users available at R${(plan.limits.additionalUserFeeZar / 100).toFixed(0)}/user/month.`
      : ""
    return {
      allowed: false,
      reason: `Your ${plan.name} plan includes ${plan.limits.maxUsers} users.${additionalFee} Upgrade for more included seats.`,
      upgradeRequired: upgrade,
      current: currentUserCount,
      limit: plan.limits.maxUsers,
    }
  }

  return { allowed: true, current: currentUserCount, limit: plan.limits.maxUsers }
}

/**
 * Check if the org can create more documents.
 */
export function checkDocumentLimit(billing: BillingContext): LimitCheckResult {
  if (!isActiveSubscription(billing.subscription.status)) {
    return { allowed: false, reason: "Subscription is not active." }
  }

  const plan = PLAN_DEFINITIONS[billing.subscription.plan]
  if (plan.limits.maxDocuments === null) {
    return { allowed: true }
  }

  if (billing.usage.documentsCount >= plan.limits.maxDocuments) {
    const upgrade = getNextTier(billing.subscription.plan)
    return {
      allowed: false,
      reason: `Your ${plan.name} plan supports up to ${plan.limits.maxDocuments} documents.`,
      upgradeRequired: upgrade,
      current: billing.usage.documentsCount,
      limit: plan.limits.maxDocuments,
    }
  }

  return { allowed: true, current: billing.usage.documentsCount, limit: plan.limits.maxDocuments }
}

/**
 * Check if the org can activate more ISO standards.
 */
export function checkStandardsLimit(billing: BillingContext, activeStandardCount: number): LimitCheckResult {
  if (!isActiveSubscription(billing.subscription.status)) {
    return { allowed: false, reason: "Subscription is not active." }
  }

  const plan = PLAN_DEFINITIONS[billing.subscription.plan]
  if (plan.limits.maxStandards === null) {
    return { allowed: true }
  }

  if (activeStandardCount >= plan.limits.maxStandards) {
    const upgrade = getNextTier(billing.subscription.plan)
    return {
      allowed: false,
      reason: `Your ${plan.name} plan supports up to ${plan.limits.maxStandards} ISO standards.`,
      upgradeRequired: upgrade,
      current: activeStandardCount,
      limit: plan.limits.maxStandards,
    }
  }

  return { allowed: true, current: activeStandardCount, limit: plan.limits.maxStandards }
}

/**
 * Check if the org can create more projects.
 * Prevents consultant abuse — a consulting firm managing 50 clients
 * as "projects" within one org instead of using the Partner program.
 */
export function checkProjectLimit(billing: BillingContext, currentProjectCount: number): LimitCheckResult {
  if (!isActiveSubscription(billing.subscription.status)) {
    return { allowed: false, reason: "Subscription is not active." }
  }

  if (billing.subscription.status === "TRIALING") {
    return { allowed: true }
  }

  const plan = PLAN_DEFINITIONS[billing.subscription.plan]
  if (plan.limits.maxProjects === null) {
    return { allowed: true }
  }

  if (currentProjectCount >= plan.limits.maxProjects) {
    const upgrade = getNextTier(billing.subscription.plan)
    return {
      allowed: false,
      reason: `Your ${plan.name} plan supports up to ${plan.limits.maxProjects} projects. Need more? Upgrade your plan or contact us about our Consulting Partner program.`,
      upgradeRequired: upgrade,
      current: currentProjectCount,
      limit: plan.limits.maxProjects,
    }
  }

  return { allowed: true, current: currentProjectCount, limit: plan.limits.maxProjects }
}

/**
 * Check if the org can add more subcontractors.
 * Prevents consultant abuse — forces high-volume subcontractor management
 * into higher tiers or the Partner program.
 */
export function checkSubcontractorLimit(billing: BillingContext, currentSubcontractorCount: number): LimitCheckResult {
  if (!isActiveSubscription(billing.subscription.status)) {
    return { allowed: false, reason: "Subscription is not active." }
  }

  if (billing.subscription.status === "TRIALING") {
    return { allowed: true }
  }

  const plan = PLAN_DEFINITIONS[billing.subscription.plan]
  if (plan.limits.maxSubcontractors === null) {
    return { allowed: true }
  }

  if (currentSubcontractorCount >= plan.limits.maxSubcontractors) {
    const upgrade = getNextTier(billing.subscription.plan)
    return {
      allowed: false,
      reason: `Your ${plan.name} plan supports up to ${plan.limits.maxSubcontractors} subcontractors. Need more? Upgrade your plan or contact us about our Consulting Partner program.`,
      upgradeRequired: upgrade,
      current: currentSubcontractorCount,
      limit: plan.limits.maxSubcontractors,
    }
  }

  return { allowed: true, current: currentSubcontractorCount, limit: plan.limits.maxSubcontractors }
}

/**
 * Check if the org can use an AI classification.
 * Priority: monthly quota first, then purchased credits.
 */
export function checkAiClassificationLimit(
  billing: BillingContext
): LimitCheckResult & { useCredit: boolean } {
  if (!isActiveSubscription(billing.subscription.status)) {
    return { allowed: false, useCredit: false, reason: "Subscription is not active." }
  }

  const plan = PLAN_DEFINITIONS[billing.subscription.plan]

  // Unlimited AI
  if (plan.limits.aiClassificationsPerMonth === null) {
    return { allowed: true, useCredit: false }
  }

  // Monthly quota still available
  if (billing.usage.aiClassificationsUsed < plan.limits.aiClassificationsPerMonth) {
    return {
      allowed: true,
      useCredit: false,
      current: billing.usage.aiClassificationsUsed,
      limit: plan.limits.aiClassificationsPerMonth,
    }
  }

  // Quota exhausted — check purchased credits
  if (billing.creditBalance > 0) {
    return {
      allowed: true,
      useCredit: true,
      current: billing.usage.aiClassificationsUsed,
      limit: plan.limits.aiClassificationsPerMonth,
    }
  }

  // No quota, no credits
  const upgrade = getNextTier(billing.subscription.plan)
  return {
    allowed: false,
    useCredit: false,
    reason: `Monthly AI classification limit reached (${plan.limits.aiClassificationsPerMonth}). Purchase credit packs or upgrade your plan.`,
    upgradeRequired: upgrade,
    current: billing.usage.aiClassificationsUsed,
    limit: plan.limits.aiClassificationsPerMonth,
  }
}

// ─────────────────────────────────────────────
// Hard Gates (Feature Access)
// ─────────────────────────────────────────────

/**
 * Check if a feature is available on the org's plan.
 */
export function checkFeatureAccess(
  billing: BillingContext,
  feature: keyof FeatureGates
): LimitCheckResult {
  if (!isActiveSubscription(billing.subscription.status)) {
    return { allowed: false, reason: "Subscription is not active." }
  }

  const plan = PLAN_DEFINITIONS[billing.subscription.plan]

  if (plan.features[feature]) {
    return { allowed: true }
  }

  const requiredTier = minimumTierForFeature(feature)
  return {
    allowed: false,
    reason: `${formatFeatureName(feature)} requires a ${PLAN_DEFINITIONS[requiredTier].name} plan or higher.`,
    upgradeRequired: requiredTier,
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const TIER_ORDER: PlanTier[] = ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"] // STARTER = Essentials in UI

function getNextTier(current: PlanTier): PlanTier | undefined {
  const idx = TIER_ORDER.indexOf(current)
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : undefined
}

function formatFeatureName(feature: keyof FeatureGates): string {
  const names: Record<keyof FeatureGates, string> = {
    ims: "Integrated Management System",
    clientPortal: "Client Portal",
    recurringChecklists: "Recurring Checklists",
    reportExport: "Report Export",
    gapAnalysis: "Gap Analysis",
    subcontractorPortal: "Subcontractor Portal",
    customFormBuilder: "Custom Form Builder",
    auditPackGeneration: "Audit Pack Generation",
    approvalWorkflows: "Approval Workflows",
    customStandards: "Custom Standards",
    incidentManagement: "Incident & Near-Miss Management",
    advancedIncidentManagement: "Advanced Incident Management (Statutory Forms, Evidence, MHSA)",
    objectivesTracking: "Objectives & KPI Tracking",
    permitToWork: "Permit to Work",
    equipmentManagement: "Equipment & Asset Management",
    apiAccess: "API Access",
    sso: "Single Sign-On",
  }
  return names[feature]
}
