import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { format } from "date-fns"
import React from "react"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { WCl2Form, SAPS277Form, MHSA11Form, MHSA23Form, MHSA24Form } from "@/lib/pdf/statutory-forms"
import { captureError } from "@/lib/error-tracking"

/**
 * GET /api/incidents/[id]/statutory-form?type=wcl2|saps277
 *
 * Generate SA statutory form PDF pre-filled from incident data.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbOrgId } = await getAuthContext()
    const { id } = await params
    const formType = request.nextUrl.searchParams.get("type")

    // Advanced feature gate — statutory forms require Professional+
    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "advancedIncidentManagement")
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason ?? "Statutory forms require a Professional plan or higher." }, { status: 403 })
    }

    if (!formType || !["wcl2", "saps277", "mhsa11", "mhsa23", "mhsa24"].includes(formType)) {
      return NextResponse.json({ error: "Invalid form type. Use ?type=wcl2, saps277, mhsa11, mhsa23, or mhsa24" }, { status: 400 })
    }

    const incident = await db.incident.findFirst({
      where: { id, organizationId: dbOrgId },
      include: {
        organization: { select: { name: true, settings: true } },
        project: { select: { name: true } },
        reportedBy: { select: { firstName: true, lastName: true } },
        investigator: { select: { firstName: true, lastName: true } },
      },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    const orgSettings = (incident.organization.settings as Record<string, unknown>) || {}
    const coidaRegNumber = (orgSettings.coidaRegNumber as string) || undefined
    const employerAddress = (orgSettings.companyAddress as string) || undefined
    const mineRegistrationNumber = (orgSettings.mineRegistrationNumber as string) || undefined
    const chiefInspectorContact = (orgSettings.chiefInspectorContact as string) || undefined

    const reporterName = incident.reportedBy
      ? `${incident.reportedBy.firstName} ${incident.reportedBy.lastName}`
      : "Unknown"
    const incidentRef = `INC-${incident.id.slice(0, 8).toUpperCase()}`
    const reportDate = format(new Date(), "dd MMM yyyy")

    let pdfElement: React.ReactElement

    const treatmentLabels: Record<string, string> = {
      NONE: "None",
      FIRST_AID: "First Aid",
      MEDICAL: "Medical Treatment",
      HOSPITALIZED: "Hospitalized",
    }

    if (formType === "wcl2") {
      pdfElement = React.createElement(WCl2Form, {
        employerName: incident.organization.name,
        employerAddress,
        coidaRegNumber,
        employeeName: incident.injuredParty || "Not specified",
        employeeIdNumber: incident.victimIdNumber || undefined,
        employeeOccupation: incident.victimOccupation || undefined,
        employeeStaffNo: incident.victimStaffNo || undefined,
        employeeDepartment: incident.victimDepartment || undefined,
        employeeNationality: incident.victimNationality || undefined,
        employeeContractor: incident.victimContractor || undefined,
        employeeDateOfBirth: incident.victimDateOfBirth ? format(incident.victimDateOfBirth, "dd MMM yyyy") : undefined,
        supervisorName: incident.immediateSupervisor || undefined,
        incidentTitle: incident.title,
        incidentDate: format(incident.incidentDate, "dd MMM yyyy"),
        incidentTime: incident.incidentTime || undefined,
        location: incident.location || "Not specified",
        description: incident.description || incident.title,
        bodyPartInjured: incident.bodyPartInjured || undefined,
        natureOfInjury: incident.natureOfInjury || undefined,
        causeOfInjury: incident.rootCause || undefined,
        immediateAction: incident.immediateAction || undefined,
        witnesses: incident.witnesses || undefined,
        daysAbsent: incident.lostDays != null ? String(incident.lostDays) : undefined,
        treatingDoctor: incident.treatingDoctor || undefined,
        hospitalClinic: incident.hospitalClinic || undefined,
        treatmentType: incident.treatmentType ? (treatmentLabels[incident.treatmentType] ?? incident.treatmentType) : undefined,
        estimatedCost: incident.estimatedCost != null ? `R ${Number(incident.estimatedCost).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : undefined,
        returnedToWork: incident.returnedToWork != null ? (incident.returnedToWork ? "Yes" : "No — not yet returned") : undefined,
        returnedToWorkDate: incident.returnedToWorkDate ? format(incident.returnedToWorkDate, "dd MMM yyyy") : undefined,
        reporterName,
        reportDate,
        incidentRef,
      })
    } else if (formType === "saps277") {
      pdfElement = React.createElement(SAPS277Form, {
        deceasedName: incident.injuredParty || "Not specified",
        deceasedIdNumber: incident.victimIdNumber || undefined,
        deceasedOccupation: incident.victimOccupation || undefined,
        employerName: incident.organization.name,
        incidentTitle: incident.title,
        incidentDate: format(incident.incidentDate, "dd MMM yyyy"),
        incidentTime: incident.incidentTime || undefined,
        location: incident.location || "Not specified",
        description: incident.description || incident.title,
        circumstances: incident.immediateAction || undefined,
        causeOfDeath: incident.rootCause || undefined,
        witnesses: incident.witnesses || undefined,
        reporterName,
        reportDate,
        incidentRef,
      })
    } else if (formType === "mhsa11") {
      const investigatorName = incident.investigator
        ? `${incident.investigator.firstName} ${incident.investigator.lastName}`
        : undefined
      pdfElement = React.createElement(MHSA11Form, {
        employerName: incident.organization.name,
        mineRegistrationNumber,
        employerAddress,
        chiefInspectorContact,
        employeeName: incident.injuredParty || "Not specified",
        employeeIdNumber: incident.victimIdNumber || undefined,
        employeeOccupation: incident.victimOccupation || undefined,
        employeeDateOfBirth: incident.victimDateOfBirth ? format(incident.victimDateOfBirth, "dd MMM yyyy") : undefined,
        employeeContractor: incident.victimContractor || undefined,
        incidentTitle: incident.title,
        incidentDate: format(incident.incidentDate, "dd MMM yyyy"),
        incidentTime: incident.incidentTime || undefined,
        location: incident.location || "Not specified",
        description: incident.description || incident.title,
        bodyPartInjured: incident.bodyPartInjured || undefined,
        natureOfInjury: incident.natureOfInjury || undefined,
        treatmentType: incident.treatmentType ? (treatmentLabels[incident.treatmentType] ?? incident.treatmentType) : undefined,
        immediateAction: incident.immediateAction || undefined,
        witnesses: incident.witnesses || undefined,
        preliminaryCause: incident.rootCause || undefined,
        notificationDateTime: incident.statutoryReportedAt ? format(incident.statutoryReportedAt, "dd MMM yyyy HH:mm") : undefined,
        reporterName,
        safetyOfficerName: investigatorName,
        reportDate,
        incidentRef,
      })
    } else if (formType === "mhsa23") {
      const investigatorName = incident.investigator
        ? `${incident.investigator.firstName} ${incident.investigator.lastName}`
        : undefined
      pdfElement = React.createElement(MHSA23Form, {
        employerName: incident.organization.name,
        mineRegistrationNumber,
        employerAddress,
        chiefInspectorContact,
        incidentTitle: incident.title,
        incidentDate: format(incident.incidentDate, "dd MMM yyyy"),
        incidentTime: incident.incidentTime || undefined,
        location: incident.location || "Not specified",
        category: incident.nonInjuriousType || undefined,
        description: incident.description || incident.title,
        propertyDamage: incident.estimatedCost != null ? `Estimated R ${Number(incident.estimatedCost).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : undefined,
        immediateAction: incident.immediateAction || undefined,
        preliminaryCause: incident.rootCause || undefined,
        correctiveActions: undefined, // filled post-investigation
        reporterName,
        safetyOfficerName: investigatorName,
        reportDate,
        incidentRef,
      })
    } else {
      // mhsa24
      const investigatorName = incident.investigator
        ? `${incident.investigator.firstName} ${incident.investigator.lastName}`
        : undefined
      pdfElement = React.createElement(MHSA24Form, {
        employerName: incident.organization.name,
        mineRegistrationNumber,
        employerAddress,
        chiefInspectorContact,
        employeeName: incident.injuredParty || "Not specified",
        employeeIdNumber: incident.victimIdNumber || undefined,
        employeeOccupation: incident.victimOccupation || undefined,
        employeeDateOfBirth: incident.victimDateOfBirth ? format(incident.victimDateOfBirth, "dd MMM yyyy") : undefined,
        diseaseClassification: incident.natureOfInjury || undefined,
        currentHealthStatus: incident.description || undefined,
        treatmentDetails: incident.treatmentType ? (treatmentLabels[incident.treatmentType] ?? incident.treatmentType) : undefined,
        reporterName,
        safetyOfficerName: investigatorName,
        reportDate,
        incidentRef,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(pdfElement as any)
    const uint8 = new Uint8Array(buffer)

    const dateStr = format(incident.incidentDate, "yyyy-MM-dd")
    const formLabels: Record<string, string> = {
      wcl2: "WCl2-IOD",
      saps277: "SAPS277-Fatality",
      mhsa11: "MHSA-S11-Accident",
      mhsa23: "MHSA-S23-DangerousOccurrence",
      mhsa24: "MHSA-S24-OccupationalDisease",
    }
    const formLabel = formLabels[formType] || formType
    const filename = `${formLabel}-${incidentRef}-${dateStr}.pdf`

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    captureError(error, { source: "api.statutoryForm" })
    return NextResponse.json({ error: "Failed to generate statutory form" }, { status: 500 })
  }
}
