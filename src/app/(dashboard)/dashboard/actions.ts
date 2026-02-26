"use server"

import { cache } from "react"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import type { ActionResult } from "@/types"

export const getDashboardMetrics = cache(async function getDashboardMetrics() {
  const { dbOrgId } = await getAuthContext()

  const [
    activeProjects,
    totalDocuments,
    completedAssessments,
    openCapas,
    totalChecklists,
    recentActivity,
    avgComplianceScore,
  ] = await Promise.all([
    db.project.count({
      where: { organizationId: dbOrgId, status: "ACTIVE" },
    }),
    db.document.count({
      where: { organizationId: dbOrgId },
    }),
    db.assessment.count({
      where: { organizationId: dbOrgId, completedDate: { not: null } },
    }),
    db.capa.count({
      where: {
        organizationId: dbOrgId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
    db.complianceChecklist.count({
      where: { organizationId: dbOrgId },
    }),
    db.auditTrailEvent.findMany({
      where: { organizationId: dbOrgId },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.assessment.aggregate({
      where: {
        organizationId: dbOrgId,
        overallScore: { not: null },
      },
      _avg: { overallScore: true },
    }),
  ])

  return {
    activeProjects,
    totalDocuments,
    completedAssessments,
    openCapas,
    totalChecklists,
    recentActivity,
    avgComplianceScore: avgComplianceScore._avg.overallScore ?? null,
  }
})

export interface OnboardingStep {
  id: string
  title: string
  description: string
  href: string
  completed: boolean
}

export async function getOnboardingStatus(): Promise<{
  steps: OnboardingStep[]
  completedCount: number
  totalSteps: number
  isComplete: boolean
}> {
  const { dbOrgId } = await getAuthContext()

  const [org, projectCount, documentCount, checklistCount, memberCount] = await Promise.all([
    db.organization.findUnique({ where: { id: dbOrgId }, select: { industry: true, settings: true } }),
    db.project.count({ where: { organizationId: dbOrgId } }),
    db.document.count({ where: { organizationId: dbOrgId } }),
    db.complianceChecklist.count({ where: { organizationId: dbOrgId } }),
    db.organizationUser.count({ where: { organizationId: dbOrgId, isActive: true } }),
  ])

  const settings = (org?.settings as Record<string, unknown>) ?? {}

  const steps: OnboardingStep[] = [
    {
      id: "industry",
      title: "Set your industry",
      description: "Configure your organization's industry for relevant compliance standards.",
      href: "/settings",
      completed: !!org?.industry,
    },
    {
      id: "team",
      title: "Invite team members",
      description: "Add at least one other team member to collaborate on compliance.",
      href: "/settings",
      completed: memberCount >= 2,
    },
    {
      id: "project",
      title: "Create your first project",
      description: "Set up a project to organize documents, assessments, and checklists.",
      href: "/projects",
      completed: projectCount > 0,
    },
    {
      id: "document",
      title: "Upload a document",
      description: "Upload a compliance document for classification and tracking.",
      href: "/documents",
      completed: documentCount > 0,
    },
    {
      id: "checklist",
      title: "Create a compliance checklist",
      description: "Start a checklist against an ISO standard to track compliance items.",
      href: "/checklists",
      completed: checklistCount > 0,
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length

  return {
    steps,
    completedCount,
    totalSteps: steps.length,
    isComplete: completedCount === steps.length || !!settings.onboardingDismissed,
  }
}

export async function dismissOnboarding(): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const org = await db.organization.findUnique({ where: { id: dbOrgId }, select: { settings: true } })
    const existingSettings = (org?.settings as Record<string, unknown>) ?? {}

    await db.organization.update({
      where: { id: dbOrgId },
      data: {
        settings: { ...existingSettings, onboardingDismissed: true },
      },
    })

    logAuditEvent({
      action: "DISMISS_ONBOARDING",
      entityType: "Organization",
      entityId: dbOrgId,
      metadata: {},
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to dismiss onboarding" }
  }
}
