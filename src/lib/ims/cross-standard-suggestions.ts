import { db } from "@/lib/db"
import { getGapAnalysisInternal } from "@/app/(dashboard)/gap-analysis/gap-analysis-core"
import type { CoverageStatus } from "@/app/(dashboard)/gap-analysis/gap-analysis-core"

// ─── Types ──────────────────────────────────────────────

export interface EquivalentGap {
  clauseId: string
  clauseNumber: string
  title: string
  standardCode: string
  standardName: string
  status: CoverageStatus
  mappingType: "EQUIVALENT" | "RELATED" | "SUPPORTING"
}

export interface DocumentSuggestion {
  /** The clause the document is already classified against */
  sourceClauseId: string
  sourceClauseNumber: string
  sourceStandardCode: string
  sourceConfidence: number
  /** Equivalent clause in another standard to suggest */
  suggestedClauseId: string
  suggestedClauseNumber: string
  suggestedClauseTitle: string
  suggestedStandardCode: string
  suggestedStandardName: string
  /** Whether this classification already exists */
  alreadyClassified: boolean
}

// ─── Get equivalent gaps for a clause (for CAPA integration) ──

export async function getEquivalentGapsForClause(
  clauseId: string,
  orgId: string
): Promise<EquivalentGap[]> {
  // Fetch cross-references and gap data in parallel
  const [crossRefs, gapData] = await Promise.all([
    db.clauseCrossReference.findMany({
      where: {
        OR: [{ sourceClauseId: clauseId }, { targetClauseId: clauseId }],
      },
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
    getGapAnalysisInternal(orgId),
  ])

  // Build clause → status lookup
  const clauseStatusMap = new Map<string, CoverageStatus>()
  for (const std of gapData.standards) {
    for (const topClause of std.clauses) {
      for (const child of topClause.children) {
        clauseStatusMap.set(child.clauseId, child.status)
      }
    }
  }

  const results: EquivalentGap[] = []

  for (const cr of crossRefs) {
    const isSource = cr.sourceClauseId === clauseId
    const targetClause = isSource ? cr.targetClause : cr.sourceClause

    results.push({
      clauseId: targetClause.id,
      clauseNumber: targetClause.clauseNumber,
      title: targetClause.title,
      standardCode: targetClause.standard.code,
      standardName: targetClause.standard.name,
      status: clauseStatusMap.get(targetClause.id) || "GAP",
      mappingType: cr.mappingType as EquivalentGap["mappingType"],
    })
  }

  // Sort: EQUIVALENT first, then by standard code
  const typeOrder = { EQUIVALENT: 0, RELATED: 1, SUPPORTING: 2 }
  results.sort((a, b) => {
    const typeDiff = typeOrder[a.mappingType] - typeOrder[b.mappingType]
    return typeDiff !== 0 ? typeDiff : a.standardCode.localeCompare(b.standardCode)
  })

  return results
}

// ─── Get cross-standard suggestions for a document ──────

export async function getDocumentCrossStandardSuggestions(
  documentId: string,
  orgId: string
): Promise<DocumentSuggestion[]> {
  // Get document's existing classifications
  const classifications = await db.documentClassification.findMany({
    where: { documentId },
    select: {
      standardClauseId: true,
      confidence: true,
      standardClause: {
        select: {
          clauseNumber: true,
          standard: { select: { code: true } },
        },
      },
    },
  })

  if (classifications.length === 0) return []

  // Get all cross-references for these clauses
  const classifiedClauseIds = classifications.map((c) => c.standardClauseId)

  const crossRefs = await db.clauseCrossReference.findMany({
    where: {
      OR: [
        { sourceClauseId: { in: classifiedClauseIds } },
        { targetClauseId: { in: classifiedClauseIds } },
      ],
      mappingType: "EQUIVALENT", // Only suggest for equivalent clauses
    },
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
  })

  const classifiedSet = new Set(classifiedClauseIds)
  const suggestions: DocumentSuggestion[] = []
  const seenPairs = new Set<string>()

  for (const cr of crossRefs) {
    for (const classification of classifications) {
      const isSource = cr.sourceClauseId === classification.standardClauseId
      const isTarget = cr.targetClauseId === classification.standardClauseId

      if (!isSource && !isTarget) continue

      const suggestedClause = isSource ? cr.targetClause : cr.sourceClause
      const pairKey = `${classification.standardClauseId}:${suggestedClause.id}`
      if (seenPairs.has(pairKey)) continue
      seenPairs.add(pairKey)

      // Don't suggest clauses from the same standard
      if (suggestedClause.standard.code === classification.standardClause.standard.code) continue

      suggestions.push({
        sourceClauseId: classification.standardClauseId,
        sourceClauseNumber: classification.standardClause.clauseNumber,
        sourceStandardCode: classification.standardClause.standard.code,
        sourceConfidence: classification.confidence,
        suggestedClauseId: suggestedClause.id,
        suggestedClauseNumber: suggestedClause.clauseNumber,
        suggestedClauseTitle: suggestedClause.title,
        suggestedStandardCode: suggestedClause.standard.code,
        suggestedStandardName: suggestedClause.standard.name,
        alreadyClassified: classifiedSet.has(suggestedClause.id),
      })
    }
  }

  // Sort: unclassified first, then by standard code
  suggestions.sort((a, b) => {
    if (a.alreadyClassified !== b.alreadyClassified) {
      return a.alreadyClassified ? 1 : -1
    }
    return a.suggestedStandardCode.localeCompare(b.suggestedStandardCode)
  })

  return suggestions
}
