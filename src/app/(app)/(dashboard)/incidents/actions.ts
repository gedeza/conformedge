"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { notifyOrgMembers } from "@/lib/notifications"
import type { Prisma } from "@/generated/prisma/client"
import type { ActionResult, RootCauseData } from "@/types"

const incidentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  incidentType: z.enum(["NEAR_MISS", "FIRST_AID", "MEDICAL", "LOST_TIME", "FATALITY", "ENVIRONMENTAL", "PROPERTY_DAMAGE"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  incidentDate: z.coerce.date(),
  location: z.string().max(500).optional(),
  injuredParty: z.string().max(500).optional(),
  witnesses: z.string().max(2000).optional(),
  immediateAction: z.string().max(2000).optional(),
  rootCause: z.string().max(2000).optional(),
  rootCauseData: z.any().optional(),
  investigationDue: z.coerce.date().optional(),
  projectId: z.string().optional(),
  investigatorId: z.string().optional(),
})

export type IncidentFormValues = z.infer<typeof incidentSchema>

const PAGE_SIZE = 50

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export async function getIncidents(page = 1) {
  const { dbOrgId } = await getAuthContext()

  const where = { organizationId: dbOrgId }

  const [incidents, total] = await Promise.all([
    db.incident.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        reportedBy: { select: { id: true, firstName: true, lastName: true } },
        investigator: { select: { id: true, firstName: true, lastName: true } },
        capa: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.incident.count({ where }),
  ])

  return {
    incidents,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getIncident(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.incident.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      project: { select: { id: true, name: true } },
      reportedBy: { select: { id: true, firstName: true, lastName: true } },
      investigator: { select: { id: true, firstName: true, lastName: true } },
      capa: { select: { id: true, title: true, status: true } },
    },
  })
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createIncident(values: IncidentFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = incidentSchema.parse(values)

    const rootCauseData = parsed.rootCauseData as RootCauseData | undefined

    const incident = await db.incident.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        incidentType: parsed.incidentType,
        severity: parsed.severity,
        incidentDate: parsed.incidentDate,
        location: parsed.location || null,
        injuredParty: parsed.injuredParty || null,
        witnesses: parsed.witnesses || null,
        immediateAction: parsed.immediateAction || null,
        rootCause: parsed.rootCause || null,
        rootCauseData: rootCauseData ? (rootCauseData as unknown as Prisma.InputJsonValue) : undefined,
        investigationDue: parsed.investigationDue || null,
        projectId: parsed.projectId || null,
        investigatorId: parsed.investigatorId || null,
        reportedById: dbUserId,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Incident",
      entityId: incident.id,
      metadata: { title: incident.title, type: incident.incidentType },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    // Notify all org members about the incident
    const typeLabel = parsed.incidentType.replace(/_/g, " ").toLowerCase()
    notifyOrgMembers({
      title: "Incident reported",
      message: `"${incident.title}" (${typeLabel}) reported${incident.location ? ` at ${incident.location}` : ""}.`,
      type: "INCIDENT_REPORTED",
      organizationId: dbOrgId,
      excludeUserId: dbUserId,
    })

    // For FATALITY incidents, ensure admin notification is sent with await (legal certainty)
    if (parsed.incidentType === "FATALITY") {
      const admins = await db.organizationUser.findMany({
        where: {
          organizationId: dbOrgId,
          isActive: true,
          role: { in: ["OWNER", "ADMIN", "MANAGER"] },
          userId: { not: dbUserId },
        },
        select: { userId: true },
      })

      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((a) => ({
            title: "CRITICAL: Fatality incident reported",
            message: `A fatality incident "${incident.title}" has been reported${incident.location ? ` at ${incident.location}` : ""}. Immediate action required.`,
            type: "INCIDENT_REPORTED" as const,
            userId: a.userId,
            organizationId: dbOrgId,
          })),
        })
      }
    }

    revalidatePath("/incidents")
    revalidatePath("/dashboard")
    return { success: true, data: { id: incident.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to report incident" }
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateIncident(id: string, values: IncidentFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = incidentSchema.parse(values)

    const existing = await db.incident.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Incident not found" }

    const rootCauseData = parsed.rootCauseData as RootCauseData | undefined

    await db.incident.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description,
        incidentType: parsed.incidentType,
        severity: parsed.severity,
        incidentDate: parsed.incidentDate,
        location: parsed.location || null,
        injuredParty: parsed.injuredParty || null,
        witnesses: parsed.witnesses || null,
        immediateAction: parsed.immediateAction || null,
        rootCause: parsed.rootCause || null,
        rootCauseData: rootCauseData ? (rootCauseData as unknown as Prisma.InputJsonValue) : undefined,
        investigationDue: parsed.investigationDue || null,
        projectId: parsed.projectId || null,
        investigatorId: parsed.investigatorId || null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Incident",
      entityId: id,
      metadata: { title: parsed.title, type: parsed.incidentType },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/incidents")
    revalidatePath(`/incidents/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update incident" }
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deleteIncident(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.incident.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Incident not found" }

    await db.incident.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "Incident",
      entityId: id,
      metadata: { title: existing.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/incidents")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete incident" }
  }
}

// ─────────────────────────────────────────────
// STATE TRANSITIONS
// ─────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  REPORTED: ["INVESTIGATING", "CLOSED"],
  INVESTIGATING: ["CORRECTIVE_ACTION", "CLOSED"],
  CORRECTIVE_ACTION: ["CLOSED"],
  CLOSED: [],
}

export async function transitionIncident(id: string, newStatus: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.incident.findFirst({ where: { id, organizationId: dbOrgId } })
    if (!existing) return { success: false, error: "Incident not found" }

    const allowed = VALID_TRANSITIONS[existing.status] || []
    if (!allowed.includes(newStatus)) {
      return { success: false, error: `Cannot transition from ${existing.status} to ${newStatus}` }
    }

    const data: Record<string, unknown> = { status: newStatus }
    if (newStatus === "CLOSED") {
      data.closedDate = new Date()
    }

    await db.incident.update({ where: { id }, data })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Incident",
      entityId: id,
      metadata: { title: existing.title, transition: `${existing.status} → ${newStatus}` },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/incidents")
    revalidatePath(`/incidents/${id}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to transition incident" }
  }
}

// ─────────────────────────────────────────────
// CAPA LINKING
// ─────────────────────────────────────────────

export async function linkIncidentToCapa(incidentId: string, capaId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const [incident, capa] = await Promise.all([
      db.incident.findFirst({ where: { id: incidentId, organizationId: dbOrgId } }),
      db.capa.findFirst({ where: { id: capaId, organizationId: dbOrgId } }),
    ])

    if (!incident) return { success: false, error: "Incident not found" }
    if (!capa) return { success: false, error: "CAPA not found" }

    await db.incident.update({
      where: { id: incidentId },
      data: { capaId },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Incident",
      entityId: incidentId,
      metadata: { title: incident.title, linkedCapa: capa.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/incidents/${incidentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to link CAPA" }
  }
}

export async function unlinkIncidentFromCapa(incidentId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const incident = await db.incident.findFirst({ where: { id: incidentId, organizationId: dbOrgId } })
    if (!incident) return { success: false, error: "Incident not found" }

    await db.incident.update({
      where: { id: incidentId },
      data: { capaId: null },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Incident",
      entityId: incidentId,
      metadata: { title: incident.title, unlinkedCapa: true },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/incidents/${incidentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to unlink CAPA" }
  }
}

// ─────────────────────────────────────────────
// DASHBOARD / REPORTS
// ─────────────────────────────────────────────

export async function getOpenIncidentsSummary() {
  const { dbOrgId } = await getAuthContext()

  const [total, byType, ltiCount] = await Promise.all([
    db.incident.count({
      where: { organizationId: dbOrgId, status: { not: "CLOSED" } },
    }),
    db.incident.groupBy({
      by: ["incidentType"],
      where: { organizationId: dbOrgId, status: { not: "CLOSED" } },
      _count: { _all: true },
    }),
    db.incident.count({
      where: { organizationId: dbOrgId, incidentType: "LOST_TIME", status: { not: "CLOSED" } },
    }),
  ])

  return {
    total,
    byType: byType.map((r) => ({ type: r.incidentType, count: r._count._all })),
    ltiCount,
  }
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
  const orgUsers = await db.organizationUser.findMany({
    where: { organizationId: dbOrgId, isActive: true },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  })
  return orgUsers.map((ou) => ({
    id: ou.user.id,
    name: `${ou.user.firstName} ${ou.user.lastName}`,
  }))
}

export async function getCapaOptions() {
  const { dbOrgId } = await getAuthContext()
  return db.capa.findMany({
    where: { organizationId: dbOrgId, status: { not: "CLOSED" } },
    select: { id: true, title: true, status: true },
    orderBy: { createdAt: "desc" },
  })
}
