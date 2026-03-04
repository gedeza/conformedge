"use server"

import { db } from "@/lib/db"

export interface CrossRefItem {
  clauseId: string
  clauseNumber: string
  title: string
  standardCode: string
  standardName: string
  mappingType: "EQUIVALENT" | "RELATED" | "SUPPORTING"
  notes: string | null
}

/**
 * Get all cross-references for a clause (both directions).
 * Returns items grouped by mapping type.
 */
export async function getClauseCrossReferences(clauseId: string): Promise<CrossRefItem[]> {
  const [asSource, asTarget] = await Promise.all([
    db.clauseCrossReference.findMany({
      where: { sourceClauseId: clauseId },
      select: {
        mappingType: true,
        notes: true,
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
    db.clauseCrossReference.findMany({
      where: { targetClauseId: clauseId },
      select: {
        mappingType: true,
        notes: true,
        sourceClause: {
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

  const items: CrossRefItem[] = []

  for (const ref of asSource) {
    items.push({
      clauseId: ref.targetClause.id,
      clauseNumber: ref.targetClause.clauseNumber,
      title: ref.targetClause.title,
      standardCode: ref.targetClause.standard.code,
      standardName: ref.targetClause.standard.name,
      mappingType: ref.mappingType,
      notes: ref.notes,
    })
  }

  for (const ref of asTarget) {
    items.push({
      clauseId: ref.sourceClause.id,
      clauseNumber: ref.sourceClause.clauseNumber,
      title: ref.sourceClause.title,
      standardCode: ref.sourceClause.standard.code,
      standardName: ref.sourceClause.standard.name,
      mappingType: ref.mappingType,
      notes: ref.notes,
    })
  }

  // Sort: EQUIVALENT first, then RELATED, then SUPPORTING, then by standard code
  const ORDER: Record<string, number> = { EQUIVALENT: 0, RELATED: 1, SUPPORTING: 2 }
  items.sort((a, b) => {
    const typeOrder = (ORDER[a.mappingType] ?? 3) - (ORDER[b.mappingType] ?? 3)
    if (typeOrder !== 0) return typeOrder
    return a.standardCode.localeCompare(b.standardCode)
  })

  return items
}
