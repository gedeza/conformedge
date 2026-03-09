"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { notifyOrgMembers } from "@/lib/notifications"
import type { ActionResult } from "@/types"

const reviewSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  reviewDate: z.coerce.date(),
  location: z.string().max(500).optional(),
  meetingMinutes: z.string().max(10000).optional(),
  nextReviewDate: z.coerce.date().optional(),
  facilitatorId: z.string().min(1, "Facilitator is required"),
  standardIds: z.array(z.string()).min(1, "At least one standard is required"),
  attendeeIds: z.array(z.string()).optional(),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>

const agendaItemSchema = z.object({
  type: z.enum([
    "AUDIT_RESULTS", "CUSTOMER_FEEDBACK", "PROCESS_PERFORMANCE", "CAPA_STATUS",
    "PREVIOUS_ACTIONS", "CHANGES_CONTEXT", "IMPROVEMENT_OPPORTUNITIES",
    "RESOURCE_NEEDS", "RISK_OPPORTUNITIES", "OBJECTIVES_PERFORMANCE",
    "INCIDENT_TRENDS", "OTHER",
  ]),
  title: z.string().min(1).max(500),
  notes: z.string().max(5000).optional(),
  sortOrder: z.number().int().min(0),
})

const actionSchema = z.object({
  description: z.string().min(1, "Description is required").max(2000),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().optional(),
})

const PAGE_SIZE = 50

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export async function getReviews(page = 1) {
  const { dbOrgId } = await getAuthContext()
  const where = { organizationId: dbOrgId }

  const [reviews, total] = await Promise.all([
    db.managementReview.findMany({
      where,
      include: {
        facilitator: { select: { id: true, firstName: true, lastName: true } },
        standards: { include: { standard: { select: { id: true, code: true, name: true } } } },
        _count: { select: { agendaItems: true, actions: true, attendees: true } },
      },
      orderBy: { reviewDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.managementReview.count({ where }),
  ])

  return {
    reviews,
    pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
  }
}

export async function getReview(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.managementReview.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      facilitator: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      standards: { include: { standard: { select: { id: true, code: true, name: true } } } },
      attendees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      agendaItems: { orderBy: { sortOrder: "asc" } },
      actions: {
        include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createReview(values: ReviewFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = reviewSchema.parse(values)

    const review = await db.managementReview.create({
      data: {
        title: parsed.title,
        reviewDate: parsed.reviewDate,
        location: parsed.location || null,
        meetingMinutes: parsed.meetingMinutes || null,
        nextReviewDate: parsed.nextReviewDate || null,
        facilitatorId: parsed.facilitatorId,
        createdById: dbUserId,
        organizationId: dbOrgId,
        standards: {
          create: parsed.standardIds.map((sid) => ({ standardId: sid })),
        },
        attendees: parsed.attendeeIds?.length
          ? { create: parsed.attendeeIds.map((uid) => ({ userId: uid })) }
          : undefined,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "ManagementReview",
      entityId: review.id,
      metadata: { title: review.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    notifyOrgMembers({
      title: "Management review scheduled",
      message: `"${review.title}" has been scheduled.`,
      type: "MANAGEMENT_REVIEW_DUE",
      organizationId: dbOrgId,
      excludeUserId: dbUserId,
    })

    revalidatePath("/management-reviews")
    revalidatePath("/dashboard")
    return { success: true, data: { id: review.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create review" }
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateReview(id: string, values: ReviewFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = reviewSchema.parse(values)

    const existing = await db.managementReview.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Review not found" }

    await db.$transaction(async (tx) => {
      await tx.managementReview.update({
        where: { id },
        data: {
          title: parsed.title,
          reviewDate: parsed.reviewDate,
          location: parsed.location || null,
          meetingMinutes: parsed.meetingMinutes || null,
          nextReviewDate: parsed.nextReviewDate || null,
          facilitatorId: parsed.facilitatorId,
        },
      })

      // Replace standards
      await tx.managementReviewStandard.deleteMany({ where: { reviewId: id } })
      await tx.managementReviewStandard.createMany({
        data: parsed.standardIds.map((sid) => ({ reviewId: id, standardId: sid })),
      })

      // Replace attendees
      await tx.managementReviewAttendee.deleteMany({ where: { reviewId: id } })
      if (parsed.attendeeIds?.length) {
        await tx.managementReviewAttendee.createMany({
          data: parsed.attendeeIds.map((uid) => ({ reviewId: id, userId: uid })),
        })
      }
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "ManagementReview",
      entityId: id,
      metadata: { title: parsed.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/management-reviews")
    revalidatePath(`/management-reviews/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update review" }
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deleteReview(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.managementReview.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Review not found" }

    await db.managementReview.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "ManagementReview",
      entityId: id,
      metadata: { title: existing.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/management-reviews")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete review" }
  }
}

// ─────────────────────────────────────────────
// STATE TRANSITIONS
// ─────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
}

export async function transitionReview(id: string, newStatus: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.managementReview.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Review not found" }

    const allowed = VALID_TRANSITIONS[existing.status] || []
    if (!allowed.includes(newStatus)) {
      return { success: false, error: `Cannot transition from ${existing.status} to ${newStatus}` }
    }

    await db.managementReview.update({ where: { id }, data: { status: newStatus as "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" } })

    logAuditEvent({
      action: "UPDATE",
      entityType: "ManagementReview",
      entityId: id,
      metadata: { title: existing.title, transition: `${existing.status} → ${newStatus}` },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/management-reviews")
    revalidatePath(`/management-reviews/${id}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to transition review" }
  }
}

// ─────────────────────────────────────────────
// AGENDA ITEMS
// ─────────────────────────────────────────────

export async function addAgendaItem(reviewId: string, values: z.infer<typeof agendaItemSchema>): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const review = await db.managementReview.findFirst({ where: { id: reviewId, organizationId: dbOrgId } })
    if (!review) return { success: false, error: "Review not found" }

    const parsed = agendaItemSchema.parse(values)
    await db.managementReviewAgendaItem.create({
      data: { reviewId, ...parsed },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "ManagementReview",
      entityId: reviewId,
      metadata: { title: review.title, addedAgendaItem: parsed.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/management-reviews/${reviewId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add agenda item" }
  }
}

export async function updateAgendaItem(itemId: string, values: { notes?: string }): Promise<ActionResult> {
  try {
    const { dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const item = await db.managementReviewAgendaItem.findFirst({
      where: { id: itemId },
      include: { review: { select: { organizationId: true } } },
    })
    if (!item || item.review.organizationId !== dbOrgId) return { success: false, error: "Item not found" }

    await db.managementReviewAgendaItem.update({
      where: { id: itemId },
      data: { notes: values.notes ?? null },
    })

    revalidatePath(`/management-reviews/${item.reviewId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update agenda item" }
  }
}

export async function deleteAgendaItem(itemId: string): Promise<ActionResult> {
  try {
    const { dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const item = await db.managementReviewAgendaItem.findFirst({
      where: { id: itemId },
      include: { review: { select: { organizationId: true } } },
    })
    if (!item || item.review.organizationId !== dbOrgId) return { success: false, error: "Item not found" }

    await db.managementReviewAgendaItem.delete({ where: { id: itemId } })

    revalidatePath(`/management-reviews/${item.reviewId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete agenda item" }
  }
}

// ─────────────────────────────────────────────
// REVIEW ACTIONS
// ─────────────────────────────────────────────

export async function addReviewAction(reviewId: string, values: z.infer<typeof actionSchema>): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const review = await db.managementReview.findFirst({ where: { id: reviewId, organizationId: dbOrgId } })
    if (!review) return { success: false, error: "Review not found" }

    const parsed = actionSchema.parse(values)
    await db.managementReviewAction.create({
      data: {
        reviewId,
        description: parsed.description,
        dueDate: parsed.dueDate || null,
        assigneeId: parsed.assigneeId || null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "ManagementReview",
      entityId: reviewId,
      metadata: { title: review.title, addedAction: parsed.description.slice(0, 100) },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/management-reviews/${reviewId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add action" }
  }
}

export async function updateActionStatus(actionId: string, newStatus: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const action = await db.managementReviewAction.findFirst({
      where: { id: actionId },
      include: { review: { select: { organizationId: true, title: true } } },
    })
    if (!action || action.review.organizationId !== dbOrgId) return { success: false, error: "Action not found" }

    const data: Record<string, unknown> = {
      status: newStatus as "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    }
    if (newStatus === "COMPLETED") data.completedAt = new Date()

    await db.managementReviewAction.update({ where: { id: actionId }, data })

    logAuditEvent({
      action: "UPDATE",
      entityType: "ManagementReview",
      entityId: action.reviewId,
      metadata: { title: action.review.title, actionTransition: `${action.status} → ${newStatus}` },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/management-reviews/${action.reviewId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update action status" }
  }
}

export async function deleteReviewAction(actionId: string): Promise<ActionResult> {
  try {
    const { dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const action = await db.managementReviewAction.findFirst({
      where: { id: actionId },
      include: { review: { select: { organizationId: true } } },
    })
    if (!action || action.review.organizationId !== dbOrgId) return { success: false, error: "Action not found" }

    await db.managementReviewAction.delete({ where: { id: actionId } })

    revalidatePath(`/management-reviews/${action.reviewId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete action" }
  }
}

// ─────────────────────────────────────────────
// DASHBOARD / HELPERS
// ─────────────────────────────────────────────

export async function getUpcomingReviewsSummary() {
  const { dbOrgId } = await getAuthContext()

  const upcoming = await db.managementReview.findMany({
    where: {
      organizationId: dbOrgId,
      status: { in: ["PLANNED", "IN_PROGRESS"] },
    },
    include: {
      facilitator: { select: { firstName: true, lastName: true } },
      standards: { include: { standard: { select: { code: true } } } },
      _count: { select: { actions: true } },
    },
    orderBy: { reviewDate: "asc" },
    take: 5,
  })

  const openActions = await db.managementReviewAction.count({
    where: {
      review: { organizationId: dbOrgId },
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
  })

  return { upcoming, openActions }
}

export async function getMembers() {
  const { dbOrgId } = await getAuthContext()
  const orgUsers = await db.organizationUser.findMany({
    where: { organizationId: dbOrgId, isActive: true },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  })
  return orgUsers.map((ou) => ({
    id: ou.user.id,
    name: `${ou.user.firstName} ${ou.user.lastName}`,
  }))
}

export async function getStandardOptions() {
  await getAuthContext()
  return db.standard.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  })
}
