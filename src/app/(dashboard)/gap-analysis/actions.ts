"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"

// ─── Types ───────────────────────────────────────────

export type CoverageStatus = "COVERED" | "PARTIAL" | "GAP"

export interface ClauseGapData {
  clauseId: string
  clauseNumber: string
  title: string
  description: string | null
  status: CoverageStatus
  docCount: number
  checklistCompliantCount: number
  checklistTotalCount: number
}

export interface TopLevelClauseGap {
  clauseId: string
  clauseNumber: string
  title: string
  description: string | null
  status: CoverageStatus
  children: ClauseGapData[]
}

export interface StandardGapAnalysis {
  standardId: string
  code: string
  name: string
  coveragePercent: number
  totalSubClauses: number
  covered: number
  partial: number
  gaps: number
  clauses: TopLevelClauseGap[]
}

export interface GapAnalysisSummary {
  totalSubClauses: number
  covered: number
  partial: number
  gaps: number
  overallCoveragePercent: number
  standards: StandardGapAnalysis[]
}

// ─── Main Action ─────────────────────────────────────

export async function getGapAnalysis(
  standardCode?: string,
  projectId?: string
): Promise<GapAnalysisSummary> {
  const { dbOrgId } = await getAuthContext()

  // Build filter conditions
  const standardWhere = standardCode
    ? { isActive: true, code: standardCode }
    : { isActive: true }

  const docWhere: Record<string, unknown> = {
    organizationId: dbOrgId,
    status: { notIn: ["ARCHIVED", "EXPIRED"] },
  }
  if (projectId) docWhere.projectId = projectId

  const checklistWhere: Record<string, unknown> = {
    organizationId: dbOrgId,
  }
  if (projectId) checklistWhere.projectId = projectId

  // 3 parallel queries
  const [standards, docClassifications, checklistItems] = await Promise.all([
    // 1. Standards with clauses (hierarchical)
    db.standard.findMany({
      where: standardWhere,
      include: {
        clauses: {
          orderBy: { clauseNumber: "asc" },
          select: {
            id: true,
            clauseNumber: true,
            title: true,
            description: true,
            parentId: true,
          },
        },
      },
      orderBy: { code: "asc" },
    }),

    // 2. Document classifications for non-archived/expired docs
    db.documentClassification.findMany({
      where: {
        document: docWhere,
        isVerified: true,
      },
      select: {
        standardClauseId: true,
      },
    }),

    // 3. Checklist items linked to standard clauses
    db.checklistItem.findMany({
      where: {
        checklist: checklistWhere,
        standardClauseId: { not: null },
      },
      select: {
        standardClauseId: true,
        isCompliant: true,
      },
    }),
  ])

  // Build lookup sets for fast access
  // docClassifications: clauseId → count of verified docs
  const docCountByClause = new Map<string, number>()
  for (const dc of docClassifications) {
    docCountByClause.set(
      dc.standardClauseId,
      (docCountByClause.get(dc.standardClauseId) || 0) + 1
    )
  }

  // checklistItems: clauseId → { compliant, total }
  const checklistByClause = new Map<string, { compliant: number; total: number }>()
  for (const ci of checklistItems) {
    if (!ci.standardClauseId) continue
    const existing = checklistByClause.get(ci.standardClauseId) || { compliant: 0, total: 0 }
    existing.total++
    if (ci.isCompliant === true) existing.compliant++
    checklistByClause.set(ci.standardClauseId, existing)
  }

  // Aggregate per standard
  let totalSubClauses = 0
  let totalCovered = 0
  let totalPartial = 0
  let totalGaps = 0

  const standardResults: StandardGapAnalysis[] = standards.map((std) => {
    const topLevel = std.clauses.filter((c) => c.parentId === null)
    const subClauses = std.clauses.filter((c) => c.parentId !== null)

    // If no sub-clauses, treat top-level as leaf clauses
    const leafClauses = subClauses.length > 0 ? subClauses : topLevel

    // Compute coverage for each leaf clause
    function computeClauseStatus(clauseId: string): {
      status: CoverageStatus
      docCount: number
      compliant: number
      total: number
    } {
      const docCount = docCountByClause.get(clauseId) || 0
      const checklist = checklistByClause.get(clauseId) || { compliant: 0, total: 0 }

      const hasDoc = docCount > 0
      const hasCompliant = checklist.compliant > 0

      let status: CoverageStatus
      if (hasDoc && hasCompliant) {
        status = "COVERED"
      } else if (hasDoc || hasCompliant) {
        status = "PARTIAL"
      } else {
        status = "GAP"
      }

      return { status, docCount, compliant: checklist.compliant, total: checklist.total }
    }

    // Build top-level clause groups
    const clauseGroups: TopLevelClauseGap[] = subClauses.length > 0
      ? topLevel.map((parent) => {
          const children = subClauses
            .filter((c) => c.parentId === parent.id)
            .map((child) => {
              const info = computeClauseStatus(child.id)
              return {
                clauseId: child.id,
                clauseNumber: child.clauseNumber,
                title: child.title,
                description: child.description,
                status: info.status,
                docCount: info.docCount,
                checklistCompliantCount: info.compliant,
                checklistTotalCount: info.total,
              }
            })

          // Roll up: all COVERED → COVERED, all GAP → GAP, else PARTIAL
          let parentStatus: CoverageStatus = "GAP"
          if (children.length > 0) {
            const allCovered = children.every((c) => c.status === "COVERED")
            const allGap = children.every((c) => c.status === "GAP")
            parentStatus = allCovered ? "COVERED" : allGap ? "GAP" : "PARTIAL"
          }

          return {
            clauseId: parent.id,
            clauseNumber: parent.clauseNumber,
            title: parent.title,
            description: parent.description,
            status: parentStatus,
            children,
          }
        })
      : // No sub-clauses: top-level are leaves
        topLevel.map((clause) => {
          const info = computeClauseStatus(clause.id)
          return {
            clauseId: clause.id,
            clauseNumber: clause.clauseNumber,
            title: clause.title,
            description: clause.description,
            status: info.status,
            children: [{
              clauseId: clause.id,
              clauseNumber: clause.clauseNumber,
              title: clause.title,
              description: clause.description,
              status: info.status,
              docCount: info.docCount,
              checklistCompliantCount: info.compliant,
              checklistTotalCount: info.total,
            }],
          }
        })

    // Compute standard-level totals
    const stdLeafData = leafClauses.map((c) => computeClauseStatus(c.id))
    const stdCovered = stdLeafData.filter((d) => d.status === "COVERED").length
    const stdPartial = stdLeafData.filter((d) => d.status === "PARTIAL").length
    const stdGaps = stdLeafData.filter((d) => d.status === "GAP").length
    const stdTotal = leafClauses.length
    const coveragePercent = stdTotal > 0 ? Math.round((stdCovered / stdTotal) * 100) : 0

    totalSubClauses += stdTotal
    totalCovered += stdCovered
    totalPartial += stdPartial
    totalGaps += stdGaps

    return {
      standardId: std.id,
      code: std.code,
      name: std.name,
      coveragePercent,
      totalSubClauses: stdTotal,
      covered: stdCovered,
      partial: stdPartial,
      gaps: stdGaps,
      clauses: clauseGroups,
    }
  })

  const overallCoveragePercent =
    totalSubClauses > 0 ? Math.round((totalCovered / totalSubClauses) * 100) : 0

  return {
    totalSubClauses,
    covered: totalCovered,
    partial: totalPartial,
    gaps: totalGaps,
    overallCoveragePercent,
    standards: standardResults,
  }
}

// ─── Helper: get standards list for filter dropdown ──

export async function getStandardOptions() {
  const { dbOrgId } = await getAuthContext()

  return db.standard.findMany({
    where: { isActive: true },
    select: { code: true, name: true },
    orderBy: { code: "asc" },
  })
}

export async function getProjectOptions() {
  const { dbOrgId } = await getAuthContext()

  return db.project.findMany({
    where: { organizationId: dbOrgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
