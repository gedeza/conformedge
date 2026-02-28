"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getGapAnalysisInternal } from "./gap-analysis-core"

// Re-export types for consumers
export type {
  CoverageStatus,
  ClauseGapData,
  TopLevelClauseGap,
  StandardGapAnalysis,
  GapAnalysisSummary,
} from "./gap-analysis-core"

// ─── Main Action ─────────────────────────────────────

export async function getGapAnalysis(
  standardCode?: string,
  projectId?: string
) {
  const { dbOrgId } = await getAuthContext()
  return getGapAnalysisInternal(dbOrgId, standardCode, projectId)
}

// ─── Helper: get standards list for filter dropdown ──

export async function getStandardOptions() {
  await getAuthContext()

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
