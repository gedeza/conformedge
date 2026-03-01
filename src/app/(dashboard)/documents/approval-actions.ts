"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { createNotification } from "@/lib/notifications"
import { canCreate, canManageOrg } from "@/lib/permissions"
import type { ActionResult } from "@/types"

const submitSchema = z.object({
  documentId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  steps: z.array(
    z.object({
      stepOrder: z.number().int().min(1),
      label: z.string().min(1).max(100),
      requiredRole: z.string(),
      assignedToId: z.string().uuid(),
    })
  ).min(1, "At least one approval step is required"),
})

export type SubmitForApprovalValues = z.infer<typeof submitSchema>

export async function submitForApproval(values: SubmitForApprovalValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = submitSchema.parse(values)

    // Validate document belongs to org and is DRAFT
    const doc = await db.document.findFirst({
      where: { id: parsed.documentId, organizationId: dbOrgId },
    })
    if (!doc) return { success: false, error: "Document not found" }
    if (doc.status !== "DRAFT") return { success: false, error: "Only DRAFT documents can be submitted for approval" }

    // Check no active approval request exists
    const activeRequest = await db.approvalRequest.findFirst({
      where: { documentId: parsed.documentId, status: "IN_PROGRESS" },
    })
    if (activeRequest) return { success: false, error: "An approval request is already in progress" }

    // Create approval request + steps + update document status atomically
    const request = await db.$transaction(async (tx) => {
      const req = await tx.approvalRequest.create({
        data: {
          documentId: parsed.documentId,
          templateId: parsed.templateId,
          submittedById: dbUserId,
          organizationId: dbOrgId,
          status: "IN_PROGRESS",
          steps: {
            create: parsed.steps.map((s) => ({
              stepOrder: s.stepOrder,
              label: s.label,
              requiredRole: s.requiredRole,
              assignedToId: s.assignedToId,
              status: "PENDING",
            })),
          },
        },
        include: {
          steps: { orderBy: { stepOrder: "asc" } },
        },
      })

      await tx.document.update({
        where: { id: parsed.documentId },
        data: { status: "PENDING_REVIEW" },
      })

      return req
    })

    // Notify first step reviewer
    const firstStep = request.steps[0]
    if (firstStep) {
      createNotification({
        title: "Document Review Assigned",
        message: `You have been assigned to review '${doc.title}'`,
        type: "APPROVAL_REQUEST",
        userId: firstStep.assignedToId,
        organizationId: dbOrgId,
      })
    }

    logAuditEvent({
      action: "SUBMIT_FOR_APPROVAL",
      entityType: "Document",
      entityId: parsed.documentId,
      metadata: { requestId: request.id, stepCount: parsed.steps.length },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    revalidatePath(`/documents/${parsed.documentId}`)
    return { success: true, data: { id: request.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to submit for approval" }
  }
}

export async function approveStep(stepId: string, comment?: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    const step = await db.approvalStep.findUnique({
      where: { id: stepId },
      include: {
        approvalRequest: {
          include: {
            document: { select: { id: true, title: true } },
            steps: { orderBy: { stepOrder: "asc" } },
          },
        },
      },
    })
    if (!step) return { success: false, error: "Step not found" }
    if (step.approvalRequest.organizationId !== dbOrgId) return { success: false, error: "Step not found" }
    if (step.assignedToId !== dbUserId) return { success: false, error: "You are not assigned to this step" }
    if (step.status !== "PENDING") return { success: false, error: "Step is not pending" }

    // Verify this is the current active step (lowest pending stepOrder)
    const currentPending = step.approvalRequest.steps.find((s) => s.status === "PENDING")
    if (!currentPending || currentPending.id !== stepId) {
      return { success: false, error: "This is not the current active step" }
    }

    const request = step.approvalRequest
    const doc = request.document
    const remainingSteps = request.steps.filter(
      (s) => s.id !== stepId && s.status === "PENDING"
    )
    const isFinalStep = remainingSteps.length === 0

    await db.$transaction(async (tx) => {
      await tx.approvalStep.update({
        where: { id: stepId },
        data: { status: "APPROVED", comment, decidedAt: new Date() },
      })

      if (isFinalStep) {
        await tx.approvalRequest.update({
          where: { id: request.id },
          data: { status: "APPROVED", completedAt: new Date() },
        })
        await tx.document.update({
          where: { id: doc.id },
          data: { status: "APPROVED" },
        })
      }
    })

    if (isFinalStep) {
      // Notify submitter
      createNotification({
        title: "Document Approved",
        message: `'${doc.title}' has been fully approved`,
        type: "APPROVAL_REQUEST",
        userId: request.submittedById,
        organizationId: dbOrgId,
      })
    } else {
      // Notify next reviewer
      const nextStep = remainingSteps[0]
      createNotification({
        title: "Document Review Assigned",
        message: `'${doc.title}' is ready for your review`,
        type: "APPROVAL_REQUEST",
        userId: nextStep.assignedToId,
        organizationId: dbOrgId,
      })
    }

    logAuditEvent({
      action: "APPROVAL_STEP_APPROVED",
      entityType: "Document",
      entityId: doc.id,
      metadata: { stepId, stepLabel: step.label, comment, isFinalStep },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    revalidatePath(`/documents/${doc.id}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to approve step" }
  }
}

export async function rejectStep(stepId: string, comment: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()

    if (!comment.trim()) return { success: false, error: "Comment is required when rejecting" }

    const step = await db.approvalStep.findUnique({
      where: { id: stepId },
      include: {
        approvalRequest: {
          include: {
            document: { select: { id: true, title: true } },
            steps: { orderBy: { stepOrder: "asc" } },
          },
        },
      },
    })
    if (!step) return { success: false, error: "Step not found" }
    if (step.approvalRequest.organizationId !== dbOrgId) return { success: false, error: "Step not found" }
    if (step.assignedToId !== dbUserId) return { success: false, error: "You are not assigned to this step" }
    if (step.status !== "PENDING") return { success: false, error: "Step is not pending" }

    const request = step.approvalRequest
    const doc = request.document

    await db.$transaction(async (tx) => {
      await tx.approvalStep.update({
        where: { id: stepId },
        data: { status: "REJECTED", comment, decidedAt: new Date() },
      })
      await tx.approvalRequest.update({
        where: { id: request.id },
        data: { status: "REJECTED", completedAt: new Date() },
      })
      await tx.document.update({
        where: { id: doc.id },
        data: { status: "DRAFT" },
      })
    })

    // Notify submitter
    createNotification({
      title: "Document Rejected",
      message: `'${doc.title}' was rejected: ${comment}`,
      type: "APPROVAL_REQUEST",
      userId: request.submittedById,
      organizationId: dbOrgId,
    })

    logAuditEvent({
      action: "APPROVAL_STEP_REJECTED",
      entityType: "Document",
      entityId: doc.id,
      metadata: { stepId, stepLabel: step.label, comment },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    revalidatePath(`/documents/${doc.id}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to reject step" }
  }
}

export async function cancelApprovalRequest(requestId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()

    const request = await db.approvalRequest.findFirst({
      where: { id: requestId, organizationId: dbOrgId },
      include: {
        document: { select: { id: true, title: true } },
        steps: { where: { status: "PENDING" } },
      },
    })
    if (!request) return { success: false, error: "Request not found" }
    if (request.status !== "IN_PROGRESS") return { success: false, error: "Request is not in progress" }

    // Only submitter or ADMIN+ can cancel
    if (request.submittedById !== dbUserId && !canManageOrg(role)) {
      return { success: false, error: "Only the submitter or an admin can cancel" }
    }

    await db.$transaction(async (tx) => {
      await tx.approvalRequest.update({
        where: { id: requestId },
        data: { status: "CANCELLED", completedAt: new Date() },
      })
      await tx.document.update({
        where: { id: request.documentId },
        data: { status: "DRAFT" },
      })
    })

    // Notify pending reviewers
    for (const step of request.steps) {
      createNotification({
        title: "Review Cancelled",
        message: `Review for '${request.document.title}' has been cancelled`,
        type: "APPROVAL_REQUEST",
        userId: step.assignedToId,
        organizationId: dbOrgId,
      })
    }

    logAuditEvent({
      action: "APPROVAL_CANCELLED",
      entityType: "Document",
      entityId: request.documentId,
      metadata: { requestId },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    revalidatePath(`/documents/${request.documentId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to cancel request" }
  }
}

export async function skipApprovalStep(stepId: string, reason: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Only admins can skip approval steps" }

    const step = await db.approvalStep.findUnique({
      where: { id: stepId },
      include: {
        approvalRequest: {
          include: {
            document: { select: { id: true, title: true } },
            steps: { orderBy: { stepOrder: "asc" } },
          },
        },
      },
    })
    if (!step) return { success: false, error: "Step not found" }
    if (step.approvalRequest.organizationId !== dbOrgId) return { success: false, error: "Step not found" }
    if (step.status !== "PENDING") return { success: false, error: "Step is not pending" }

    const request = step.approvalRequest
    const doc = request.document
    const remainingSteps = request.steps.filter(
      (s) => s.id !== stepId && s.status === "PENDING"
    )
    const isFinalStep = remainingSteps.length === 0

    await db.$transaction(async (tx) => {
      await tx.approvalStep.update({
        where: { id: stepId },
        data: { status: "SKIPPED", comment: reason, decidedAt: new Date() },
      })

      if (isFinalStep) {
        await tx.approvalRequest.update({
          where: { id: request.id },
          data: { status: "APPROVED", completedAt: new Date() },
        })
        await tx.document.update({
          where: { id: doc.id },
          data: { status: "APPROVED" },
        })
      }
    })

    if (isFinalStep) {
      createNotification({
        title: "Document Approved",
        message: `'${doc.title}' has been fully approved`,
        type: "APPROVAL_REQUEST",
        userId: request.submittedById,
        organizationId: dbOrgId,
      })
    } else {
      const nextStep = remainingSteps[0]
      createNotification({
        title: "Document Review Assigned",
        message: `'${doc.title}' is ready for your review`,
        type: "APPROVAL_REQUEST",
        userId: nextStep.assignedToId,
        organizationId: dbOrgId,
      })
    }

    logAuditEvent({
      action: "APPROVAL_STEP_SKIPPED",
      entityType: "Document",
      entityId: doc.id,
      metadata: { stepId, stepLabel: step.label, reason },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    revalidatePath(`/documents/${doc.id}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to skip step" }
  }
}

export async function getDocumentApprovalHistory(documentId: string) {
  const { dbOrgId } = await getAuthContext()

  return db.approvalRequest.findMany({
    where: { documentId, organizationId: dbOrgId },
    include: {
      submittedBy: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
      template: { select: { id: true, name: true } },
      steps: {
        orderBy: { stepOrder: "asc" },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getMyPendingReviews() {
  const { dbUserId, dbOrgId } = await getAuthContext()

  const steps = await db.approvalStep.findMany({
    where: {
      assignedToId: dbUserId,
      status: "PENDING",
      approvalRequest: {
        organizationId: dbOrgId,
        status: "IN_PROGRESS",
      },
    },
    include: {
      approvalRequest: {
        include: {
          document: { select: { id: true, title: true, status: true } },
          submittedBy: { select: { id: true, firstName: true, lastName: true } },
          steps: { orderBy: { stepOrder: "asc" }, select: { id: true, status: true, stepOrder: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // Only return steps that are the current active step (lowest pending)
  return steps.filter((step) => {
    const currentPending = step.approvalRequest.steps.find((s) => s.status === "PENDING")
    return currentPending?.id === step.id
  })
}
