"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { differenceInDays } from "date-fns"

export type SiteMetrics = {
  siteId: string | null
  siteName: string
  siteCode: string
  siteType: string
  incidents: number
  incidentsByType: Record<string, number>
  ltiCount: number
  ltifr: number | null
  openCapas: number
  overdueCapas: number
  activePermits: number
  equipmentCount: number
  checklistCompliance: number
  activeObligations: number
  expiringObligations: number
  expiredObligations: number
}

export type CorporateDashboardData = {
  sites: SiteMetrics[]
  totals: {
    incidents: number
    ltiCount: number
    ltifr: number | null
    openCapas: number
    overdueCapas: number
    activeObligations: number
    expiringObligations: number
    checklistCompliance: number
    monthlyHoursWorked: number | null
  }
  alerts: Array<{ type: string; site: string; message: string }>
}

export async function getCorporateDashboardData(): Promise<CorporateDashboardData | null> {
  const { dbOrgId } = await getAuthContext()

  // Feature gate
  const billing = await getBillingContext(dbOrgId)
  const access = checkFeatureAccess(billing, "multiSiteHierarchy")
  if (!access.allowed) return null

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Fetch all sites
  const sites = await db.site.findMany({
    where: { organizationId: dbOrgId, isActive: true },
    select: { id: true, name: true, code: true, siteType: true },
    orderBy: [{ siteType: "asc" }, { name: "asc" }],
  })

  // Fetch org settings for LTIFR hours
  const org = await db.organization.findUnique({
    where: { id: dbOrgId },
    select: { settings: true },
  })
  const settings = (org?.settings as Record<string, unknown>) ?? {}
  const monthlyHoursWorked = (settings.monthlyHoursWorked as number) ?? null

  // All site IDs + null for unassigned
  const siteIds = sites.map((s) => s.id)

  // ── Parallel queries ──
  const [
    incidents,
    ltiIncidents,
    openCapas,
    overdueCapas,
    activePermits,
    equipmentCounts,
    checklists,
    obligations,
  ] = await Promise.all([
    // Incidents grouped by siteId and type
    db.incident.groupBy({
      by: ["siteId", "incidentType"],
      where: { organizationId: dbOrgId },
      _count: true,
    }),

    // LTI incidents by site
    db.incident.groupBy({
      by: ["siteId"],
      where: { organizationId: dbOrgId, incidentType: { in: ["LOST_TIME", "FATALITY"] } },
      _count: true,
    }),

    // Open CAPAs by project's site (join through project)
    db.$queryRaw<Array<{ site_id: string | null; count: bigint }>>`
      SELECT p.site_id, COUNT(c.id)::bigint as count
      FROM capas c
      LEFT JOIN projects p ON c.project_id = p.id
      WHERE c.organization_id = ${dbOrgId}
        AND c.status NOT IN ('CLOSED')
      GROUP BY p.site_id
    `,

    // Overdue CAPAs by project's site
    db.$queryRaw<Array<{ site_id: string | null; count: bigint }>>`
      SELECT p.site_id, COUNT(c.id)::bigint as count
      FROM capas c
      LEFT JOIN projects p ON c.project_id = p.id
      WHERE c.organization_id = ${dbOrgId}
        AND c.status = 'OVERDUE'
      GROUP BY p.site_id
    `,

    // Active permits by site
    db.workPermit.groupBy({
      by: ["siteId"],
      where: { organizationId: dbOrgId, status: "ACTIVE" },
      _count: true,
    }),

    // Equipment count by site
    db.equipment.groupBy({
      by: ["siteId"],
      where: { organizationId: dbOrgId },
      _count: true,
    }),

    // Checklist compliance by project's site
    db.$queryRaw<Array<{ site_id: string | null; avg_compliance: number }>>`
      SELECT p.site_id, AVG(cl.completion_percentage)::float as avg_compliance
      FROM compliance_checklists cl
      LEFT JOIN projects p ON cl.project_id = p.id
      WHERE cl.organization_id = ${dbOrgId}
      GROUP BY p.site_id
    `,

    // Obligations by site and status
    db.complianceObligation.groupBy({
      by: ["siteId", "status"],
      where: { organizationId: dbOrgId },
      _count: true,
    }),
  ])

  // Expiring obligations (within 30 days)
  const expiringObligations = await db.complianceObligation.groupBy({
    by: ["siteId"],
    where: {
      organizationId: dbOrgId,
      status: "ACTIVE",
      expiryDate: { gte: now, lte: thirtyDaysFromNow },
    },
    _count: true,
  })

  // ── Build per-site metrics ──
  function buildSiteMetrics(siteId: string | null, siteName: string, siteCode: string, siteType: string): SiteMetrics {
    // Incidents
    const siteIncidents = incidents.filter((i) => i.siteId === siteId)
    const incidentsByType: Record<string, number> = {}
    let totalIncidents = 0
    for (const row of siteIncidents) {
      incidentsByType[row.incidentType] = row._count
      totalIncidents += row._count
    }

    // LTI
    const ltiRow = ltiIncidents.find((l) => l.siteId === siteId)
    const ltiCount = ltiRow?._count ?? 0
    const ltifr = monthlyHoursWorked && monthlyHoursWorked > 0
      ? (ltiCount * 1_000_000) / (monthlyHoursWorked * 12)
      : null

    // CAPAs (via raw query)
    const openCapaRow = openCapas.find((c) => c.site_id === siteId)
    const overdueCapaRow = overdueCapas.find((c) => c.site_id === siteId)

    // Permits
    const permitRow = activePermits.find((p) => p.siteId === siteId)

    // Equipment
    const equipRow = equipmentCounts.find((e) => e.siteId === siteId)

    // Checklists
    const clRow = checklists.find((cl) => cl.site_id === siteId)

    // Obligations
    const siteObligations = obligations.filter((o) => o.siteId === siteId)
    const activeObl = siteObligations.find((o) => o.status === "ACTIVE")?._count ?? 0
    const expiredObl = siteObligations.find((o) => o.status === "EXPIRED")?._count ?? 0
    const expiringRow = expiringObligations.find((e) => e.siteId === siteId)

    return {
      siteId,
      siteName,
      siteCode,
      siteType,
      incidents: totalIncidents,
      incidentsByType,
      ltiCount,
      ltifr,
      openCapas: Number(openCapaRow?.count ?? 0),
      overdueCapas: Number(overdueCapaRow?.count ?? 0),
      activePermits: permitRow?._count ?? 0,
      equipmentCount: equipRow?._count ?? 0,
      checklistCompliance: clRow?.avg_compliance ?? 0,
      activeObligations: activeObl,
      expiringObligations: expiringRow?._count ?? 0,
      expiredObligations: expiredObl,
    }
  }

  const siteMetrics = sites.map((s) => buildSiteMetrics(s.id, s.name, s.code, s.siteType))

  // Add "Unassigned" bucket
  const unassigned = buildSiteMetrics(null, "Unassigned", "—", "—")
  if (unassigned.incidents > 0 || unassigned.openCapas > 0 || unassigned.equipmentCount > 0 || unassigned.activeObligations > 0) {
    siteMetrics.push(unassigned)
  }

  // ── Totals ──
  const totalIncidents = siteMetrics.reduce((s, m) => s + m.incidents, 0)
  const totalLti = siteMetrics.reduce((s, m) => s + m.ltiCount, 0)
  const totalLtifr = monthlyHoursWorked && monthlyHoursWorked > 0
    ? (totalLti * 1_000_000) / (monthlyHoursWorked * 12)
    : null
  const totalOpenCapas = siteMetrics.reduce((s, m) => s + m.openCapas, 0)
  const totalOverdueCapas = siteMetrics.reduce((s, m) => s + m.overdueCapas, 0)
  const totalActiveObl = siteMetrics.reduce((s, m) => s + m.activeObligations, 0)
  const totalExpiringObl = siteMetrics.reduce((s, m) => s + m.expiringObligations, 0)
  const avgCompliance = siteMetrics.length > 0
    ? siteMetrics.reduce((s, m) => s + m.checklistCompliance, 0) / siteMetrics.filter((m) => m.checklistCompliance > 0).length || 0
    : 0

  // ── Alerts ──
  const alerts: Array<{ type: string; site: string; message: string }> = []
  for (const m of siteMetrics) {
    if (m.ltifr !== null && m.ltifr >= 1.0) {
      alerts.push({ type: "critical", site: m.siteName, message: `LTIFR ${m.ltifr.toFixed(2)} — above threshold (1.0)` })
    }
    if (m.overdueCapas > 0) {
      alerts.push({ type: "warning", site: m.siteName, message: `${m.overdueCapas} overdue CAPA${m.overdueCapas > 1 ? "s" : ""}` })
    }
    if (m.expiringObligations > 0) {
      alerts.push({ type: "warning", site: m.siteName, message: `${m.expiringObligations} obligation${m.expiringObligations > 1 ? "s" : ""} expiring within 30 days` })
    }
    if (m.expiredObligations > 0) {
      alerts.push({ type: "critical", site: m.siteName, message: `${m.expiredObligations} expired obligation${m.expiredObligations > 1 ? "s" : ""}` })
    }
  }

  return {
    sites: siteMetrics,
    totals: {
      incidents: totalIncidents,
      ltiCount: totalLti,
      ltifr: totalLtifr,
      openCapas: totalOpenCapas,
      overdueCapas: totalOverdueCapas,
      activeObligations: totalActiveObl,
      expiringObligations: totalExpiringObl,
      checklistCompliance: avgCompliance,
      monthlyHoursWorked,
    },
    alerts,
  }
}
