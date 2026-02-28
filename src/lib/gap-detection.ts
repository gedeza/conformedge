import { db } from "@/lib/db"
import { getGapAnalysisInternal } from "@/app/(dashboard)/gap-analysis/gap-analysis-core"

// ─── Types ───────────────────────────────────────────

export interface GapInsight {
  standardCode: string
  standardName: string
  coveragePercent: number
  covered: number
  partial: number
  gaps: number
  totalClauses: number
  coveredByThisDoc: { clauseNumber: string; title: string }[]
  remainingGaps: { clauseNumber: string; title: string }[]
}

export interface DashboardGapSummary {
  overallCoveragePercent: number
  totalGaps: number
  totalClauses: number
  standards: {
    code: string
    name: string
    coveragePercent: number
    gaps: number
    totalClauses: number
  }[]
}

// ─── Document Gap Insights ───────────────────────────

export async function getGapInsightsForDocument(
  documentId: string,
  orgId: string
): Promise<GapInsight[]> {
  // Get this document's classifications with their clause → standard info
  const classifications = await db.documentClassification.findMany({
    where: { documentId },
    select: {
      standardClause: {
        select: {
          clauseNumber: true,
          title: true,
          standard: {
            select: { code: true },
          },
        },
      },
    },
  })

  if (classifications.length === 0) return []

  // Identify unique standards this document maps to
  const standardCodes = [
    ...new Set(classifications.map((c) => c.standardClause.standard.code)),
  ]

  // Build a set of clause numbers this doc covers, keyed by standard
  const docClausesByStandard = new Map<string, Set<string>>()
  for (const c of classifications) {
    const code = c.standardClause.standard.code
    if (!docClausesByStandard.has(code)) {
      docClausesByStandard.set(code, new Set())
    }
    docClausesByStandard.get(code)!.add(c.standardClause.clauseNumber)
  }

  // Run gap analysis for each matched standard
  const insights: GapInsight[] = []

  for (const code of standardCodes) {
    const analysis = await getGapAnalysisInternal(orgId, code)
    const std = analysis.standards[0]
    if (!std) continue

    // Collect all leaf clauses from the analysis
    const allLeafClauses: { clauseNumber: string; title: string; status: string }[] = []
    for (const group of std.clauses) {
      for (const child of group.children) {
        allLeafClauses.push({
          clauseNumber: child.clauseNumber,
          title: child.title,
          status: child.status,
        })
      }
    }

    const docClauses = docClausesByStandard.get(code) ?? new Set()

    const coveredByThisDoc = allLeafClauses
      .filter((c) => docClauses.has(c.clauseNumber))
      .map((c) => ({ clauseNumber: c.clauseNumber, title: c.title }))

    const remainingGaps = allLeafClauses
      .filter((c) => c.status === "GAP")
      .map((c) => ({ clauseNumber: c.clauseNumber, title: c.title }))

    insights.push({
      standardCode: std.code,
      standardName: std.name,
      coveragePercent: std.coveragePercent,
      covered: std.covered,
      partial: std.partial,
      gaps: std.gaps,
      totalClauses: std.totalSubClauses,
      coveredByThisDoc,
      remainingGaps,
    })
  }

  return insights
}

// ─── Dashboard Gap Summary ───────────────────────────

export async function getGapSummaryForDashboard(
  orgId: string
): Promise<DashboardGapSummary> {
  const analysis = await getGapAnalysisInternal(orgId)

  return {
    overallCoveragePercent: analysis.overallCoveragePercent,
    totalGaps: analysis.gaps,
    totalClauses: analysis.totalSubClauses,
    standards: analysis.standards
      .map((s) => ({
        code: s.code,
        name: s.name,
        coveragePercent: s.coveragePercent,
        gaps: s.gaps,
        totalClauses: s.totalSubClauses,
      }))
      .sort((a, b) => b.gaps - a.gaps),
  }
}
