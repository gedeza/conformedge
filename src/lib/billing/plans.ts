import type { PlanTier, BillingCycle } from "@/types"

// ─────────────────────────────────────────────
// Plan Definitions — matches landing page pricing exactly
// ─────────────────────────────────────────────

export interface PlanLimits {
  maxUsers: number | null          // null = unlimited
  maxStandards: number | null
  maxDocuments: number | null
  maxProjects: number | null       // null = unlimited — prevents consultant abuse
  maxSubcontractors: number | null // null = unlimited — prevents consultant abuse
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
  incidentManagement: boolean
  objectivesTracking: boolean
  permitToWork: boolean
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
    name: "Essentials",
    monthlyPriceZar: 1_299_00,     // R1,299 in cents
    description: "For small businesses getting started with ISO compliance.",
    limits: {
      maxUsers: 5,
      maxStandards: 2,
      maxDocuments: 1_000,
      maxProjects: 5,
      maxSubcontractors: 10,
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
      incidentManagement: false,
      objectivesTracking: false,
      permitToWork: false,
      apiAccess: false,
      sso: false,
    },
  },
  PROFESSIONAL: {
    tier: "PROFESSIONAL",
    name: "Professional",
    monthlyPriceZar: 2_999_00,     // R2,999 in cents
    description: "For growing companies managing multiple standards.",
    limits: {
      maxUsers: 10,
      maxStandards: 5,
      maxDocuments: null,
      maxProjects: 15,
      maxSubcontractors: 25,
      aiClassificationsPerMonth: 200,
    },
    features: {
      ims: true,
      clientPortal: true,
      recurringChecklists: true,
      reportExport: true,
      gapAnalysis: true,
      subcontractorPortal: false,
      customFormBuilder: true,
      auditPackGeneration: true,
      approvalWorkflows: true,
      customStandards: false,
      incidentManagement: true,
      objectivesTracking: true,
      permitToWork: true,
      apiAccess: false,
      sso: false,
    },
  },
  BUSINESS: {
    tier: "BUSINESS",
    name: "Business",
    monthlyPriceZar: 5_999_00,     // R5,999 in cents
    description: "For multi-site firms with SA regulatory compliance needs.",
    limits: {
      maxUsers: 25,
      maxStandards: null,
      maxDocuments: null,
      maxProjects: 30,
      maxSubcontractors: 50,
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
      incidentManagement: true,
      objectivesTracking: true,
      permitToWork: true,
      apiAccess: true,
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
      maxProjects: null,
      maxSubcontractors: null,
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
      incidentManagement: true,
      objectivesTracking: true,
      permitToWork: true,
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
  { id: "pack-100", credits: 100, priceZar: 25_00, perCreditZar: 25 },
  { id: "pack-500", credits: 500, priceZar: 99_00, perCreditZar: 19 },
  { id: "pack-1000", credits: 1000, priceZar: 179_00, perCreditZar: 17 },
  { id: "pack-5000", credits: 5000, priceZar: 749_00, perCreditZar: 14 },
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
