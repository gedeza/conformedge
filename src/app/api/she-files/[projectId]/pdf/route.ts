import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { format, differenceInDays } from "date-fns"
import React from "react"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { SHEFilePDF } from "@/lib/pdf/she-file-pdf"
import { captureError } from "@/lib/error-tracking"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { dbOrgId, dbUserId } = await getAuthContext()
    const { projectId } = await params

    // ── Fetch project ──
    const project = await db.project.findFirst({
      where: { id: projectId, organizationId: dbOrgId },
      select: { id: true, name: true, description: true, siteId: true, site: { select: { name: true, code: true } } },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // ── Fetch org + members ──
    const org = await db.organization.findUnique({
      where: { id: dbOrgId },
      select: {
        name: true,
        members: {
          where: { isActive: true },
          select: {
            role: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    })

    const currentUser = await db.user.findUnique({
      where: { id: dbUserId },
      select: { firstName: true, lastName: true },
    })

    // ── Fetch obligations (org-wide, optionally project-scoped) ──
    const obligations = await db.complianceObligation.findMany({
      where: {
        organizationId: dbOrgId,
        OR: [{ projectId }, { projectId: null }],
      },
      select: {
        title: true,
        obligationType: true,
        status: true,
        effectiveDate: true,
        expiryDate: true,
        vendor: { select: { name: true } },
        responsibleUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { expiryDate: "asc" },
    })

    // ── Fetch assessments (project-scoped) ──
    const assessments = await db.assessment.findMany({
      where: { projectId, organizationId: dbOrgId },
      select: {
        title: true,
        overallScore: true,
        riskLevel: true,
        completedDate: true,
        standard: { select: { code: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // ── Fetch work permits (project-scoped) ──
    const permits = await db.workPermit.findMany({
      where: { projectId, organizationId: dbOrgId },
      select: {
        permitNumber: true,
        permitType: true,
        title: true,
        status: true,
        location: true,
        riskLevel: true,
        validFrom: true,
        validTo: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // ── Fetch incidents (project-scoped) ──
    const incidents = await db.incident.findMany({
      where: { projectId, organizationId: dbOrgId },
      select: {
        title: true,
        incidentType: true,
        severity: true,
        status: true,
        incidentDate: true,
        location: true,
        lostDays: true,
        isReportable: true,
      },
      orderBy: { incidentDate: "desc" },
    })

    // ── Fetch checklists (project-scoped) ──
    const checklists = await db.complianceChecklist.findMany({
      where: { projectId, organizationId: dbOrgId },
      select: {
        title: true,
        completionPercentage: true,
        status: true,
        standard: { select: { code: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // ── Fetch CAPAs (project-scoped) ──
    const capas = await db.capa.findMany({
      where: { projectId, organizationId: dbOrgId },
      select: {
        title: true,
        type: true,
        status: true,
        priority: true,
        dueDate: true,
        rootCause: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // ── Fetch vendors (org-wide) ──
    const vendors = await db.vendor.findMany({
      where: { organizationId: dbOrgId },
      select: {
        name: true,
        tier: true,
        beeLevel: true,
        safetyRating: true,
        certifications: {
          select: { expiresAt: true },
        },
      },
      orderBy: { name: "asc" },
    })

    // ── Fetch training records (org-wide, optionally site-scoped) ──
    const trainingRecords = await db.trainingRecord.findMany({
      where: {
        organizationId: dbOrgId,
        ...(project.siteId ? { OR: [{ siteId: project.siteId }, { siteId: null }] } : {}),
      },
      select: {
        title: true,
        category: true,
        status: true,
        trainingDate: true,
        expiryDate: true,
        certificateNumber: true,
        assessmentResult: true,
        trainee: { select: { firstName: true, lastName: true } },
      },
      orderBy: { trainingDate: "desc" },
    })

    // ── Fetch documents (project-scoped) ──
    const documents = await db.document.findMany({
      where: { projectId, organizationId: dbOrgId },
      select: {
        title: true,
        status: true,
        fileType: true,
        classifications: {
          select: {
            standardClause: {
              select: {
                clauseNumber: true,
                standard: { select: { code: true } },
              },
            },
          },
        },
      },
      orderBy: { title: "asc" },
    })

    // ── Compute stats ──
    const now = new Date()
    const totalLostDays = incidents.reduce((sum, i) => sum + (i.lostDays ?? 0), 0)
    const lostTimeInjuries = incidents.filter((i) => i.incidentType === "LOST_TIME").length
    const nearMisses = incidents.filter((i) => i.incidentType === "NEAR_MISS").length
    const fatalities = incidents.filter((i) => i.incidentType === "FATALITY").length
    const reportableIncidents = incidents.filter((i) => i.isReportable).length
    const openCapas = capas.filter((c) => c.status !== "CLOSED").length
    const overdueCapas = capas.filter((c) => c.status === "OVERDUE").length
    const activePermits = permits.filter((p) => p.status === "ACTIVE").length
    const activeObligations = obligations.filter((o) => o.status === "ACTIVE").length
    const expiringObligations = obligations.filter((o) => {
      if (o.status !== "ACTIVE" || !o.expiryDate) return false
      return differenceInDays(new Date(o.expiryDate), now) <= 30
    }).length

    const totalChecklistItems = checklists.length
    const completedChecklists = checklists.filter((cl) => cl.status === "COMPLETED").length
    const overallChecklistCompliance = totalChecklistItems > 0
      ? checklists.reduce((sum, cl) => sum + cl.completionPercentage, 0) / totalChecklistItems
      : 0

    // ── Build PDF props ──
    const pdfElement = React.createElement(SHEFilePDF, {
      organizationName: org?.name ?? "Organisation",
      projectName: project.name,
      projectDescription: project.description ?? undefined,
      projectLocation: project.site ? `${project.site.name} (${project.site.code})` : undefined,
      generatedDate: format(now, "PPP"),
      generatedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "System",

      obligations: obligations.map((o) => ({
        title: o.title,
        obligationType: o.obligationType,
        status: o.status,
        effectiveDate: o.effectiveDate ? format(o.effectiveDate, "PP") : null,
        expiryDate: o.expiryDate ? format(o.expiryDate, "PP") : null,
        vendorName: o.vendor?.name ?? null,
        responsiblePerson: o.responsibleUser ? `${o.responsibleUser.firstName} ${o.responsibleUser.lastName}` : null,
      })),

      members: (org?.members ?? []).map((m) => ({
        name: `${m.user.firstName} ${m.user.lastName}`,
        role: m.role,
        email: m.user.email,
      })),

      assessments: assessments.map((a) => ({
        title: a.title,
        score: a.overallScore,
        riskLevel: a.riskLevel,
        standard: a.standard.code,
        completedDate: a.completedDate ? format(a.completedDate, "PP") : null,
      })),

      permits: permits.map((p) => ({
        permitNumber: p.permitNumber,
        permitType: p.permitType,
        title: p.title,
        status: p.status,
        location: p.location,
        riskLevel: p.riskLevel,
        validFrom: p.validFrom ? format(p.validFrom, "PP") : null,
        validTo: p.validTo ? format(p.validTo, "PP") : null,
      })),

      incidents: incidents.map((i) => ({
        title: i.title,
        incidentType: i.incidentType,
        severity: i.severity,
        status: i.status,
        incidentDate: i.incidentDate ? format(i.incidentDate, "PP") : null,
        location: i.location,
        lostDays: i.lostDays,
        isReportable: i.isReportable,
      })),

      checklists: checklists.map((cl) => ({
        title: cl.title,
        completion: cl.completionPercentage,
        status: cl.status,
        standard: cl.standard.code,
      })),

      capas: capas.map((c) => ({
        title: c.title,
        type: c.type,
        status: c.status,
        priority: c.priority,
        dueDate: c.dueDate ? format(c.dueDate, "PP") : null,
        rootCause: c.rootCause,
      })),

      vendors: vendors.map((v) => ({
        name: v.name,
        tier: v.tier,
        beeLevel: v.beeLevel,
        safetyRating: v.safetyRating,
        certCount: v.certifications.length,
        expiredCerts: v.certifications.filter((c) => c.expiresAt && new Date(c.expiresAt) < now).length,
      })),

      trainingRecords: trainingRecords.map((t) => ({
        title: t.title,
        category: t.category,
        status: t.status,
        traineeName: `${t.trainee.firstName} ${t.trainee.lastName}`,
        trainingDate: t.trainingDate ? format(t.trainingDate, "PP") : null,
        expiryDate: t.expiryDate ? format(t.expiryDate, "PP") : null,
        certificateNumber: t.certificateNumber,
        assessmentResult: t.assessmentResult,
      })),

      documents: documents.map((d) => ({
        title: d.title,
        status: d.status,
        fileType: d.fileType,
        classifications: d.classifications.map((c) => `${c.standardClause.standard.code} §${c.standardClause.clauseNumber}`),
      })),

      stats: {
        totalIncidents: incidents.length,
        lostTimeInjuries,
        totalLostDays,
        nearMisses,
        fatalities,
        reportableIncidents,
        openCapas,
        overdueCapas,
        activePermits,
        activeObligations,
        expiringObligations,
        overallChecklistCompliance,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(pdfElement as any)
    const uint8 = new Uint8Array(buffer)

    const filename = `SHE_File_${project.name.replace(/[^a-zA-Z0-9]/g, "_")}_${format(now, "yyyy-MM-dd")}.pdf`

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    captureError(error, { source: "sheFile.pdf" })
    return NextResponse.json({ error: "Failed to generate SHE File PDF" }, { status: 500 })
  }
}
