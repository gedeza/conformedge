export interface ComplianceScore {
  total: number
  certScore: number
  safetyScore: number
  beeScore: number
  tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "UNRATED"
  breakdown: string[]
}

export function calculateComplianceScore(sub: {
  safetyRating: number | null
  beeLevel: string | null
  certifications: Array<{ expiresAt: Date | null }>
}): ComplianceScore {
  const breakdown: string[] = []
  const now = new Date()

  // Certification score (40% weight): valid + not expired certs
  const totalCerts = sub.certifications.length
  const validCerts = sub.certifications.filter((c) => {
    if (!c.expiresAt) return true
    return new Date(c.expiresAt) > now
  }).length
  const certScore = totalCerts > 0 ? (validCerts / Math.max(totalCerts, 3)) * 40 : 0
  breakdown.push(`Certifications: ${validCerts}/${totalCerts} valid (${certScore.toFixed(0)}/40)`)

  // Safety rating (35% weight)
  const safetyScore = sub.safetyRating ? (sub.safetyRating / 100) * 35 : 0
  breakdown.push(`Safety: ${sub.safetyRating ?? 0}% (${safetyScore.toFixed(0)}/35)`)

  // BEE level (25% weight): Level 1 = 100%, Level 8 = 12.5%
  const beeNum = sub.beeLevel ? parseInt(sub.beeLevel) : 0
  const beeScore = beeNum > 0 ? ((9 - beeNum) / 8) * 25 : 0
  breakdown.push(`BEE Level ${beeNum || "N/A"}: (${beeScore.toFixed(0)}/25)`)

  const total = Math.round(certScore + safetyScore + beeScore)

  let tier: ComplianceScore["tier"]
  if (total >= 85) tier = "PLATINUM"
  else if (total >= 70) tier = "GOLD"
  else if (total >= 50) tier = "SILVER"
  else if (total >= 25) tier = "BRONZE"
  else tier = "UNRATED"

  return { total, certScore: Math.round(certScore), safetyScore: Math.round(safetyScore), beeScore: Math.round(beeScore), tier, breakdown }
}
