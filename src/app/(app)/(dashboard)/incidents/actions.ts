"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { notifyOrgMembers } from "@/lib/notifications"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
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
  rootCauseData: z.object({
    method: z.enum(["simple", "5-whys"]),
    category: z.enum(["human", "machine", "material", "method", "environment", "measurement"]).optional(),
    whys: z.array(z.object({ question: z.string(), answer: z.string() })).max(5),
    rootCause: z.string().max(2000),
    containmentAction: z.string().max(2000).optional(),
  }).optional(),
  investigationDue: z.coerce.date().optional(),
  projectId: z.string().optional(),
  investigatorId: z.string().optional(),
  incidentTime: z.string().max(5).optional(), // HH:mm
  lostDays: z.coerce.number().int().min(0).optional(),
  bodyPartInjured: z.string().max(200).optional(),
  natureOfInjury: z.string().max(200).optional(),
  treatmentType: z.enum(["NONE", "FIRST_AID", "MEDICAL", "HOSPITALIZED"]).optional(),
  contributingFactors: z.array(z.string()).optional(),
  isReportable: z.boolean().default(false),
  reportingDeadline: z.coerce.date().optional(),
  mhsaSection: z.enum(["11", "23", "24"]).optional(),
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
      evidence: {
        include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
      },
      witnessRecords: { orderBy: { createdAt: "asc" } },
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

    // Billing gate — basic incident management
    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "incidentManagement")
    if (!access.allowed) return { success: false, error: access.reason ?? "Incident management requires an active subscription." }

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
        incidentTime: parsed.incidentTime || null,
        lostDays: parsed.lostDays ?? null,
        bodyPartInjured: parsed.bodyPartInjured || null,
        natureOfInjury: parsed.natureOfInjury || null,
        treatmentType: parsed.treatmentType || null,
        contributingFactors: parsed.contributingFactors ? (parsed.contributingFactors as unknown as Prisma.InputJsonValue) : undefined,
        isReportable: parsed.isReportable,
        reportingDeadline: parsed.reportingDeadline || null,
        mhsaSection: parsed.mhsaSection || null,
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
        incidentTime: parsed.incidentTime || null,
        lostDays: parsed.lostDays ?? null,
        bodyPartInjured: parsed.bodyPartInjured || null,
        natureOfInjury: parsed.natureOfInjury || null,
        treatmentType: parsed.treatmentType || null,
        contributingFactors: parsed.contributingFactors ? (parsed.contributingFactors as unknown as Prisma.InputJsonValue) : undefined,
        isReportable: parsed.isReportable,
        reportingDeadline: parsed.reportingDeadline || null,
        mhsaSection: parsed.mhsaSection || null,
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

  const [total, byType, ltiCount, lostDaysResult] = await Promise.all([
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
    db.incident.aggregate({
      where: { organizationId: dbOrgId, status: { not: "CLOSED" } },
      _sum: { lostDays: true },
    }),
  ])

  return {
    total,
    byType: byType.map((r) => ({ type: r.incidentType, count: r._count._all })),
    ltiCount,
    totalLostDays: lostDaysResult._sum.lostDays ?? 0,
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

// ─────────────────────────────────────────────
// EVIDENCE MANAGEMENT
// ─────────────────────────────────────────────

export async function addEvidence(incidentId: string, fileKey: string, fileName: string, fileType: string, fileSize: number, caption?: string): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    // Advanced feature gate
    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "advancedIncidentManagement")
    if (!access.allowed) return { success: false, error: access.reason ?? "Evidence uploads require a Professional plan or higher." }

    const incident = await db.incident.findFirst({ where: { id: incidentId, organizationId: dbOrgId } })
    if (!incident) return { success: false, error: "Incident not found" }

    const evidence = await db.incidentEvidence.create({
      data: { incidentId, fileKey, fileName, fileType, fileSize, caption: caption || null, uploadedById: dbUserId },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "IncidentEvidence",
      entityId: evidence.id,
      metadata: { incidentId, fileName },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/incidents/${incidentId}`)
    return { success: true, data: { id: evidence.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add evidence" }
  }
}

export async function removeEvidence(evidenceId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const evidence = await db.incidentEvidence.findFirst({
      where: { id: evidenceId },
      include: { incident: { select: { id: true, organizationId: true } } },
    })
    if (!evidence || evidence.incident.organizationId !== dbOrgId) return { success: false, error: "Evidence not found" }

    await db.incidentEvidence.delete({ where: { id: evidenceId } })

    logAuditEvent({
      action: "DELETE",
      entityType: "IncidentEvidence",
      entityId: evidenceId,
      metadata: { incidentId: evidence.incidentId, fileName: evidence.fileName },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/incidents/${evidence.incidentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove evidence" }
  }
}

// ─────────────────────────────────────────────
// WITNESS MANAGEMENT
// ─────────────────────────────────────────────

const witnessSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  contactNumber: z.string().max(20).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  statement: z.string().max(5000).optional(),
})

export type WitnessFormValues = z.infer<typeof witnessSchema>

export async function addWitness(incidentId: string, values: WitnessFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    // Advanced feature gate
    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "advancedIncidentManagement")
    if (!access.allowed) return { success: false, error: access.reason ?? "Witness statements require a Professional plan or higher." }

    const parsed = witnessSchema.parse(values)

    const incident = await db.incident.findFirst({ where: { id: incidentId, organizationId: dbOrgId } })
    if (!incident) return { success: false, error: "Incident not found" }

    const witness = await db.incidentWitness.create({
      data: {
        incidentId,
        name: parsed.name,
        contactNumber: parsed.contactNumber || null,
        email: parsed.email || null,
        statement: parsed.statement || null,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "IncidentWitness",
      entityId: witness.id,
      metadata: { incidentId, witnessName: witness.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/incidents/${incidentId}`)
    return { success: true, data: { id: witness.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add witness" }
  }
}

export async function updateWitness(witnessId: string, values: WitnessFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = witnessSchema.parse(values)

    const witness = await db.incidentWitness.findFirst({
      where: { id: witnessId },
      include: { incident: { select: { id: true, organizationId: true } } },
    })
    if (!witness || witness.incident.organizationId !== dbOrgId) return { success: false, error: "Witness not found" }

    await db.incidentWitness.update({
      where: { id: witnessId },
      data: {
        name: parsed.name,
        contactNumber: parsed.contactNumber || null,
        email: parsed.email || null,
        statement: parsed.statement || null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "IncidentWitness",
      entityId: witnessId,
      metadata: { incidentId: witness.incidentId, witnessName: parsed.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/incidents/${witness.incidentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update witness" }
  }
}

export async function removeWitness(witnessId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const witness = await db.incidentWitness.findFirst({
      where: { id: witnessId },
      include: { incident: { select: { id: true, organizationId: true } } },
    })
    if (!witness || witness.incident.organizationId !== dbOrgId) return { success: false, error: "Witness not found" }

    await db.incidentWitness.delete({ where: { id: witnessId } })

    logAuditEvent({
      action: "DELETE",
      entityType: "IncidentWitness",
      entityId: witnessId,
      metadata: { incidentId: witness.incidentId, witnessName: witness.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/incidents/${witness.incidentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove witness" }
  }
}
