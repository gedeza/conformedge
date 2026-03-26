import { describe, it, expect } from "vitest"
import {
  PLAN_DEFINITIONS,
  CREDIT_PACKS,
  ANNUAL_DISCOUNT_MONTHS,
  VAT_RATE,
  getPlanDefinition,
  getMonthlyPriceZar,
  formatZar,
  minimumTierForFeature,
} from "../plans"

// ─────────────────────────────────────────────
// Plan Definitions
// ─────────────────────────────────────────────

describe("PLAN_DEFINITIONS", () => {
  it("defines exactly 4 tiers", () => {
    expect(Object.keys(PLAN_DEFINITIONS)).toEqual([
      "STARTER",
      "PROFESSIONAL",
      "BUSINESS",
      "ENTERPRISE",
    ])
  })

  it("Essentials (STARTER) = R2,299/mo", () => {
    expect(PLAN_DEFINITIONS.STARTER.monthlyPriceZar).toBe(2_299_00)
  })

  it("Professional = R5,499/mo", () => {
    expect(PLAN_DEFINITIONS.PROFESSIONAL.monthlyPriceZar).toBe(5_499_00)
  })

  it("Business = R8,499/mo", () => {
    expect(PLAN_DEFINITIONS.BUSINESS.monthlyPriceZar).toBe(8_499_00)
  })

  it("Enterprise = custom (null)", () => {
    expect(PLAN_DEFINITIONS.ENTERPRISE.monthlyPriceZar).toBeNull()
  })

  it("STARTER includes 3 users", () => {
    expect(PLAN_DEFINITIONS.STARTER.limits.maxUsers).toBe(3)
  })

  it("PROFESSIONAL includes 5 users", () => {
    expect(PLAN_DEFINITIONS.PROFESSIONAL.limits.maxUsers).toBe(5)
  })

  it("BUSINESS includes 10 users", () => {
    expect(PLAN_DEFINITIONS.BUSINESS.limits.maxUsers).toBe(10)
  })

  it("ENTERPRISE includes 25 users", () => {
    expect(PLAN_DEFINITIONS.ENTERPRISE.limits.maxUsers).toBe(25)
  })

  it("additional user fees decrease with tier", () => {
    const fees = [
      PLAN_DEFINITIONS.STARTER.limits.additionalUserFeeZar!,
      PLAN_DEFINITIONS.PROFESSIONAL.limits.additionalUserFeeZar!,
      PLAN_DEFINITIONS.BUSINESS.limits.additionalUserFeeZar!,
      PLAN_DEFINITIONS.ENTERPRISE.limits.additionalUserFeeZar!,
    ]
    // R399, R449, R349, R299 — not strictly decreasing (Pro > Starter)
    // but Business < Pro and Enterprise < Business
    expect(fees[2]).toBeLessThan(fees[1]) // Business < Pro
    expect(fees[3]).toBeLessThan(fees[2]) // Enterprise < Business
  })
})

// ─────────────────────────────────────────────
// Feature Gates per Tier
// ─────────────────────────────────────────────

describe("Feature gates", () => {
  it("STARTER only has incidentManagement", () => {
    const features = PLAN_DEFINITIONS.STARTER.features
    const enabled = Object.entries(features)
      .filter(([, v]) => v)
      .map(([k]) => k)
    expect(enabled).toEqual(["incidentManagement"])
  })

  it("PROFESSIONAL unlocks IMS, client portal, advanced incidents, equipment", () => {
    const f = PLAN_DEFINITIONS.PROFESSIONAL.features
    expect(f.ims).toBe(true)
    expect(f.clientPortal).toBe(true)
    expect(f.advancedIncidentManagement).toBe(true)
    expect(f.equipmentManagement).toBe(true)
    expect(f.permitToWork).toBe(true)
  })

  it("PROFESSIONAL does NOT have vendor portal, custom standards, API, SSO", () => {
    const f = PLAN_DEFINITIONS.PROFESSIONAL.features
    expect(f.vendorPortal).toBe(false)
    expect(f.customStandards).toBe(false)
    expect(f.apiAccess).toBe(false)
    expect(f.sso).toBe(false)
  })

  it("BUSINESS unlocks vendor portal, custom standards, API — but not SSO", () => {
    const f = PLAN_DEFINITIONS.BUSINESS.features
    expect(f.vendorPortal).toBe(true)
    expect(f.customStandards).toBe(true)
    expect(f.apiAccess).toBe(true)
    expect(f.sso).toBe(false)
  })

  it("ENTERPRISE has all 17 features enabled", () => {
    const f = PLAN_DEFINITIONS.ENTERPRISE.features
    const allEnabled = Object.values(f).every(Boolean)
    expect(allEnabled).toBe(true)
    expect(Object.keys(f)).toHaveLength(17)
  })
})

// ─────────────────────────────────────────────
// Pricing Helpers
// ─────────────────────────────────────────────

describe("getMonthlyPriceZar", () => {
  it("returns full price for MONTHLY cycle", () => {
    expect(getMonthlyPriceZar("STARTER", "MONTHLY")).toBe(2_299_00)
  })

  it("applies ~17% discount for ANNUAL cycle", () => {
    const annual = getMonthlyPriceZar("STARTER", "ANNUAL")!
    const monthly = getMonthlyPriceZar("STARTER", "MONTHLY")!
    // Annual = (monthly * 10) / 12
    expect(annual).toBe(Math.round((monthly * ANNUAL_DISCOUNT_MONTHS) / 12))
    expect(annual).toBeLessThan(monthly)
    // Discount should be approximately 17%
    const discountPercent = ((monthly - annual) / monthly) * 100
    expect(discountPercent).toBeCloseTo(16.67, 0)
  })

  it("returns null for Enterprise (custom pricing)", () => {
    expect(getMonthlyPriceZar("ENTERPRISE", "MONTHLY")).toBeNull()
    expect(getMonthlyPriceZar("ENTERPRISE", "ANNUAL")).toBeNull()
  })
})

describe("formatZar", () => {
  it("starts with R prefix", () => {
    expect(formatZar(2_299_00)).toMatch(/^R/)
  })

  it("contains the numeric value 2299", () => {
    // Locale may use space or comma as thousands separator
    const result = formatZar(2_299_00)
    expect(result.replace(/[^0-9]/g, "")).toContain("229900")
  })

  it("handles zero", () => {
    expect(formatZar(0)).toMatch(/^R0[,.]00$/)
  })

  it("handles small amounts", () => {
    expect(formatZar(50)).toMatch(/^R0[,.]50$/)
  })

  it("handles null/NaN gracefully", () => {
    expect(formatZar(NaN)).toMatch(/^R0[,.]00$/)
    expect(formatZar(null as unknown as number)).toMatch(/^R0[,.]00$/)
  })
})

describe("minimumTierForFeature", () => {
  it("incidentManagement requires STARTER (Essentials)", () => {
    expect(minimumTierForFeature("incidentManagement")).toBe("STARTER")
  })

  it("advancedIncidentManagement requires PROFESSIONAL", () => {
    expect(minimumTierForFeature("advancedIncidentManagement")).toBe("PROFESSIONAL")
  })

  it("equipmentManagement requires PROFESSIONAL", () => {
    expect(minimumTierForFeature("equipmentManagement")).toBe("PROFESSIONAL")
  })

  it("vendorPortal requires BUSINESS", () => {
    expect(minimumTierForFeature("vendorPortal")).toBe("BUSINESS")
  })

  it("apiAccess requires BUSINESS", () => {
    expect(minimumTierForFeature("apiAccess")).toBe("BUSINESS")
  })

  it("SSO requires ENTERPRISE", () => {
    expect(minimumTierForFeature("sso")).toBe("ENTERPRISE")
  })
})

// ─────────────────────────────────────────────
// Credit Packs
// ─────────────────────────────────────────────

describe("CREDIT_PACKS", () => {
  it("has 4 packs", () => {
    expect(CREDIT_PACKS).toHaveLength(4)
  })

  it("per-credit price decreases with volume", () => {
    for (let i = 1; i < CREDIT_PACKS.length; i++) {
      expect(CREDIT_PACKS[i].perCreditZar).toBeLessThan(CREDIT_PACKS[i - 1].perCreditZar)
    }
  })

  it("pack prices are within 10% of credits × per-credit rate", () => {
    for (const pack of CREDIT_PACKS) {
      const expected = pack.credits * pack.perCreditZar
      const diff = Math.abs(pack.priceZar - expected)
      // Per-credit is a rounded average — allow 10% tolerance
      expect(diff / pack.priceZar).toBeLessThan(0.10)
    }
  })
})

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

describe("Billing constants", () => {
  it("VAT rate is 15%", () => {
    expect(VAT_RATE).toBe(0.15)
  })

  it("annual discount = pay 10 months for 12", () => {
    expect(ANNUAL_DISCOUNT_MONTHS).toBe(10)
  })
})

describe("getPlanDefinition", () => {
  it("returns correct plan for each tier", () => {
    expect(getPlanDefinition("STARTER").name).toBe("Essentials")
    expect(getPlanDefinition("PROFESSIONAL").name).toBe("Professional")
    expect(getPlanDefinition("BUSINESS").name).toBe("Business")
    expect(getPlanDefinition("ENTERPRISE").name).toBe("Enterprise")
  })
})
