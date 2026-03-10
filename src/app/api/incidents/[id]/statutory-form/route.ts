import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { format } from "date-fns"
import React from "react"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { WCl2Form, SAPS277Form } from "@/lib/pdf/statutory-forms"
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

    if (!formType || !["wcl2", "saps277"].includes(formType)) {
      return NextResponse.json({ error: "Invalid form type. Use ?type=wcl2 or ?type=saps277" }, { status: 400 })
    }

    const incident = await db.incident.findFirst({
      where: { id, organizationId: dbOrgId },
      include: {
        organization: { select: { name: true } },
        project: { select: { name: true } },
        reportedBy: { select: { firstName: true, lastName: true } },
        investigator: { select: { firstName: true, lastName: true } },
      },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    const reporterName = incident.reportedBy
      ? `${incident.reportedBy.firstName} ${incident.reportedBy.lastName}`
      : "Unknown"
    const incidentRef = `INC-${incident.id.slice(0, 8).toUpperCase()}`
    const reportDate = format(new Date(), "dd MMM yyyy")

    let pdfElement: React.ReactElement

    if (formType === "wcl2") {
      pdfElement = React.createElement(WCl2Form, {
        employerName: incident.organization.name,
        employeeName: incident.injuredParty || "Not specified",
        incidentTitle: incident.title,
        incidentDate: format(incident.incidentDate, "dd MMM yyyy"),
        location: incident.location || "Not specified",
        description: incident.description || incident.title,
        immediateAction: incident.immediateAction || undefined,
        witnesses: incident.witnesses || undefined,
        causeOfInjury: incident.rootCause || undefined,
        reporterName,
        reportDate,
        incidentRef,
      })
    } else {
      pdfElement = React.createElement(SAPS277Form, {
        deceasedName: incident.injuredParty || "Not specified",
        employerName: incident.organization.name,
        incidentTitle: incident.title,
        incidentDate: format(incident.incidentDate, "dd MMM yyyy"),
        location: incident.location || "Not specified",
        description: incident.description || incident.title,
        circumstances: incident.immediateAction || undefined,
        causeOfDeath: incident.rootCause || undefined,
        witnesses: incident.witnesses || undefined,
        reporterName,
        reportDate,
        incidentRef,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(pdfElement as any)
    const uint8 = new Uint8Array(buffer)

    const dateStr = format(incident.incidentDate, "yyyy-MM-dd")
    const formLabel = formType === "wcl2" ? "WCl2-IOD" : "SAPS277-Fatality"
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
