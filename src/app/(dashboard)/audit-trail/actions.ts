"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"

export interface AuditEventFilters {
  action?: string
  entityType?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
}

const PAGE_SIZE = 25

export async function getAuditEvents(
  filters: AuditEventFilters = {},
  page = 1
) {
  const { dbOrgId } = await getAuthContext()

  const where: Record<string, unknown> = {
    organizationId: dbOrgId,
  }

  if (filters.action) {
    where.action = filters.action
  }

  if (filters.entityType) {
    where.entityType = filters.entityType
  }

  if (filters.userId) {
    where.userId = filters.userId
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(filters.dateTo + "T23:59:59.999Z") } : {}),
    }
  }

  const [events, total] = await Promise.all([
    db.auditTrailEvent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.auditTrailEvent.count({ where }),
  ])

  return {
    events,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getAuditFilterOptions() {
  const { dbOrgId } = await getAuthContext()

  const [actions, entityTypes, users] = await Promise.all([
    db.auditTrailEvent.findMany({
      where: { organizationId: dbOrgId },
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    }),
    db.auditTrailEvent.findMany({
      where: { organizationId: dbOrgId },
      select: { entityType: true },
      distinct: ["entityType"],
      orderBy: { entityType: "asc" },
    }),
    db.organizationUser.findMany({
      where: { organizationId: dbOrgId, isActive: true },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
  ])

  return {
    actions: actions.map((a) => a.action),
    entityTypes: entityTypes.map((e) => e.entityType),
    users: users.map((u) => ({
      id: u.user.id,
      name: `${u.user.firstName} ${u.user.lastName}`,
    })),
  }
}

export async function exportAuditEvents(filters: AuditEventFilters = {}) {
  const { dbOrgId } = await getAuthContext()

  const where: Record<string, unknown> = {
    organizationId: dbOrgId,
  }

  if (filters.action) where.action = filters.action
  if (filters.entityType) where.entityType = filters.entityType
  if (filters.userId) where.userId = filters.userId
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(filters.dateTo + "T23:59:59.999Z") } : {}),
    }
  }

  const events = await db.auditTrailEvent.findMany({
    where,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  })

  const header = "Timestamp,Action,Entity Type,Entity ID,User,Email,Metadata"
  const rows = events.map((e) => {
    const user = e.user ? `${e.user.firstName} ${e.user.lastName}` : "System"
    const email = e.user?.email ?? ""
    const metadata = e.metadata ? JSON.stringify(e.metadata).replace(/"/g, '""') : ""
    return `${e.createdAt.toISOString()},${e.action},${e.entityType},${e.entityId},${user},${email},"${metadata}"`
  })

  return [header, ...rows].join("\n")
}
