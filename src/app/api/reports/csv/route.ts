import { NextRequest, NextResponse } from "next/server"
import { getReportData } from "@/app/(dashboard)/reports/actions"
import { parseDateRange } from "@/app/(dashboard)/reports/date-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const dateRange = parseDateRange(
      searchParams.get("range") ?? undefined,
      searchParams.get("from") ?? undefined,
      searchParams.get("to") ?? undefined
    )

    const data = await getReportData(dateRange)
    const s = data.summary

    const lines: string[] = []

    // Summary section
    lines.push("CONFORMEDGE COMPLIANCE REPORT")
    lines.push(`Generated,${new Date().toISOString()}`)
    if (dateRange.from) lines.push(`From,${dateRange.from.toISOString().split("T")[0]}`)
    if (dateRange.to) lines.push(`To,${dateRange.to.toISOString().split("T")[0]}`)
    lines.push("")

    lines.push("SUMMARY")
    lines.push("Metric,Value")
    lines.push(`Projects,${s.totalProjects}`)
    lines.push(`Documents,${s.totalDocuments}`)
    lines.push(`Assessments,${s.totalAssessments}`)
    lines.push(`CAPAs,${s.totalCapas}`)
    lines.push(`Checklists,${s.totalChecklists}`)
    lines.push(`Subcontractors,${s.totalSubcontractors}`)
    lines.push(`Avg Compliance Score,${s.avgComplianceScore !== null ? s.avgComplianceScore.toFixed(1) : "N/A"}`)
    lines.push(`Overdue CAPAs,${s.overdueCapas}`)
    lines.push(`Expired Documents,${s.expiringDocs}`)
    lines.push("")

    // Compliance by Standard
    lines.push("COMPLIANCE BY STANDARD")
    lines.push("Standard,Checklist Completion %,Assessment Score %")
    for (const row of data.complianceByStandard) {
      lines.push(`${row.standard},${row.checklistCompletion},${row.assessmentScore}`)
    }
    lines.push("")

    // CAPA Status
    lines.push("CAPA STATUS")
    lines.push("Status,Count")
    for (const row of data.capasByStatus) {
      lines.push(`${row.status},${row.count}`)
    }
    lines.push("")

    // CAPA Priority
    lines.push("CAPA PRIORITY")
    lines.push("Priority,Count")
    for (const row of data.capasByPriority) {
      lines.push(`${row.priority},${row.count}`)
    }
    lines.push("")

    // Document Status
    lines.push("DOCUMENT STATUS")
    lines.push("Status,Count")
    for (const row of data.documentsByStatus) {
      lines.push(`${row.status},${row.count}`)
    }
    lines.push("")

    // Risk Distribution
    lines.push("RISK DISTRIBUTION")
    lines.push("Level,Count")
    for (const row of data.riskDistribution) {
      lines.push(`${row.level},${row.count}`)
    }
    lines.push("")

    // Compliance Trend
    lines.push("COMPLIANCE TREND (LAST 12 MONTHS)")
    lines.push("Month,Assessment Score %,Checklist Completion %")
    for (const row of data.complianceTrend) {
      lines.push(`${row.month},${row.assessmentScore ?? ""},${row.checklistCompletion ?? ""}`)
    }
    lines.push("")

    // Subcontractor Metrics
    lines.push("SUBCONTRACTOR BEE DISTRIBUTION")
    lines.push("BEE Level,Count")
    for (const row of data.subcontractorMetrics.beeDistribution) {
      lines.push(`${row.level},${row.count}`)
    }
    lines.push("")

    lines.push("SUBCONTRACTOR COMPLIANCE SCORES")
    lines.push("Name,Score,Tier")
    for (const row of data.subcontractorMetrics.scoredSubcontractors) {
      lines.push(`"${row.name}",${row.score},${row.tier}`)
    }
    lines.push("")

    lines.push("CERTIFICATION EXPIRY (NEXT 90 DAYS)")
    lines.push("Subcontractor,Certification,Expires,Days Until Expiry")
    for (const row of data.subcontractorMetrics.certExpiryCountdown) {
      lines.push(`"${row.subcontractorName}","${row.certName}",${row.expiresAt},${row.daysUntilExpiry}`)
    }
    lines.push("")

    // Monthly Activity
    lines.push("MONTHLY ACTIVITY")
    lines.push("Month,Events")
    for (const row of data.monthlyActivity) {
      lines.push(`${row.month},${row.events}`)
    }

    const csv = lines.join("\n")
    const date = new Date().toISOString().split("T")[0]

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="conformedge-report-${date}.csv"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
