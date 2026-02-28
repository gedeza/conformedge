import { db } from "@/lib/db"
import { getGapAnalysisInternal } from "@/app/(dashboard)/gap-analysis/gap-analysis-core"
import type { CoverageStatus } from "@/app/(dashboard)/gap-analysis/gap-analysis-core"
import { UnionFind } from "./union-find"
import type {
  IMSSummary,
  IntegrationScore,
  ConsolidatedReadiness,
  StandardBreakdown,
  SharedRequirementsRow,
  MatrixCell,
  GapCascade,
  CascadeTarget,
  EquivalenceSaving,
} from "./types"
import { HLS_GROUPS } from "./types"

// ─── Core Engine ────────────────────────────────────────

export async function computeIMSSummary(
  orgId: string,
  projectId?: string
): Promise<IMSSummary> {
  // 1. Fetch gap analysis + all cross-references in parallel
  const [gapData, crossRefs] = await Promise.all([
    getGapAnalysisInternal(orgId, undefined, projectId),
    db.clauseCrossReference.findMany({
      include: {
        sourceClause: {
          select: {
            id: true,
            clauseNumber: true,
            title: true,
            standard: { select: { code: true, name: true } },
          },
        },
        targetClause: {
          select: {
            id: true,
            clauseNumber: true,
            title: true,
            standard: { select: { code: true, name: true } },
          },
        },
      },
    }),
  ])

  // 2. Build clause → status map from gap analysis
  const clauseStatusMap = new Map<string, CoverageStatus>()
  const clauseInfoMap = new Map<
    string,
    { clauseNumber: string; title: string; standardCode: string; standardName: string }
  >()

  for (const std of gapData.standards) {
    for (const topClause of std.clauses) {
      for (const child of topClause.children) {
        clauseStatusMap.set(child.clauseId, child.status)
        clauseInfoMap.set(child.clauseId, {
          clauseNumber: child.clauseNumber,
          title: child.title,
          standardCode: std.code,
          standardName: std.name,
        })
      }
    }
  }

  // 3. Union-Find on EQUIVALENT cross-refs
  const uf = new UnionFind<string>()
  // Add all clauses
  for (const clauseId of clauseStatusMap.keys()) {
    uf.add(clauseId)
  }
  // Union only EQUIVALENT pairs
  const equivalentRefs = crossRefs.filter((cr) => cr.mappingType === "EQUIVALENT")
  for (const cr of equivalentRefs) {
    if (clauseStatusMap.has(cr.sourceClauseId) && clauseStatusMap.has(cr.targetClauseId)) {
      uf.union(cr.sourceClauseId, cr.targetClauseId)
    }
  }

  const groups = uf.getGroups()
  const activeStandardCount = gapData.standards.length

  // 4. Integration Score
  const integrationScore = computeIntegrationScore(
    groups,
    clauseStatusMap,
    clauseInfoMap
  )

  // 5. Consolidated Readiness
  const consolidatedReadiness = computeConsolidatedReadiness(
    groups,
    clauseStatusMap,
    gapData
  )

  // 6. Shared Requirements Matrix
  const sharedRequirements = computeSharedRequirementsMatrix(
    gapData,
    clauseStatusMap,
    clauseInfoMap
  )

  // 7. Gap Cascades
  const gapCascades = computeGapCascades(
    clauseStatusMap,
    clauseInfoMap,
    crossRefs
  )

  return {
    activeStandardCount,
    integrationScore,
    consolidatedReadiness,
    sharedRequirements,
    gapCascades,
  }
}

// ─── Integration Score ──────────────────────────────────

function computeIntegrationScore(
  groups: Map<string, Set<string>>,
  clauseStatusMap: Map<string, CoverageStatus>,
  clauseInfoMap: Map<string, { clauseNumber: string; title: string; standardCode: string; standardName: string }>
): IntegrationScore {
  const totalClauses = clauseStatusMap.size
  const uniqueRequirements = groups.size
  const efficiencyPercent =
    totalClauses > 0 ? Math.round((1 - uniqueRequirements / totalClauses) * 100) : 0

  // Find savings: equivalence classes with members from multiple standards
  const savings: EquivalenceSaving[] = []
  for (const members of groups.values()) {
    if (members.size <= 1) continue

    const standards = new Set<string>()
    let hlsGroup = ""
    for (const clauseId of members) {
      const info = clauseInfoMap.get(clauseId)
      if (info) {
        standards.add(info.standardCode)
        if (!hlsGroup) {
          // Extract HLS group from clause number (e.g. "4.1" → "4")
          hlsGroup = info.clauseNumber.split(".")[0]
        }
      }
    }

    if (standards.size > 1) {
      savings.push({
        hlsGroup,
        rawCount: members.size,
        standards: Array.from(standards).sort(),
      })
    }
  }

  // Sort savings by rawCount descending
  savings.sort((a, b) => b.rawCount - a.rawCount)

  return { totalClauses, uniqueRequirements, efficiencyPercent, savings }
}

// ─── Consolidated Readiness ─────────────────────────────

function computeConsolidatedReadiness(
  groups: Map<string, Set<string>>,
  clauseStatusMap: Map<string, CoverageStatus>,
  gapData: Awaited<ReturnType<typeof getGapAnalysisInternal>>
): ConsolidatedReadiness {
  // Best status per equivalence class (COVERED > PARTIAL > GAP)
  const statusRank: Record<CoverageStatus, number> = {
    COVERED: 2,
    PARTIAL: 1,
    GAP: 0,
  }
  const rankToStatus: CoverageStatus[] = ["GAP", "PARTIAL", "COVERED"]

  let deduplicatedCovered = 0
  let deduplicatedPartial = 0
  let deduplicatedGap = 0

  for (const members of groups.values()) {
    let bestRank = 0
    for (const clauseId of members) {
      const status = clauseStatusMap.get(clauseId) || "GAP"
      bestRank = Math.max(bestRank, statusRank[status])
    }
    const bestStatus = rankToStatus[bestRank]
    if (bestStatus === "COVERED") deduplicatedCovered++
    else if (bestStatus === "PARTIAL") deduplicatedPartial++
    else deduplicatedGap++
  }

  const totalGroups = groups.size
  const weightedScore =
    totalGroups > 0
      ? Math.round(((deduplicatedCovered + deduplicatedPartial * 0.5) / totalGroups) * 100)
      : 0
  const deduplicatedCoverage =
    totalGroups > 0 ? Math.round((deduplicatedCovered / totalGroups) * 100) : 0
  const rawCoverage = gapData.overallCoveragePercent

  // Per-standard breakdown
  const standards: StandardBreakdown[] = gapData.standards.map((std) => ({
    standardCode: std.code,
    standardName: std.name,
    rawCoverage: std.coveragePercent,
    deduplicatedCoverage: std.coveragePercent, // Per-standard stays the same
    totalClauses: std.totalSubClauses,
    covered: std.covered,
    partial: std.partial,
    gaps: std.gaps,
  }))

  return { weightedScore, deduplicatedCoverage, rawCoverage, standards }
}

// ─── Shared Requirements Matrix ─────────────────────────

function computeSharedRequirementsMatrix(
  gapData: Awaited<ReturnType<typeof getGapAnalysisInternal>>,
  clauseStatusMap: Map<string, CoverageStatus>,
  clauseInfoMap: Map<string, { clauseNumber: string; title: string; standardCode: string; standardName: string }>
): SharedRequirementsRow[] {
  const rows: SharedRequirementsRow[] = []

  for (const [groupNum, groupTitle] of Object.entries(HLS_GROUPS)) {
    const cells: MatrixCell[] = []

    for (const std of gapData.standards) {
      // Find top-level clause matching this HLS group
      const topClause = std.clauses.find(
        (c) => c.clauseNumber === groupNum || c.clauseNumber === `${groupNum}.`
      )

      if (topClause) {
        // Aggregate status from children
        const childStatuses = topClause.children.map((c) => c.status)
        let groupStatus: CoverageStatus = "GAP"
        if (childStatuses.length > 0) {
          const allCovered = childStatuses.every((s) => s === "COVERED")
          const anyPartial = childStatuses.some((s) => s === "PARTIAL" || s === "COVERED")
          groupStatus = allCovered ? "COVERED" : anyPartial ? "PARTIAL" : "GAP"
        }

        cells.push({
          standardCode: std.code,
          status: groupStatus,
          clauseId: topClause.clauseId,
          clauseNumber: topClause.clauseNumber,
          title: topClause.title,
        })
      }
    }

    // Only include rows where at least 2 standards have this HLS group
    if (cells.length >= 2) {
      const statuses = new Set(cells.map((c) => c.status))
      rows.push({
        hlsGroup: groupNum,
        hlsTitle: groupTitle,
        cells,
        hasInconsistency: statuses.size > 1,
      })
    }
  }

  return rows
}

// ─── Gap Cascades ───────────────────────────────────────

function computeGapCascades(
  clauseStatusMap: Map<string, CoverageStatus>,
  clauseInfoMap: Map<string, { clauseNumber: string; title: string; standardCode: string; standardName: string }>,
  crossRefs: Array<{
    mappingType: string
    sourceClauseId: string
    targetClauseId: string
    sourceClause: { id: string; clauseNumber: string; title: string; standard: { code: string; name: string } }
    targetClause: { id: string; clauseNumber: string; title: string; standard: { code: string; name: string } }
  }>
): GapCascade[] {
  const cascades: GapCascade[] = []
  const processedSources = new Set<string>()

  // For each GAP or PARTIAL clause, find cascading effects
  for (const [clauseId, status] of clauseStatusMap) {
    if (status === "COVERED") continue
    if (processedSources.has(clauseId)) continue

    const info = clauseInfoMap.get(clauseId)
    if (!info) continue

    // Find all cross-references where this clause is source or target
    const targets: CascadeTarget[] = []

    for (const cr of crossRefs) {
      let targetId: string | null = null
      let targetClause: typeof cr.sourceClause | null = null
      let mappingType = cr.mappingType as CascadeTarget["mappingType"]

      if (cr.sourceClauseId === clauseId) {
        targetId = cr.targetClauseId
        targetClause = cr.targetClause
      } else if (cr.targetClauseId === clauseId) {
        targetId = cr.sourceClauseId
        targetClause = cr.sourceClause
      }

      if (!targetId || !targetClause) continue
      // Only include targets from different standards
      if (targetClause.standard.code === info.standardCode) continue

      const targetStatus = clauseStatusMap.get(targetId) || "GAP"

      targets.push({
        clauseId: targetId,
        clauseNumber: targetClause.clauseNumber,
        title: targetClause.title,
        standardCode: targetClause.standard.code,
        standardName: targetClause.standard.name,
        status: targetStatus,
        mappingType,
      })
    }

    if (targets.length === 0) continue

    processedSources.add(clauseId)

    // Count unique standards affected (including source)
    const affectedStandards = new Set([info.standardCode, ...targets.map((t) => t.standardCode)])

    cascades.push({
      sourceClauseId: clauseId,
      sourceClauseNumber: info.clauseNumber,
      sourceTitle: info.title,
      sourceStandardCode: info.standardCode,
      sourceStandardName: info.standardName,
      sourceStatus: status,
      targets: targets.sort((a, b) => {
        // EQUIVALENT first, then by standard code
        const typeOrder = { EQUIVALENT: 0, RELATED: 1, SUPPORTING: 2 }
        const typeDiff = typeOrder[a.mappingType] - typeOrder[b.mappingType]
        return typeDiff !== 0 ? typeDiff : a.standardCode.localeCompare(b.standardCode)
      }),
      impactCount: affectedStandards.size,
    })
  }

  // Sort by impact count descending, then by source clause number
  cascades.sort((a, b) => {
    const impactDiff = b.impactCount - a.impactCount
    return impactDiff !== 0 ? impactDiff : a.sourceClauseNumber.localeCompare(b.sourceClauseNumber)
  })

  return cascades
}
