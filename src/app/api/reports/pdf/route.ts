import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React from "react"
import { getReportData } from "@/app/(dashboard)/reports/actions"
import { parseDateRange } from "@/app/(dashboard)/reports/date-utils"
import { ReportsPDF } from "@/lib/pdf/reports-pdf"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { db } from "@/lib/db"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const rangeParam = searchParams.get("range") ?? undefined
    const fromParam = searchParams.get("from") ?? undefined
    const toParam = searchParams.get("to") ?? undefined

    const dateRange = parseDateRange(rangeParam, fromParam, toParam)
    const [data, { dbOrgId }] = await Promise.all([
      getReportData(dateRange),
      getAuthContext(),
    ])

    // Billing: report export requires Professional+
    const billing = await getBillingContext(dbOrgId)
    const gate = checkFeatureAccess(billing, "reportExport")
    if (!gate.allowed) {
      return NextResponse.json({ error: gate.reason }, { status: 402 })
    }

    const org = await db.organization.findUnique({
      where: { id: dbOrgId },
      select: { name: true },
    })

    // Build date range label
    let dateRangeLabel = "All time"
    if (dateRange.from && dateRange.to) {
      dateRangeLabel = `${format(dateRange.from, "dd MMM yyyy")} – ${format(dateRange.to, "dd MMM yyyy")}`
    } else if (dateRange.from) {
      dateRangeLabel = `From ${format(dateRange.from, "dd MMM yyyy")}`
    } else if (dateRange.to) {
      dateRangeLabel = `Until ${format(dateRange.to, "dd MMM yyyy")}`
    }
    if (rangeParam && rangeParam !== "all") {
      const labels: Record<string, string> = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", "ytd": "Year to date" }
      dateRangeLabel = labels[rangeParam] ?? dateRangeLabel
    }

    const element = React.createElement(ReportsPDF, {
      organizationName: org?.name ?? "Organization",
      dateRangeLabel,
      generatedDate: format(new Date(), "dd MMMM yyyy"),
      data,
    })
    const buffer = await renderToBuffer(
      element as unknown as React.ReactElement<DocumentProps>
    )

    const date = new Date().toISOString().split("T")[0]

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="conformedge-report-${date}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "PDF export failed. Please try again." }, { status: 500 })
  }
}
