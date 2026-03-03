import type { PlanTier, BillingCycle } from "@/types"

// ─────────────────────────────────────────────
// Plan Definitions — matches landing page pricing exactly
// ─────────────────────────────────────────────

export interface PlanLimits {
  maxUsers: number | null          // null = unlimited
  maxStandards: number | null
  maxDocuments: number | null
  aiClassificationsPerMonth: number | null
}

export interface FeatureGates {
  ims: boolean
  clientPortal: boolean
  recurringChecklists: boolean
  reportExport: boolean
  gapAnalysis: boolean
  subcontractorPortal: boolean
  customFormBuilder: boolean
  auditPackGeneration: boolean
  approvalWorkflows: boolean
  customStandards: boolean
  apiAccess: boolean
  sso: boolean
}

export interface PlanDefinition {
  tier: PlanTier
  name: string
  monthlyPriceZar: number | null   // null = custom (Enterprise)
  description: string
  limits: PlanLimits
  features: FeatureGates
}

export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  STARTER: {
    tier: "STARTER",
    name: "Starter",
    monthlyPriceZar: 699_00,       // R699 in cents
    description: "For small businesses getting started with ISO compliance.",
    limits: {
      maxUsers: 5,
      maxStandards: 2,
      maxDocuments: 500,
      aiClassificationsPerMonth: 50,
    },
    features: {
      ims: false,
      clientPortal: false,
      recurringChecklists: false,
      reportExport: false,
      gapAnalysis: false,
      subcontractorPortal: false,
      customFormBuilder: false,
      auditPackGeneration: false,
      approvalWorkflows: false,
      customStandards: false,
      apiAccess: false,
      sso: false,
    },
  },
  PROFESSIONAL: {
    tier: "PROFESSIONAL",
    name: "Professional",
    monthlyPriceZar: 1_999_00,     // R1,999 in cents
    description: "For growing companies managing multiple standards.",
    limits: {
      maxUsers: 15,
      maxStandards: 7,
      maxDocuments: null,
      aiClassificationsPerMonth: 200,
    },
    features: {
      ims: true,
      clientPortal: true,
      recurringChecklists: true,
      reportExport: true,
      gapAnalysis: true,
      subcontractorPortal: false,
      customFormBuilder: false,
      auditPackGeneration: false,
      approvalWorkflows: false,
      customStandards: false,
      apiAccess: false,
      sso: false,
    },
  },
  BUSINESS: {
    tier: "BUSINESS",
    name: "Business",
    monthlyPriceZar: 4_499_00,     // R4,499 in cents
    description: "For multi-site firms with advanced compliance needs.",
    limits: {
      maxUsers: 50,
      maxStandards: null,
      maxDocuments: null,
      aiClassificationsPerMonth: 500,
    },
    features: {
      ims: true,
      clientPortal: true,
      recurringChecklists: true,
      reportExport: true,
      gapAnalysis: true,
      subcontractorPortal: true,
      customFormBuilder: true,
      auditPackGeneration: true,
      approvalWorkflows: true,
      customStandards: true,
      apiAccess: false,
      sso: false,
    },
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    name: "Enterprise",
    monthlyPriceZar: null,
    description: "For large organisations needing full control and scale.",
    limits: {
      maxUsers: null,
      maxStandards: null,
      maxDocuments: null,
      aiClassificationsPerMonth: null,
    },
    features: {
      ims: true,
      clientPortal: true,
      recurringChecklists: true,
      reportExport: true,
      gapAnalysis: true,
      subcontractorPortal: true,
      customFormBuilder: true,
      auditPackGeneration: true,
      approvalWorkflows: true,
      customStandards: true,
      apiAccess: true,
      sso: true,
    },
  },
}

// ─────────────────────────────────────────────
// Credit Packs
// ─────────────────────────────────────────────

export interface CreditPack {
  id: string
  credits: number
  priceZar: number          // in cents
  perCreditZar: number      // in cents
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "pack-100", credits: 100, priceZar: 15_00, perCreditZar: 15 },
  { id: "pack-500", credits: 500, priceZar: 65_00, perCreditZar: 13 },
  { id: "pack-1000", credits: 1000, priceZar: 120_00, perCreditZar: 12 },
]

// ─────────────────────────────────────────────
// Billing Constants
// ─────────────────────────────────────────────

/** Annual billing = pay 10 months for 12 (~17% discount) */
export const ANNUAL_DISCOUNT_MONTHS = 10

/** Free trial duration in days */
export const TRIAL_DURATION_DAYS = 14

/** Onboarding AI credits granted to every new org */
export const ONBOARDING_CREDITS = 100

/** Grace period (days) after payment failure before cancellation */
export const GRACE_PERIOD_DAYS = 7

/** SA VAT rate (15%) */
export const VAT_RATE = 0.15

/** Quota warning threshold (notify at 80% usage) */
export const QUOTA_WARNING_THRESHOLD = 0.8

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function getPlanDefinition(tier: PlanTier): PlanDefinition {
  return PLAN_DEFINITIONS[tier]
}

export function getMonthlyPriceZar(tier: PlanTier, cycle: BillingCycle): number | null {
  const plan = PLAN_DEFINITIONS[tier]
  if (plan.monthlyPriceZar === null) return null
  if (cycle === "ANNUAL") {
    return Math.round((plan.monthlyPriceZar * ANNUAL_DISCOUNT_MONTHS) / 12)
  }
  return plan.monthlyPriceZar
}

export function formatZar(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`
}

/** Minimum tier required for a feature */
export function minimumTierForFeature(feature: keyof FeatureGates): PlanTier {
  const tiers: PlanTier[] = ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"]
  for (const tier of tiers) {
    if (PLAN_DEFINITIONS[tier].features[feature]) return tier
  }
  return "ENTERPRISE"
}
