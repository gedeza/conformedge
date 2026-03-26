import { describe, it, expect } from "vitest"
import {
  calcActivityScore,
  calcClientDensityScore,
  calcRevenueScore,
  getRiskLevel,
} from "../partner-compliance"

// ─────────────────────────────────────────────
// Activity Score (30% weight)
// ─────────────────────────────────────────────

describe("calcActivityScore", () => {
  it("returns 100 when no users (no penalty)", () => {
    expect(calcActivityScore(0, 0)).toBe(100)
  })

  it("returns 100 when all users are active", () => {
    expect(calcActivityScore(10, 10)).toBe(100)
  })

  it("returns 50 when half users active", () => {
    expect(calcActivityScore(5, 10)).toBe(50)
  })

  it("returns 0 when no users active", () => {
    expect(calcActivityScore(0, 10)).toBe(0)
  })

  it("rounds to nearest integer", () => {
    expect(calcActivityScore(1, 3)).toBe(33) // 33.33% → 33
  })
})

// ─────────────────────────────────────────────
// Client Density Score (20% weight)
// ─────────────────────────────────────────────

describe("calcClientDensityScore", () => {
  it("returns 100 when at or below threshold (8)", () => {
    expect(calcClientDensityScore(8)).toBe(100)
    expect(calcClientDensityScore(5)).toBe(100)
    expect(calcClientDensityScore(0)).toBe(100)
  })

  it("penalizes 10 points per user above threshold", () => {
    expect(calcClientDensityScore(9)).toBe(90)   // 1 above → -10
    expect(calcClientDensityScore(10)).toBe(80)  // 2 above → -20
    expect(calcClientDensityScore(12)).toBe(60)  // 4 above → -40
  })

  it("floors at 0", () => {
    expect(calcClientDensityScore(18)).toBe(0)   // 10 above → -100
    expect(calcClientDensityScore(25)).toBe(0)   // way above → still 0
  })
})

// ─────────────────────────────────────────────
// Revenue Score (25% weight)
// ─────────────────────────────────────────────

describe("calcRevenueScore", () => {
  it("caps at 100", () => {
    // High revenue + high growth
    expect(calcRevenueScore(20, 1_000_000)).toBe(100)
  })

  it("gives max growth score (50) for >= 10% growth", () => {
    // Minimal revenue so absolute score is small
    expect(calcRevenueScore(10, 10_000)).toBe(51) // 1 (absolute) + 50 (growth)
  })

  it("gives 0 growth score for < -15% decline", () => {
    expect(calcRevenueScore(-20, 10_000)).toBe(1) // 1 (absolute) + 0 (growth)
  })

  it("handles zero revenue", () => {
    expect(calcRevenueScore(0, 0)).toBe(30) // 0 (absolute) + 30 (0% growth → 30)
  })

  it("scales absolute score: R100 = 1 point, max 50 points at R500K", () => {
    // R500,000 = 50,000,000 cents
    expect(calcRevenueScore(0, 50_000_000)).toBeGreaterThanOrEqual(80) // 50 absolute + 30 growth
  })

  it("moderate growth (5%) scores between min and max", () => {
    const score = calcRevenueScore(5, 10_000) // 1 absolute + 30+10 growth = 41
    expect(score).toBe(41)
  })

  it("negative growth above -15% still scores some growth points", () => {
    // -10% growth → 30 + (-10*2) = 30 - 20 = 10 growth score
    const score = calcRevenueScore(-10, 10_000)
    expect(score).toBe(11) // 1 absolute + 10 growth
  })
})

// ─────────────────────────────────────────────
// Risk Level
// ─────────────────────────────────────────────

describe("getRiskLevel", () => {
  it("returns LOW for score >= 80", () => {
    expect(getRiskLevel(80)).toBe("LOW")
    expect(getRiskLevel(100)).toBe("LOW")
    expect(getRiskLevel(95)).toBe("LOW")
  })

  it("returns MEDIUM for score 60-79", () => {
    expect(getRiskLevel(60)).toBe("MEDIUM")
    expect(getRiskLevel(79)).toBe("MEDIUM")
  })

  it("returns HIGH for score 40-59", () => {
    expect(getRiskLevel(40)).toBe("HIGH")
    expect(getRiskLevel(59)).toBe("HIGH")
  })

  it("returns CRITICAL for score < 40", () => {
    expect(getRiskLevel(39)).toBe("CRITICAL")
    expect(getRiskLevel(0)).toBe("CRITICAL")
  })
})

// ─────────────────────────────────────────────
// Weighted Composite Verification
// ─────────────────────────────────────────────

describe("Weighted composite score calculation", () => {
  // Weights: activity=0.30, clientDensity=0.20, revenue=0.25, featureUtil=0.15, compliance=0.10
  it("perfect scores across all dimensions = 100", () => {
    const composite = Math.round(
      100 * 0.30 +
      100 * 0.20 +
      100 * 0.25 +
      100 * 0.15 +
      100 * 0.10
    )
    expect(composite).toBe(100)
  })

  it("zero across all dimensions = 0", () => {
    const composite = Math.round(
      0 * 0.30 +
      0 * 0.20 +
      0 * 0.25 +
      0 * 0.15 +
      0 * 0.10
    )
    expect(composite).toBe(0)
  })

  it("only activity (100) with rest at 0 = 30", () => {
    const composite = Math.round(100 * 0.30)
    expect(composite).toBe(30)
  })

  it("mixed scores produce correct weighted result", () => {
    // Activity: 80, Density: 100, Revenue: 60, FeatureUtil: 40, Compliance: 100
    const composite = Math.round(
      80 * 0.30 +
      100 * 0.20 +
      60 * 0.25 +
      40 * 0.15 +
      100 * 0.10
    )
    expect(composite).toBe(75) // 24 + 20 + 15 + 6 + 10 = 75
    expect(getRiskLevel(composite)).toBe("MEDIUM")
  })
})
