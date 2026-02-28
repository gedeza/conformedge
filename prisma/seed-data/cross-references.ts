/**
 * Cross-reference seed data for ISO standards.
 *
 * All 7 standards follow the ISO High Level Structure (Annex SL),
 * meaning clauses 4-10 share the same structural framework.
 * Sub-clauses with matching numbers across different standards
 * are EQUIVALENT (same intent, domain-specific wording).
 */

// Common HLS sub-clause numbers present in all 7 standards
const COMMON_HLS_SUB_CLAUSES = [
  "4.1", "4.2", "4.3", "4.4",
  "5.1", "5.2", "5.3",
  "6.1", "6.2",
  "7.1", "7.2", "7.3", "7.4", "7.5",
  "8.1", "8.2",
  "9.1", "9.2", "9.3",
  "10.1", "10.2",
]

const ALL_STANDARD_CODES = [
  "ISO9001", "ISO14001", "ISO45001",
  "ISO22301", "ISO27001", "ISO37001", "ISO39001",
]

/**
 * Generate EQUIVALENT cross-references for all shared HLS sub-clauses
 * across every pair of standards.
 *
 * For N standards and M common sub-clauses:
 * Pairs = N*(N-1)/2 = 21
 * Refs = 21 * M = 21 * 21 = ~441 EQUIVALENT references
 */
export function generateHLSCrossReferences(): {
  sourceStandard: string
  sourceClauseNumber: string
  targetStandard: string
  targetClauseNumber: string
  mappingType: "EQUIVALENT"
}[] {
  const refs: {
    sourceStandard: string
    sourceClauseNumber: string
    targetStandard: string
    targetClauseNumber: string
    mappingType: "EQUIVALENT"
  }[] = []

  for (let i = 0; i < ALL_STANDARD_CODES.length; i++) {
    for (let j = i + 1; j < ALL_STANDARD_CODES.length; j++) {
      for (const clauseNumber of COMMON_HLS_SUB_CLAUSES) {
        refs.push({
          sourceStandard: ALL_STANDARD_CODES[i],
          sourceClauseNumber: clauseNumber,
          targetStandard: ALL_STANDARD_CODES[j],
          targetClauseNumber: clauseNumber,
          mappingType: "EQUIVALENT",
        })
      }
    }
  }

  return refs
}

/**
 * Curated domain-specific cross-references (RELATED / SUPPORTING).
 * These link clauses across standards where the requirements overlap
 * in meaningful ways beyond the HLS structural equivalence.
 */
export const DOMAIN_CROSS_REFERENCES: {
  sourceStandard: string
  sourceClauseNumber: string
  targetStandard: string
  targetClauseNumber: string
  mappingType: "RELATED" | "SUPPORTING"
  notes: string
}[] = [
  // OH&S emergency preparedness supports Environmental emergency response
  {
    sourceStandard: "ISO45001",
    sourceClauseNumber: "8.2",
    targetStandard: "ISO14001",
    targetClauseNumber: "8.2",
    mappingType: "RELATED",
    notes: "Both address emergency preparedness and response — OH&S for worker safety, Environmental for spills/releases",
  },
  // Business continuity planning relates to information security continuity
  {
    sourceStandard: "ISO22301",
    sourceClauseNumber: "8.4",
    targetStandard: "ISO27001",
    targetClauseNumber: "8.1",
    mappingType: "RELATED",
    notes: "BC plans must address information security continuity requirements",
  },
  // Anti-bribery due diligence supports quality external provider controls
  {
    sourceStandard: "ISO37001",
    sourceClauseNumber: "8.2",
    targetStandard: "ISO9001",
    targetClauseNumber: "8.4",
    mappingType: "SUPPORTING",
    notes: "Anti-bribery due diligence on business associates supports external provider evaluation",
  },
  // OH&S risk assessment supports quality risk-based thinking
  {
    sourceStandard: "ISO45001",
    sourceClauseNumber: "6.1",
    targetStandard: "ISO9001",
    targetClauseNumber: "6.1",
    mappingType: "RELATED",
    notes: "OH&S hazard identification feeds into overall organizational risk management",
  },
  // Environmental compliance obligations relate to OH&S legal requirements
  {
    sourceStandard: "ISO14001",
    sourceClauseNumber: "6.1",
    targetStandard: "ISO45001",
    targetClauseNumber: "6.1",
    mappingType: "RELATED",
    notes: "Environmental compliance obligations often overlap with OH&S legal requirements on construction sites",
  },
  // Road traffic safety relates to OH&S for driver/worker safety
  {
    sourceStandard: "ISO39001",
    sourceClauseNumber: "8.1",
    targetStandard: "ISO45001",
    targetClauseNumber: "8.1",
    mappingType: "RELATED",
    notes: "RTS operational controls overlap with OH&S controls for transport and commuting",
  },
  // Information security awareness supports anti-bribery awareness
  {
    sourceStandard: "ISO27001",
    sourceClauseNumber: "7.3",
    targetStandard: "ISO37001",
    targetClauseNumber: "7.3",
    mappingType: "SUPPORTING",
    notes: "Security awareness training can incorporate anti-bribery awareness modules",
  },
  // Quality nonconformity management supports environmental incident handling
  {
    sourceStandard: "ISO9001",
    sourceClauseNumber: "10.2",
    targetStandard: "ISO14001",
    targetClauseNumber: "10.2",
    mappingType: "RELATED",
    notes: "Corrective action procedures apply to both quality nonconformities and environmental incidents",
  },
  // BC management review inputs support quality management review
  {
    sourceStandard: "ISO22301",
    sourceClauseNumber: "9.3",
    targetStandard: "ISO9001",
    targetClauseNumber: "9.3",
    mappingType: "SUPPORTING",
    notes: "Business continuity performance data should feed into quality management reviews",
  },
  // RTS incident investigation supports OH&S incident investigation
  {
    sourceStandard: "ISO39001",
    sourceClauseNumber: "9.1",
    targetStandard: "ISO45001",
    targetClauseNumber: "10.2",
    mappingType: "RELATED",
    notes: "Road traffic crash investigations feed into OH&S incident and nonconformity management",
  },
]
