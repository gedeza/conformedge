import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { getReportData } from "@/app/(dashboard)/reports/actions"
import { parseDateRange } from "@/app/(dashboard)/reports/date-utils"
import { ReportsPDF } from "@/lib/pdf/reports-pdf"
import { getAuthContext } from "@/lib/auth"
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

    const buffer = await renderToBuffer(
      React.createElement(ReportsPDF, {
        organizationName: org?.name ?? "Organization",
        dateRangeLabel,
        generatedDate: format(new Date(), "dd MMMM yyyy"),
        data,
      })
    )

    const date = new Date().toISOString().split("T")[0]

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="conformedge-report-${date}.pdf"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF export failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
