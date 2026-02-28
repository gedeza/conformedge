"use server"

import { cache } from "react"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"

export interface MatrixStandard {
  id: string
  code: string
  name: string
}

export interface MatrixClause {
  id: string
  number: string
  title: string
  standardId: string
  standardCode: string
}

export interface MatrixCrossRef {
  sourceClauseId: string
  targetClauseId: string
  mappingType: "EQUIVALENT" | "RELATED" | "SUPPORTING"
  sourceStandardCode: string
  targetStandardCode: string
  notes: string | null
}

export interface CrossReferenceMatrixData {
  standards: MatrixStandard[]
  clauses: MatrixClause[]
  crossRefs: MatrixCrossRef[]
}

export interface OverlapCell {
  standardA: string
  standardB: string
  count: number
}

export interface StandardOverlapData {
  standards: MatrixStandard[]
  matrix: Record<string, Record<string, number>>
  details: Record<string, MatrixCrossRef[]>
}

export const getCrossReferenceMatrix = cache(async (): Promise<CrossReferenceMatrixData> => {
  await getAuthContext()

  const standards = await db.standard.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  })

  const standardIds = standards.map((s) => s.id)

  // Fetch top-level clauses (4-10) for all active standards
  const clauses = await db.standardClause.findMany({
    where: {
      standardId: { in: standardIds },
      parentId: null,
    },
    select: {
      id: true,
      clauseNumber: true,
      title: true,
      standardId: true,
      standard: { select: { code: true } },
    },
    orderBy: [{ clauseNumber: "asc" }],
  })

  const clauseIds = clauses.map((c) => c.id)

  // Fetch all cross-references between these clauses
  const crossRefs = await db.clauseCrossReference.findMany({
    where: {
      OR: [
        { sourceClauseId: { in: clauseIds } },
        { targetClauseId: { in: clauseIds } },
      ],
    },
    select: {
      sourceClauseId: true,
      targetClauseId: true,
      mappingType: true,
      notes: true,
      sourceClause: { select: { standard: { select: { code: true } } } },
      targetClause: { select: { standard: { select: { code: true } } } },
    },
  })

  return {
    standards: standards.map((s) => ({ id: s.id, code: s.code, name: s.name })),
    clauses: clauses.map((c) => ({
      id: c.id,
      number: c.clauseNumber,
      title: c.title,
      standardId: c.standardId,
      standardCode: c.standard.code,
    })),
    crossRefs: crossRefs.map((r) => ({
      sourceClauseId: r.sourceClauseId,
      targetClauseId: r.targetClauseId,
      mappingType: r.mappingType,
      sourceStandardCode: r.sourceClause.standard.code,
      targetStandardCode: r.targetClause.standard.code,
      notes: r.notes,
    })),
  }
})

export const getStandardOverlapCounts = cache(async (): Promise<StandardOverlapData> => {
  await getAuthContext()

  const standards = await db.standard.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  })

  const standardIds = standards.map((s) => s.id)

  // Fetch all cross-references with standard info
  const crossRefs = await db.clauseCrossReference.findMany({
    where: {
      sourceClause: { standardId: { in: standardIds } },
      targetClause: { standardId: { in: standardIds } },
    },
    select: {
      sourceClauseId: true,
      targetClauseId: true,
      mappingType: true,
      notes: true,
      sourceClause: {
        select: {
          standardId: true,
          standard: { select: { code: true } },
        },
      },
      targetClause: {
        select: {
          standardId: true,
          standard: { select: { code: true } },
        },
      },
    },
  })

  // Build pairwise count matrix
  const matrix: Record<string, Record<string, number>> = {}
  const details: Record<string, MatrixCrossRef[]> = {}

  for (const s of standards) {
    matrix[s.code] = {}
    for (const s2 of standards) {
      matrix[s.code][s2.code] = 0
    }
  }

  // Count total clauses per standard (diagonal)
  const clauseCounts = await db.standardClause.groupBy({
    by: ["standardId"],
    where: { standardId: { in: standardIds }, parentId: null },
    _count: true,
  })

  for (const cc of clauseCounts) {
    const std = standards.find((s) => s.id === cc.standardId)
    if (std) matrix[std.code][std.code] = cc._count
  }

  for (const ref of crossRefs) {
    const srcCode = ref.sourceClause.standard.code
    const tgtCode = ref.targetClause.standard.code
    if (srcCode === tgtCode) continue

    matrix[srcCode][tgtCode]++
    matrix[tgtCode][srcCode]++

    const key = [srcCode, tgtCode].sort().join("|")
    if (!details[key]) details[key] = []
    details[key].push({
      sourceClauseId: ref.sourceClauseId,
      targetClauseId: ref.targetClauseId,
      mappingType: ref.mappingType,
      sourceStandardCode: srcCode,
      targetStandardCode: tgtCode,
      notes: ref.notes,
    })
  }

  return {
    standards: standards.map((s) => ({ id: s.id, code: s.code, name: s.name })),
    matrix,
    details,
  }
})
