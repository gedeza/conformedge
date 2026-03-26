export interface ComplianceScore {
  total: number
  certScore: number
  safetyScore: number
  beeScore: number
  tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "UNRATED"
  breakdown: string[]
}

/**
 * Per-org vendor scoring weights stored in Organization.settings.vendorScoringWeights.
 * All three must sum to 100 (enforced at save-time, not here).
 */
export interface VendorScoringWeights {
  certifications: number // default 40
  safety: number         // default 35
  bee: number            // default 25
}

export const DEFAULT_VENDOR_SCORING_WEIGHTS: VendorScoringWeights = {
  certifications: 40,
  safety: 35,
  bee: 25,
}

export function calculateComplianceScore(
  sub: {
    safetyRating: number | null
    beeLevel: string | null
    certifications: Array<{ expiresAt: Date | null }>
  },
  customWeights?: Partial<VendorScoringWeights> | null,
): ComplianceScore {
  const weights: VendorScoringWeights = {
    ...DEFAULT_VENDOR_SCORING_WEIGHTS,
    ...customWeights,
  }

  const breakdown: string[] = []
  const now = new Date()

  // Certification score: valid + not expired certs
  const totalCerts = sub.certifications.length
  const validCerts = sub.certifications.filter((c) => {
    if (!c.expiresAt) return true
    return new Date(c.expiresAt) > now
  }).length
  const certScore = totalCerts > 0 ? (validCerts / Math.max(totalCerts, 3)) * weights.certifications : 0
  breakdown.push(`Certifications: ${validCerts}/${totalCerts} valid (${certScore.toFixed(0)}/${weights.certifications})`)

  // Safety rating
  const safetyScore = sub.safetyRating ? (sub.safetyRating / 100) * weights.safety : 0
  breakdown.push(`Safety: ${sub.safetyRating ?? 0}% (${safetyScore.toFixed(0)}/${weights.safety})`)

  // BEE level: Level 1 = 100%, Level 8 = 12.5%
  const beeNum = sub.beeLevel ? parseInt(sub.beeLevel) : 0
  const beeScore = beeNum > 0 ? ((9 - beeNum) / 8) * weights.bee : 0
  breakdown.push(`BEE Level ${beeNum || "N/A"}: (${beeScore.toFixed(0)}/${weights.bee})`)

  const total = Math.round(certScore + safetyScore + beeScore)

  let tier: ComplianceScore["tier"]
  if (total >= 85) tier = "PLATINUM"
  else if (total >= 70) tier = "GOLD"
  else if (total >= 50) tier = "SILVER"
  else if (total >= 25) tier = "BRONZE"
  else tier = "UNRATED"

  return { total, certScore: Math.round(certScore), safetyScore: Math.round(safetyScore), beeScore: Math.round(beeScore), tier, breakdown }
}
