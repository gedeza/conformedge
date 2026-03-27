import type { PlanTier, BillingCycle } from "@/types"

// ─────────────────────────────────────────────
// Plan Definitions — matches landing page pricing exactly
// ─────────────────────────────────────────────

export interface PlanLimits {
  maxUsers: number | null          // null = unlimited
  additionalUserFeeZar: number | null  // per-user/month fee in cents (null = not available)
  maxStandards: number | null
  maxDocuments: number | null
  maxProjects: number | null       // null = unlimited — prevents consultant abuse
  maxVendors: number | null // null = unlimited — prevents consultant abuse
  aiClassificationsPerMonth: number | null
}

export interface FeatureGates {
  ims: boolean
  clientPortal: boolean
  recurringChecklists: boolean
  reportExport: boolean
  gapAnalysis: boolean
  vendorPortal: boolean
  customFormBuilder: boolean
  auditPackGeneration: boolean
  approvalWorkflows: boolean
  customStandards: boolean
  incidentManagement: boolean              // Basic: create, track, close incidents
  advancedIncidentManagement: boolean      // Statutory forms, evidence, MHSA, LTIFR, witnesses
  objectivesTracking: boolean
  permitToWork: boolean
  equipmentManagement: boolean
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
    monthlyPriceZar: 2_299_00,     // R2,299 in cents
    description: "For small businesses getting started with SHEQ compliance.",
    limits: {
      maxUsers: 3,
      additionalUserFeeZar: 399_00,   // R399/additional user/month
      maxStandards: 2,
      maxDocuments: 1_000,
      maxProjects: 5,
      maxVendors: 10,
      aiClassificationsPerMonth: 50,
    },
    features: {
      ims: false,
      clientPortal: false,
      recurringChecklists: false,
      reportExport: false,
      gapAnalysis: false,
      vendorPortal: false,
      customFormBuilder: false,
      auditPackGeneration: false,
      approvalWorkflows: false,
      customStandards: false,
      incidentManagement: true,              // Basic incident reporting
      advancedIncidentManagement: false,     // Pro+ only
      objectivesTracking: false,
      permitToWork: false,
      equipmentManagement: false,
      apiAccess: false,
      sso: false,
    },
  },
  PROFESSIONAL: {
    tier: "PROFESSIONAL",
    name: "Professional",
    monthlyPriceZar: 5_499_00,     // R5,499 in cents (Safety-grade incident management)
    description: "For safety-conscious companies managing compliance and incidents.",
    limits: {
      maxUsers: 5,
      additionalUserFeeZar: 449_00,   // R449/additional user/month
      maxStandards: 5,
      maxDocuments: null,
      maxProjects: 15,
      maxVendors: 25,
      aiClassificationsPerMonth: 200,
    },
    features: {
      ims: true,
      clientPortal: true,
      recurringChecklists: true,
      reportExport: true,
      gapAnalysis: true,
      vendorPortal: false,
      customFormBuilder: true,
      auditPackGeneration: true,
      approvalWorkflows: true,
      customStandards: false,
      incidentManagement: true,
      advancedIncidentManagement: true,     // Statutory forms, evidence, MHSA, LTIFR, witnesses
      objectivesTracking: true,
      permitToWork: true,
      equipmentManagement: true,
      apiAccess: false,
      sso: false,
    },
  },
  BUSINESS: {
    tier: "BUSINESS",
    name: "Business",
    monthlyPriceZar: 8_499_00,     // R8,499 in cents
    description: "For multi-site firms with SA regulatory compliance needs.",
    limits: {
      maxUsers: 10,
      additionalUserFeeZar: 349_00,   // R349/additional user/month (volume discount)
      maxStandards: null,
      maxDocuments: null,
      maxProjects: 30,
      maxVendors: 50,
      aiClassificationsPerMonth: 500,
    },
    features: {
      ims: true,
      clientPortal: true,
      recurringChecklists: true,
      reportExport: true,
      gapAnalysis: true,
      vendorPortal: true,
      customFormBuilder: true,
      auditPackGeneration: true,
      approvalWorkflows: true,
      customStandards: true,
      incidentManagement: true,
      advancedIncidentManagement: true,
      objectivesTracking: true,
      permitToWork: true,
      equipmentManagement: true,
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
      maxUsers: 25,
      additionalUserFeeZar: 299_00,   // R299/additional user/month (negotiable)
      maxStandards: null,
      maxDocuments: null,
      maxProjects: null,
      maxVendors: null,
      aiClassificationsPerMonth: null,
    },
    features: {
      ims: true,
      clientPortal: true,
      recurringChecklists: true,
      reportExport: true,
      gapAnalysis: true,
      vendorPortal: true,
      customFormBuilder: true,
      auditPackGeneration: true,
      approvalWorkflows: true,
      customStandards: true,
      incidentManagement: true,
      advancedIncidentManagement: true,
      objectivesTracking: true,
      permitToWork: true,
      equipmentManagement: true,
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
  if (cents == null || isNaN(cents)) return "R0.00"
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Minimum tier required for a feature */
export function minimumTierForFeature(feature: keyof FeatureGates): PlanTier {
  const tiers: PlanTier[] = ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"]
  for (const tier of tiers) {
    if (PLAN_DEFINITIONS[tier].features[feature]) return tier
  }
  return "ENTERPRISE"
}
