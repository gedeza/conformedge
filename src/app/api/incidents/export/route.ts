import { NextRequest, NextResponse } from "next/server"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { db } from "@/lib/db"

// ── CSV helpers ──────────────────────────────────────

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return ""
  return d.toISOString().split("T")[0]
}

function formatUserName(user: { firstName: string | null; lastName: string | null } | null | undefined): string {
  if (!user) return ""
  return [user.firstName, user.lastName].filter(Boolean).join(" ")
}

// ── Column definitions ──────────────────────────────

const CSV_HEADERS = [
  "Incident Ref",
  "Title",
  "Type",
  "Severity",
  "Status",
  "Date",
  "Time",
  "Location",
  "Injured Party",
  "ID Number",
  "Occupation",
  "Staff No",
  "Department",
  "Nationality",
  "Contractor",
  "Supervisor",
  "Date of Birth",
  "Body Part Injured",
  "Nature of Injury",
  "Treatment Type",
  "Treating Doctor",
  "Hospital/Clinic",
  "Days Lost",
  "Estimated Cost (R)",
  "Returned to Work",
  "Return Date",
  "Is Reportable",
  "MHSA Section",
  "Root Cause",
  "Immediate Action",
  "Contributing Factors",
  "Reporter",
  "Investigator",
  "Project",
  "Created At",
]

// ── GET handler ─────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { dbOrgId } = await getAuthContext()

    // Billing gate: advancedIncidentManagement (Professional+)
    const billing = await getBillingContext(dbOrgId)
    const gate = checkFeatureAccess(billing, "advancedIncidentManagement")
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.reason ?? "COIDA export requires a Professional plan or higher." },
        { status: 402 }
      )
    }

    const { searchParams } = request.nextUrl
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    // Parse date range
    const from = fromParam ? new Date(fromParam) : new Date(new Date().getFullYear(), 0, 1) // default: Jan 1 this year
    const to = toParam ? new Date(toParam) : new Date()

    // Ensure 'to' includes the entire day
    const toEnd = new Date(to)
    toEnd.setHours(23, 59, 59, 999)

    const incidents = await db.incident.findMany({
      where: {
        organizationId: dbOrgId,
        incidentDate: {
          gte: from,
          lte: toEnd,
        },
      },
      include: {
        reportedBy: { select: { firstName: true, lastName: true } },
        investigator: { select: { firstName: true, lastName: true } },
        project: { select: { name: true } },
      },
      orderBy: { incidentDate: "asc" },
    })

    // Build CSV rows
    const lines: string[] = []
    lines.push(CSV_HEADERS.map(escapeCsv).join(","))

    for (const inc of incidents) {
      // Parse contributing factors from JSON
      let contributingFactors = ""
      if (inc.contributingFactors) {
        try {
          const factors = inc.contributingFactors as string[]
          contributingFactors = Array.isArray(factors) ? factors.join("; ") : String(factors)
        } catch {
          contributingFactors = String(inc.contributingFactors)
        }
      }

      const row = [
        inc.id.slice(0, 8).toUpperCase(), // short ref
        inc.title,
        inc.incidentType.replace(/_/g, " "),
        inc.severity,
        inc.status.replace(/_/g, " "),
        formatDate(inc.incidentDate),
        inc.incidentTime ?? "",
        inc.location ?? "",
        inc.injuredParty ?? "",
        inc.victimIdNumber ?? "",
        inc.victimOccupation ?? "",
        inc.victimStaffNo ?? "",
        inc.victimDepartment ?? "",
        inc.victimNationality ?? "",
        inc.victimContractor ?? "",
        inc.immediateSupervisor ?? "",
        formatDate(inc.victimDateOfBirth),
        inc.bodyPartInjured ?? "",
        inc.natureOfInjury ?? "",
        inc.treatmentType?.replace(/_/g, " ") ?? "",
        inc.treatingDoctor ?? "",
        inc.hospitalClinic ?? "",
        inc.lostDays !== null ? String(inc.lostDays) : "",
        inc.estimatedCost !== null ? String(inc.estimatedCost) : "",
        inc.returnedToWork !== null ? (inc.returnedToWork ? "Yes" : "No") : "",
        formatDate(inc.returnedToWorkDate),
        inc.isReportable ? "Yes" : "No",
        inc.mhsaSection ? `Section ${inc.mhsaSection}` : "",
        inc.rootCause ?? "",
        inc.immediateAction ?? "",
        contributingFactors,
        formatUserName(inc.reportedBy),
        formatUserName(inc.investigator),
        inc.project?.name ?? "",
        formatDate(inc.createdAt),
      ]

      lines.push(row.map(escapeCsv).join(","))
    }

    const csv = "\uFEFF" + lines.join("\n") // BOM for Excel compatibility

    const fromStr = from.toISOString().split("T")[0]
    const toStr = to.toISOString().split("T")[0]

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="COIDA-Incidents-${fromStr}-to-${toStr}.csv"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed"
    if (message === "Unauthorized" || message === "No organization selected") {
      return NextResponse.json({ error: message }, { status: 401 })
    }
    return NextResponse.json({ error: "Export failed. Please try again." }, { status: 500 })
  }
}
