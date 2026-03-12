"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { getGapAnalysisInternal } from "./gap-analysis-core"

// Re-export types for consumers
export type {
  CoverageStatus,
  ClauseObjectiveData,
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

  // Billing: gap analysis requires Professional+
  const billing = await getBillingContext(dbOrgId)
  const gate = checkFeatureAccess(billing, "gapAnalysis")
  if (!gate.allowed) return null

  return getGapAnalysisInternal(dbOrgId, standardCode, projectId)
}

// ─── Helper: get standards list for filter dropdown ──

export async function getStandardOptions() {
  const { dbOrgId } = await getAuthContext()

  const { getActiveStandardIds } = await import("@/lib/standards")
  const activeIds = await getActiveStandardIds(dbOrgId)

  return db.standard.findMany({
    where: { id: { in: activeIds } },
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
