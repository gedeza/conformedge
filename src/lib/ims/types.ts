import type { CoverageStatus } from "@/app/(dashboard)/gap-analysis/gap-analysis-core"

// ─── Integration Score ──────────────────────────────────

export interface EquivalenceSaving {
  /** HLS clause group number (e.g. "4", "5") */
  hlsGroup: string
  /** How many raw clauses map to this equivalence class */
  rawCount: number
  /** Standards involved (e.g. ["ISO 9001", "ISO 14001"]) */
  standards: string[]
}

export interface IntegrationScore {
  /** Total leaf clauses across all active standards */
  totalClauses: number
  /** Unique requirements after deduplication via equivalences */
  uniqueRequirements: number
  /** Efficiency percentage: (1 - unique/total) * 100 */
  efficiencyPercent: number
  /** Detail of which clause groups share requirements */
  savings: EquivalenceSaving[]
}

// ─── Consolidated Readiness ─────────────────────────────

export interface StandardBreakdown {
  standardCode: string
  standardName: string
  rawCoverage: number
  deduplicatedCoverage: number
  totalClauses: number
  covered: number
  partial: number
  gaps: number
}

export interface ConsolidatedReadiness {
  /** Weighted overall score (0-100) — COVERED=1, PARTIAL=0.5, GAP=0 */
  weightedScore: number
  /** Coverage after deduplication (best status per equivalence class) */
  deduplicatedCoverage: number
  /** Raw coverage without deduplication */
  rawCoverage: number
  /** Per-standard breakdown */
  standards: StandardBreakdown[]
}

// ─── Shared Requirements Matrix ─────────────────────────

export interface MatrixCell {
  standardCode: string
  status: CoverageStatus
  clauseId: string
  clauseNumber: string
  title: string
}

export interface SharedRequirementsRow {
  /** HLS group number (4-10) */
  hlsGroup: string
  /** HLS group title (e.g. "Context of the organization") */
  hlsTitle: string
  /** Per-standard status cells */
  cells: MatrixCell[]
  /** Whether statuses are inconsistent across standards */
  hasInconsistency: boolean
}

// ─── Gap Cascades ───────────────────────────────────────

export interface CascadeTarget {
  clauseId: string
  clauseNumber: string
  title: string
  standardCode: string
  standardName: string
  status: CoverageStatus
  mappingType: "EQUIVALENT" | "RELATED" | "SUPPORTING"
}

export interface GapCascade {
  /** The source clause that has a GAP or PARTIAL status */
  sourceClauseId: string
  sourceClauseNumber: string
  sourceTitle: string
  sourceStandardCode: string
  sourceStandardName: string
  sourceStatus: CoverageStatus
  /** All equivalent/related clauses affected by this gap */
  targets: CascadeTarget[]
  /** Number of standards affected (including source) */
  impactCount: number
}

// ─── Top-Level Summary ──────────────────────────────────

export interface IMSSummary {
  activeStandardCount: number
  integrationScore: IntegrationScore
  consolidatedReadiness: ConsolidatedReadiness
  sharedRequirements: SharedRequirementsRow[]
  gapCascades: GapCascade[]
}

// HLS group titles (ISO High Level Structure)
export const HLS_GROUPS: Record<string, string> = {
  "4": "Context of the organization",
  "5": "Leadership",
  "6": "Planning",
  "7": "Support",
  "8": "Operation",
  "9": "Performance evaluation",
  "10": "Improvement",
}
