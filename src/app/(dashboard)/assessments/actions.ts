"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext, getOrgMembers } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import type { ActionResult } from "@/types"

const assessmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  standardId: z.string().min(1, "Standard is required"),
  projectId: z.string().optional(),
  scheduledDate: z.coerce.date().optional(),
})

export type AssessmentFormValues = z.infer<typeof assessmentSchema>

export async function getAssessments() {
  const { dbOrgId } = await getAuthContext()

  return db.assessment.findMany({
    where: { organizationId: dbOrgId },
    include: {
      standard: { select: { id: true, code: true, name: true } },
      project: { select: { id: true, name: true } },
      assessor: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAssessment(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.assessment.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      standard: { select: { id: true, code: true, name: true } },
      project: { select: { id: true, name: true } },
      assessor: { select: { id: true, firstName: true, lastName: true } },
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          answers: {
            include: {
              answeredBy: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  })
}

export async function createAssessment(values: AssessmentFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()
    const parsed = assessmentSchema.parse(values)

    const assessment = await db.assessment.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        standardId: parsed.standardId,
        projectId: parsed.projectId || null,
        scheduledDate: parsed.scheduledDate,
        assessorId: dbUserId,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Assessment",
      entityId: assessment.id,
      metadata: { title: assessment.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/assessments")
    return { success: true, data: { id: assessment.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create assessment" }
  }
}

export async function updateAssessment(id: string, values: AssessmentFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()
    const parsed = assessmentSchema.parse(values)

    const existing = await db.assessment.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Assessment not found" }

    await db.assessment.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description,
        standardId: parsed.standardId,
        projectId: parsed.projectId || null,
        scheduledDate: parsed.scheduledDate,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Assessment",
      entityId: id,
      metadata: { title: parsed.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/assessments")
    revalidatePath(`/assessments/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update assessment" }
  }
}

export async function deleteAssessment(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const existing = await db.assessment.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Assessment not found" }

    await db.assessment.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "Assessment",
      entityId: id,
      metadata: { title: existing.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/assessments")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete assessment" }
  }
}

export async function generateQuestionsFromStandard(assessmentId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, organizationId: dbOrgId },
      include: {
        standard: { include: { clauses: { orderBy: { clauseNumber: "asc" } } } },
        questions: true,
      },
    })

    if (!assessment) return { success: false, error: "Assessment not found" }
    if (assessment.questions.length > 0) return { success: false, error: "Questions already exist" }

    const questions = assessment.standard.clauses.map((clause, index) => ({
      question: `How does the organization comply with Clause ${clause.clauseNumber}: ${clause.title}?`,
      guidance: clause.description ?? `Assess compliance with ${clause.title} requirements.`,
      sortOrder: index + 1,
      assessmentId,
    }))

    await db.assessmentQuestion.createMany({ data: questions })

    logAuditEvent({
      action: "GENERATE_QUESTIONS",
      entityType: "Assessment",
      entityId: assessmentId,
      metadata: { count: questions.length },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/assessments/${assessmentId}`)
    revalidatePath(`/assessments/${assessmentId}/conduct`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate questions" }
  }
}

export async function saveAnswer(
  questionId: string,
  data: { answer?: string; score?: number; evidence?: string; notes?: string }
): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const question = await db.assessmentQuestion.findUnique({
      where: { id: questionId },
      include: { assessment: { select: { organizationId: true, id: true } } },
    })

    if (!question || question.assessment.organizationId !== dbOrgId) {
      return { success: false, error: "Question not found" }
    }

    const existing = await db.assessmentAnswer.findFirst({
      where: { questionId, answeredById: dbUserId },
    })

    if (existing) {
      await db.assessmentAnswer.update({
        where: { id: existing.id },
        data: {
          answer: data.answer,
          score: data.score,
          evidence: data.evidence,
          notes: data.notes,
        },
      })
    } else {
      await db.assessmentAnswer.create({
        data: {
          questionId,
          answeredById: dbUserId,
          answer: data.answer,
          score: data.score,
          evidence: data.evidence,
          notes: data.notes,
        },
      })
    }

    revalidatePath(`/assessments/${question.assessment.id}/conduct`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to save answer" }
  }
}

export async function calculateScore(assessmentId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, organizationId: dbOrgId },
      include: {
        questions: {
          include: { answers: { select: { score: true } } },
        },
      },
    })

    if (!assessment) return { success: false, error: "Assessment not found" }

    const scores = assessment.questions
      .flatMap((q) => q.answers.map((a) => a.score))
      .filter((s): s is number => s !== null)

    if (scores.length === 0) return { success: false, error: "No scores to calculate" }

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const overallScore = (avgScore / 5) * 100

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    if (overallScore >= 80) riskLevel = "LOW"
    else if (overallScore >= 60) riskLevel = "MEDIUM"
    else if (overallScore >= 40) riskLevel = "HIGH"
    else riskLevel = "CRITICAL"

    await db.assessment.update({
      where: { id: assessmentId },
      data: {
        overallScore,
        riskLevel,
        completedDate: new Date(),
      },
    })

    logAuditEvent({
      action: "CALCULATE_SCORE",
      entityType: "Assessment",
      entityId: assessmentId,
      metadata: { overallScore, riskLevel },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/assessments/${assessmentId}`)
    revalidatePath("/assessments")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to calculate score" }
  }
}

export async function getStandards() {
  return db.standard.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true },
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

export async function getMembers() {
  const { dbOrgId } = await getAuthContext()
  return getOrgMembers(dbOrgId)
}
