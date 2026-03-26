import { describe, it, expect } from "vitest"
import {
  checkFeatureAccess,
  checkUserLimit,
  checkDocumentLimit,
  checkStandardsLimit,
  checkProjectLimit,
  checkVendorLimit,
  checkAiClassificationLimit,
} from "../limit-checks"
import type { BillingContext } from "@/types"

// ─────────────────────────────────────────────
// Test Helpers — build BillingContext fixtures
// ─────────────────────────────────────────────

function makeBilling(overrides: {
  plan?: BillingContext["subscription"]["plan"]
  status?: BillingContext["subscription"]["status"]
  creditBalance?: number
  aiUsed?: number
  docsCount?: number
}): BillingContext {
  return {
    subscription: {
      plan: overrides.plan ?? "STARTER",
      status: overrides.status ?? "ACTIVE",
      billingCycle: "MONTHLY",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
      gracePeriodEndsAt: null,
    },
    creditBalance: overrides.creditBalance ?? 0,
    usage: {
      aiClassificationsUsed: overrides.aiUsed ?? 0,
      documentsCount: overrides.docsCount ?? 0,
      usersCount: 1,
      standardsCount: 1,
    },
  }
}

// ─────────────────────────────────────────────
// Inactive Subscription Guards
// ─────────────────────────────────────────────

describe("Inactive subscription blocks all checks", () => {
  const cancelled = makeBilling({ status: "CANCELLED" })
  const paused = makeBilling({ status: "PAUSED" })
  const pastDue = makeBilling({ status: "PAST_DUE" })

  it.each([
    ["CANCELLED", cancelled],
    ["PAUSED", paused],
    ["PAST_DUE", pastDue],
  ] as const)("%s subscription blocks feature access", (_, billing) => {
    expect(checkFeatureAccess(billing, "ims").allowed).toBe(false)
  })

  it.each([
    ["CANCELLED", cancelled],
    ["PAUSED", paused],
  ] as const)("%s subscription blocks user limit check", (_, billing) => {
    expect(checkUserLimit(billing, 0).allowed).toBe(false)
  })

  it("CANCELLED blocks AI classification", () => {
    expect(checkAiClassificationLimit(cancelled).allowed).toBe(false)
  })
})

// ─────────────────────────────────────────────
// Feature Access (Hard Gates)
// ─────────────────────────────────────────────

describe("checkFeatureAccess", () => {
  it("STARTER can access incidentManagement", () => {
    const billing = makeBilling({ plan: "STARTER" })
    expect(checkFeatureAccess(billing, "incidentManagement").allowed).toBe(true)
  })

  it("STARTER cannot access IMS", () => {
    const billing = makeBilling({ plan: "STARTER" })
    const result = checkFeatureAccess(billing, "ims")
    expect(result.allowed).toBe(false)
    expect(result.upgradeRequired).toBe("PROFESSIONAL")
  })

  it("STARTER cannot access advancedIncidentManagement", () => {
    const billing = makeBilling({ plan: "STARTER" })
    const result = checkFeatureAccess(billing, "advancedIncidentManagement")
    expect(result.allowed).toBe(false)
    expect(result.upgradeRequired).toBe("PROFESSIONAL")
  })

  it("PROFESSIONAL can access equipmentManagement", () => {
    const billing = makeBilling({ plan: "PROFESSIONAL" })
    expect(checkFeatureAccess(billing, "equipmentManagement").allowed).toBe(true)
  })

  it("PROFESSIONAL cannot access vendorPortal", () => {
    const billing = makeBilling({ plan: "PROFESSIONAL" })
    const result = checkFeatureAccess(billing, "vendorPortal")
    expect(result.allowed).toBe(false)
    expect(result.upgradeRequired).toBe("BUSINESS")
  })

  it("BUSINESS can access apiAccess", () => {
    const billing = makeBilling({ plan: "BUSINESS" })
    expect(checkFeatureAccess(billing, "apiAccess").allowed).toBe(true)
  })

  it("BUSINESS cannot access SSO", () => {
    const billing = makeBilling({ plan: "BUSINESS" })
    const result = checkFeatureAccess(billing, "sso")
    expect(result.allowed).toBe(false)
    expect(result.upgradeRequired).toBe("ENTERPRISE")
  })

  it("ENTERPRISE can access every feature", () => {
    const billing = makeBilling({ plan: "ENTERPRISE" })
    const features = [
      "ims", "clientPortal", "recurringChecklists", "reportExport",
      "gapAnalysis", "vendorPortal", "customFormBuilder", "auditPackGeneration",
      "approvalWorkflows", "customStandards", "incidentManagement",
      "advancedIncidentManagement", "objectivesTracking", "permitToWork",
      "equipmentManagement", "apiAccess", "sso",
    ] as const

    for (const feature of features) {
      expect(checkFeatureAccess(billing, feature).allowed).toBe(true)
    }
  })

  it("TRIALING subscription can access features on its plan", () => {
    const billing = makeBilling({ plan: "PROFESSIONAL", status: "TRIALING" })
    expect(checkFeatureAccess(billing, "ims").allowed).toBe(true)
    expect(checkFeatureAccess(billing, "advancedIncidentManagement").allowed).toBe(true)
  })
})

// ─────────────────────────────────────────────
// User Limits (Soft Gates)
// ─────────────────────────────────────────────

describe("checkUserLimit", () => {
  it("allows when under limit", () => {
    const billing = makeBilling({ plan: "STARTER" })
    expect(checkUserLimit(billing, 2).allowed).toBe(true)
  })

  it("blocks when at limit", () => {
    const billing = makeBilling({ plan: "STARTER" }) // max 3
    const result = checkUserLimit(billing, 3)
    expect(result.allowed).toBe(false)
    expect(result.upgradeRequired).toBe("PROFESSIONAL")
  })

  it("blocks when over limit", () => {
    const billing = makeBilling({ plan: "STARTER" })
    expect(checkUserLimit(billing, 5).allowed).toBe(false)
  })

  it("TRIALING bypasses user limit", () => {
    const billing = makeBilling({ plan: "STARTER", status: "TRIALING" })
    expect(checkUserLimit(billing, 100).allowed).toBe(true)
  })

  it("ENTERPRISE allows 25 included users", () => {
    const billing = makeBilling({ plan: "ENTERPRISE" })
    expect(checkUserLimit(billing, 24).allowed).toBe(true)
  })

  it("reports current and limit in result", () => {
    const billing = makeBilling({ plan: "PROFESSIONAL" })
    const result = checkUserLimit(billing, 3)
    expect(result.current).toBe(3)
    expect(result.limit).toBe(5)
  })
})

// ─────────────────────────────────────────────
// Document Limits
// ─────────────────────────────────────────────

describe("checkDocumentLimit", () => {
  it("STARTER blocks at 1000 documents", () => {
    const billing = makeBilling({ plan: "STARTER", docsCount: 1000 })
    const result = checkDocumentLimit(billing)
    expect(result.allowed).toBe(false)
  })

  it("STARTER allows under 1000", () => {
    const billing = makeBilling({ plan: "STARTER", docsCount: 999 })
    expect(checkDocumentLimit(billing).allowed).toBe(true)
  })

  it("PROFESSIONAL has unlimited documents", () => {
    const billing = makeBilling({ plan: "PROFESSIONAL", docsCount: 999999 })
    expect(checkDocumentLimit(billing).allowed).toBe(true)
  })
})

// ─────────────────────────────────────────────
// Standards Limits
// ─────────────────────────────────────────────

describe("checkStandardsLimit", () => {
  it("STARTER allows up to 2 standards", () => {
    const billing = makeBilling({ plan: "STARTER" })
    expect(checkStandardsLimit(billing, 1).allowed).toBe(true)
    expect(checkStandardsLimit(billing, 2).allowed).toBe(false)
  })

  it("PROFESSIONAL allows up to 5 standards", () => {
    const billing = makeBilling({ plan: "PROFESSIONAL" })
    expect(checkStandardsLimit(billing, 4).allowed).toBe(true)
    expect(checkStandardsLimit(billing, 5).allowed).toBe(false)
  })

  it("BUSINESS has unlimited standards", () => {
    const billing = makeBilling({ plan: "BUSINESS" })
    expect(checkStandardsLimit(billing, 100).allowed).toBe(true)
  })
})

// ─────────────────────────────────────────────
// Project Limits
// ─────────────────────────────────────────────

describe("checkProjectLimit", () => {
  it("STARTER blocks at 5 projects", () => {
    const billing = makeBilling({ plan: "STARTER" })
    expect(checkProjectLimit(billing, 5).allowed).toBe(false)
    expect(checkProjectLimit(billing, 4).allowed).toBe(true)
  })

  it("TRIALING bypasses project limit", () => {
    const billing = makeBilling({ plan: "STARTER", status: "TRIALING" })
    expect(checkProjectLimit(billing, 100).allowed).toBe(true)
  })

  it("ENTERPRISE has unlimited projects", () => {
    const billing = makeBilling({ plan: "ENTERPRISE" })
    expect(checkProjectLimit(billing, 1000).allowed).toBe(true)
  })
})

// ─────────────────────────────────────────────
// Vendor Limits
// ─────────────────────────────────────────────

describe("checkVendorLimit", () => {
  it("STARTER blocks at 10 vendors", () => {
    const billing = makeBilling({ plan: "STARTER" })
    expect(checkVendorLimit(billing, 10).allowed).toBe(false)
    expect(checkVendorLimit(billing, 9).allowed).toBe(true)
  })

  it("ENTERPRISE has unlimited vendors", () => {
    const billing = makeBilling({ plan: "ENTERPRISE" })
    expect(checkVendorLimit(billing, 1000).allowed).toBe(true)
  })
})

// ─────────────────────────────────────────────
// AI Classification Limits
// ─────────────────────────────────────────────

describe("checkAiClassificationLimit", () => {
  it("allows when under monthly quota", () => {
    const billing = makeBilling({ plan: "STARTER", aiUsed: 30 }) // limit 50
    const result = checkAiClassificationLimit(billing)
    expect(result.allowed).toBe(true)
    expect(result.useCredit).toBe(false)
  })

  it("falls back to credits when quota exhausted", () => {
    const billing = makeBilling({ plan: "STARTER", aiUsed: 50, creditBalance: 10 })
    const result = checkAiClassificationLimit(billing)
    expect(result.allowed).toBe(true)
    expect(result.useCredit).toBe(true)
  })

  it("blocks when quota exhausted AND no credits", () => {
    const billing = makeBilling({ plan: "STARTER", aiUsed: 50, creditBalance: 0 })
    const result = checkAiClassificationLimit(billing)
    expect(result.allowed).toBe(false)
    expect(result.useCredit).toBe(false)
    expect(result.upgradeRequired).toBe("PROFESSIONAL")
  })

  it("ENTERPRISE has unlimited AI classifications", () => {
    const billing = makeBilling({ plan: "ENTERPRISE", aiUsed: 999999 })
    const result = checkAiClassificationLimit(billing)
    expect(result.allowed).toBe(true)
    expect(result.useCredit).toBe(false)
  })

  it("reports current and limit", () => {
    const billing = makeBilling({ plan: "PROFESSIONAL", aiUsed: 100 }) // limit 200
    const result = checkAiClassificationLimit(billing)
    expect(result.current).toBe(100)
    expect(result.limit).toBe(200)
  })
})
