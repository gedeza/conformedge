// ─────────────────────────────────────────────
// B-BBEE Level Calculator
// Per Amended Codes of Good Practice (2013/2015)
// ─────────────────────────────────────────────

export const BEE_ELEMENTS = [
  { key: "ownership", label: "Ownership", maxPoints: 25, isPriority: true },
  { key: "managementControl", label: "Management Control", maxPoints: 19, isPriority: false },
  { key: "skillsDevelopment", label: "Skills Development", maxPoints: 20, isPriority: true },
  { key: "esd", label: "Enterprise & Supplier Development", maxPoints: 40, isPriority: true },
  { key: "sed", label: "Socio-Economic Development", maxPoints: 5, isPriority: false },
] as const

export type BeeElementKey = typeof BEE_ELEMENTS[number]["key"]

export interface BeeScorecard {
  ownership: { score: number; maxPoints: number }
  managementControl: { score: number; maxPoints: number }
  skillsDevelopment: { score: number; maxPoints: number }
  esd: { score: number; maxPoints: number }
  sed: { score: number; maxPoints: number }
  totalScore: number
  prioritySubMinimums: {
    ownership: boolean
    skillsDevelopment: boolean
    esd: boolean
  }
  levelDiscounting: number
}

export interface BeeResult {
  level: number | null    // 1-8 or null (non-compliant)
  recognition: number     // Percentage (0-135)
  totalScore: number
  entityType: string
  levelDiscounting: number
}

const LEVEL_THRESHOLDS = [
  { min: 100, level: 1, recognition: 135 },
  { min: 95,  level: 2, recognition: 125 },
  { min: 90,  level: 3, recognition: 110 },
  { min: 80,  level: 4, recognition: 100 },
  { min: 75,  level: 5, recognition: 80 },
  { min: 70,  level: 6, recognition: 60 },
  { min: 55,  level: 7, recognition: 50 },
  { min: 40,  level: 8, recognition: 10 },
]

export const BEE_ENTITY_TYPES = [
  { value: "EME", label: "Exempt Micro Enterprise", description: "Turnover ≤ R10 million" },
  { value: "QSE", label: "Qualifying Small Enterprise", description: "Turnover R10M – R50 million" },
  { value: "GENERIC", label: "Generic Enterprise", description: "Turnover > R50 million" },
] as const

/**
 * Calculate B-BBEE level from scorecard.
 * Handles EME auto-levels and priority sub-minimum discounting.
 */
export function calculateBeeLevel(
  totalScore: number | null,
  entityType: string | null,
  blackOwnership: number | null,
  scorecard?: BeeScorecard | null,
): BeeResult {
  // EME auto-levels (turnover ≤ R10M)
  if (entityType === "EME") {
    if (blackOwnership !== null && blackOwnership >= 100) {
      return { level: 1, recognition: 135, totalScore: 0, entityType: "EME", levelDiscounting: 0 }
    }
    if (blackOwnership !== null && blackOwnership >= 51) {
      return { level: 2, recognition: 125, totalScore: 0, entityType: "EME", levelDiscounting: 0 }
    }
    return { level: 4, recognition: 100, totalScore: 0, entityType: "EME", levelDiscounting: 0 }
  }

  // QSE enhanced recognition
  if (entityType === "QSE") {
    if (blackOwnership !== null && blackOwnership >= 100) {
      return { level: 1, recognition: 135, totalScore: totalScore ?? 0, entityType: "QSE", levelDiscounting: 0 }
    }
    if (blackOwnership !== null && blackOwnership >= 51) {
      return { level: 2, recognition: 125, totalScore: totalScore ?? 0, entityType: "QSE", levelDiscounting: 0 }
    }
  }

  if (totalScore === null || totalScore < 40) {
    return { level: null, recognition: 0, totalScore: totalScore ?? 0, entityType: entityType ?? "GENERIC", levelDiscounting: 0 }
  }

  // Find base level from score
  const baseLevel = LEVEL_THRESHOLDS.find((t) => totalScore >= t.min)
  if (!baseLevel) {
    return { level: null, recognition: 0, totalScore, entityType: entityType ?? "GENERIC", levelDiscounting: 0 }
  }

  // Apply priority sub-minimum discounting
  let discounting = 0
  if (scorecard) {
    const priorityElements = [
      { key: "ownership" as const, score: scorecard.ownership.score, max: scorecard.ownership.maxPoints },
      { key: "skillsDevelopment" as const, score: scorecard.skillsDevelopment.score, max: scorecard.skillsDevelopment.maxPoints },
      { key: "esd" as const, score: scorecard.esd.score, max: scorecard.esd.maxPoints },
    ]

    const failedSubMinimums = priorityElements.filter(
      (el) => el.score < el.max * 0.4
    ).length

    if (failedSubMinimums >= 2) discounting = 2
    else if (failedSubMinimums === 1) discounting = 1
  }

  // Apply discounting
  let finalLevel = baseLevel.level + discounting
  if (finalLevel > 8) finalLevel = 8

  const finalThreshold = LEVEL_THRESHOLDS.find((t) => t.level === finalLevel)
  const recognition = finalThreshold?.recognition ?? 0

  return {
    level: finalLevel <= 8 ? finalLevel : null,
    recognition,
    totalScore,
    entityType: entityType ?? "GENERIC",
    levelDiscounting: discounting,
  }
}

/**
 * Get recognition percentage for a given B-BBEE level.
 */
export function getBeeRecognition(level: number | null): number {
  if (level === null) return 0
  return LEVEL_THRESHOLDS.find((t) => t.level === level)?.recognition ?? 0
}

/**
 * Build a BeeScorecard from element scores.
 */
export function buildScorecard(elements: Record<string, number>): BeeScorecard {
  const ownership = { score: Math.min(elements.ownership ?? 0, 25), maxPoints: 25 }
  const managementControl = { score: Math.min(elements.managementControl ?? 0, 19), maxPoints: 19 }
  const skillsDevelopment = { score: Math.min(elements.skillsDevelopment ?? 0, 20), maxPoints: 20 }
  const esd = { score: Math.min(elements.esd ?? 0, 40), maxPoints: 40 }
  const sed = { score: Math.min(elements.sed ?? 0, 5), maxPoints: 5 }

  const totalScore = ownership.score + managementControl.score + skillsDevelopment.score + esd.score + sed.score

  const prioritySubMinimums = {
    ownership: ownership.score >= ownership.maxPoints * 0.4,
    skillsDevelopment: skillsDevelopment.score >= skillsDevelopment.maxPoints * 0.4,
    esd: esd.score >= esd.maxPoints * 0.4,
  }

  const failedCount = Object.values(prioritySubMinimums).filter((v) => !v).length

  return {
    ownership,
    managementControl,
    skillsDevelopment,
    esd,
    sed,
    totalScore,
    prioritySubMinimums,
    levelDiscounting: failedCount >= 2 ? 2 : failedCount === 1 ? 1 : 0,
  }
}
