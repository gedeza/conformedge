import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { format } from "date-fns"
import React from "react"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { InvestigationReportForm } from "@/lib/pdf/investigation-report"
import { captureError } from "@/lib/error-tracking"

/**
 * GET /api/incidents/[id]/investigation-report
 *
 * Generate a comprehensive Investigation Report PDF from incident data.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbOrgId } = await getAuthContext()
    const { id } = await params

    // Advanced feature gate — investigation reports require Professional+
    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "advancedIncidentManagement")
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.reason ?? "Investigation reports require a Professional plan or higher." },
        { status: 403 }
      )
    }

    const incident = await db.incident.findFirst({
      where: { id, organizationId: dbOrgId },
      include: {
        organization: { select: { name: true, settings: true } },
        project: { select: { name: true } },
        reportedBy: { select: { firstName: true, lastName: true } },
        investigator: { select: { firstName: true, lastName: true } },
        capa: { select: { title: true, status: true, type: true, priority: true } },
        evidence: {
          select: { fileName: true, fileType: true, createdAt: true, uploadedBy: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: "asc" },
        },
        witnessRecords: {
          select: { name: true, contactNumber: true, email: true, statement: true },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    const orgSettings = (incident.organization.settings as Record<string, unknown>) || {}
    const orgAddress = (orgSettings.companyAddress as string) || undefined

    const reporterName = incident.reportedBy
      ? `${incident.reportedBy.firstName} ${incident.reportedBy.lastName}`
      : "Unknown"
    const investigatorName = incident.investigator
      ? `${incident.investigator.firstName} ${incident.investigator.lastName}`
      : undefined
    const incidentRef = `INC-${incident.id.slice(0, 8).toUpperCase()}`
    const reportDate = format(new Date(), "dd MMM yyyy")

    const treatmentLabels: Record<string, string> = {
      NONE: "None",
      FIRST_AID: "First Aid",
      MEDICAL: "Medical Treatment",
      HOSPITALIZED: "Hospitalized",
    }

    const typeLabels: Record<string, string> = {
      NEAR_MISS: "Near Miss",
      FIRST_AID: "First Aid",
      MEDICAL: "Medical Treatment",
      LOST_TIME: "Lost Time Injury",
      FATALITY: "Fatality",
      ENVIRONMENTAL: "Environmental",
      PROPERTY_DAMAGE: "Property Damage",
    }

    const statusLabels: Record<string, string> = {
      REPORTED: "Reported",
      INVESTIGATING: "Under Investigation",
      CORRECTIVE_ACTION: "Corrective Action",
      CLOSED: "Closed",
    }

    const severityLabels: Record<string, string> = {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      CRITICAL: "Critical",
    }

    // Parse contributing factors from JSON
    let contributingFactors: string[] | undefined
    if (incident.contributingFactors) {
      try {
        const cf = incident.contributingFactors as unknown
        contributingFactors = Array.isArray(cf) ? cf as string[] : undefined
      } catch {
        contributingFactors = undefined
      }
    }

    // Parse impact areas from JSON
    let impactAreas: string[] | undefined
    if (incident.impactAreas) {
      try {
        const ia = incident.impactAreas as unknown
        impactAreas = Array.isArray(ia) ? ia as string[] : undefined
      } catch {
        impactAreas = undefined
      }
    }

    // Parse root cause data from JSON
    let rootCauseData: {
      method: string
      category?: string
      whys?: Array<{ question: string; answer: string }>
      rootCause: string
      containmentAction?: string
    } | undefined
    if (incident.rootCauseData) {
      try {
        const rcd = incident.rootCauseData as Record<string, unknown>
        if (rcd.method && rcd.rootCause) {
          rootCauseData = {
            method: rcd.method as string,
            category: rcd.category as string | undefined,
            whys: rcd.whys as Array<{ question: string; answer: string }> | undefined,
            rootCause: rcd.rootCause as string,
            containmentAction: rcd.containmentAction as string | undefined,
          }
        }
      } catch {
        rootCauseData = undefined
      }
    }

    // Build linked CAPAs array (single CAPA relation)
    const linkedCapas = incident.capa
      ? [
          {
            title: incident.capa.title,
            status: incident.capa.status,
            type: incident.capa.type,
            priority: incident.capa.priority,
          },
        ]
      : undefined

    const pdfElement = React.createElement(InvestigationReportForm, {
      orgName: incident.organization.name,
      orgAddress,
      incidentRef,
      title: incident.title,
      description: incident.description || undefined,
      incidentType: typeLabels[incident.incidentType] ?? incident.incidentType,
      status: statusLabels[incident.status] ?? incident.status,
      severity: severityLabels[incident.severity] ?? incident.severity,
      incidentDate: format(incident.incidentDate, "dd MMM yyyy"),
      incidentTime: incident.incidentTime || undefined,
      location: incident.location || undefined,

      // Personnel
      injuredParty: incident.injuredParty || undefined,
      victimOccupation: incident.victimOccupation || undefined,
      victimStaffNo: incident.victimStaffNo || undefined,
      victimDepartment: incident.victimDepartment || undefined,
      victimIdNumber: incident.victimIdNumber || undefined,
      victimNationality: incident.victimNationality || undefined,
      victimContractor: incident.victimContractor || undefined,
      immediateSupervisor: incident.immediateSupervisor || undefined,
      victimDateOfBirth: incident.victimDateOfBirth
        ? format(incident.victimDateOfBirth, "dd MMM yyyy")
        : undefined,

      // Injury
      bodyPartInjured: incident.bodyPartInjured || undefined,
      natureOfInjury: incident.natureOfInjury || undefined,
      treatmentType: incident.treatmentType
        ? (treatmentLabels[incident.treatmentType] ?? incident.treatmentType)
        : undefined,
      treatingDoctor: incident.treatingDoctor || undefined,
      hospitalClinic: incident.hospitalClinic || undefined,
      lostDays: incident.lostDays != null ? String(incident.lostDays) : undefined,
      returnedToWork: incident.returnedToWork != null
        ? (incident.returnedToWork ? "Yes" : "No \u2014 not yet returned")
        : undefined,
      returnedToWorkDate: incident.returnedToWorkDate
        ? format(incident.returnedToWorkDate, "dd MMM yyyy")
        : undefined,

      // Investigation
      immediateAction: incident.immediateAction || undefined,
      rootCause: incident.rootCause || undefined,
      rootCauseData,
      contributingFactors,

      // Witnesses
      witnesses: incident.witnessRecords.length > 0
        ? incident.witnessRecords.map((w) => ({
            name: w.name,
            contactNumber: w.contactNumber || undefined,
            email: w.email || undefined,
            statement: w.statement || undefined,
          }))
        : undefined,

      // Evidence
      evidence: incident.evidence.length > 0
        ? incident.evidence.map((e) => ({
            fileName: e.fileName,
            fileType: e.fileType,
            uploadedAt: format(e.createdAt, "dd MMM yyyy"),
            uploadedBy: `${e.uploadedBy.firstName} ${e.uploadedBy.lastName}`,
          }))
        : undefined,

      // CAPA
      linkedCapas,

      // Regulatory
      isReportable: incident.isReportable,
      mhsaSection: incident.mhsaSection
        ? `Section ${incident.mhsaSection}`
        : undefined,
      reportingDeadline: incident.reportingDeadline
        ? format(incident.reportingDeadline, "dd MMM yyyy")
        : undefined,
      statutoryReportedAt: incident.statutoryReportedAt
        ? format(incident.statutoryReportedAt, "dd MMM yyyy")
        : undefined,

      // Cost
      estimatedCost: incident.estimatedCost != null
        ? `R ${Number(incident.estimatedCost).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
        : undefined,
      impactAreas,

      // Reporter
      reporterName,
      investigatorName,
      reportDate,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(pdfElement as any)
    const uint8 = new Uint8Array(buffer)

    const dateStr = format(incident.incidentDate, "yyyy-MM-dd")
    const filename = `Investigation-Report-${incidentRef}-${dateStr}.pdf`

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    captureError(error, { source: "api.investigationReport" })
    return NextResponse.json({ error: "Failed to generate investigation report" }, { status: 500 })
  }
}
