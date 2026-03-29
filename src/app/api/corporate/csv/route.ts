import { NextResponse } from "next/server"
import { format } from "date-fns"
import { getCorporateDashboardData } from "@/app/(app)/(dashboard)/corporate/actions"

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET() {
  try {
    const data = await getCorporateDashboardData()

    if (!data) {
      return NextResponse.json({ error: "Feature not available" }, { status: 403 })
    }

    const now = new Date()
    const rows: string[] = []

    // Header
    rows.push("Corporate Dashboard Report")
    rows.push(`Generated,${format(now, "yyyy-MM-dd HH:mm")}`)
    rows.push("")

    // Totals
    rows.push("Summary")
    rows.push(`Total Incidents,${data.totals.incidents}`)
    rows.push(`Lost Time Injuries,${data.totals.ltiCount}`)
    rows.push(`LTIFR (Rolling 12-Month),${data.totals.ltifr !== null ? data.totals.ltifr.toFixed(2) : "N/A"}`)
    rows.push(`Open CAPAs,${data.totals.openCapas}`)
    rows.push(`Overdue CAPAs,${data.totals.overdueCapas}`)
    rows.push(`Active Obligations,${data.totals.activeObligations}`)
    rows.push(`Expiring Obligations (30d),${data.totals.expiringObligations}`)
    rows.push(`Avg Checklist Compliance,${data.totals.checklistCompliance > 0 ? `${data.totals.checklistCompliance.toFixed(1)}%` : "N/A"}`)
    rows.push("")

    // Site Comparison
    rows.push("Site Comparison")
    rows.push("Site,Code,Type,Incidents,LTI,LTIFR,Open CAPAs,Overdue CAPAs,Active Permits,Equipment,Compliance %,Active Obligations,Expiring Obligations,Expired Obligations")

    for (const site of data.sites) {
      rows.push([
        escapeCsv(site.siteName),
        escapeCsv(site.siteCode),
        escapeCsv(site.siteType),
        site.incidents,
        site.ltiCount,
        site.ltifr !== null ? site.ltifr.toFixed(2) : "N/A",
        site.openCapas,
        site.overdueCapas,
        site.activePermits,
        site.equipmentCount,
        site.checklistCompliance > 0 ? `${site.checklistCompliance.toFixed(1)}%` : "N/A",
        site.activeObligations,
        site.expiringObligations,
        site.expiredObligations,
      ].join(","))
    }

    rows.push("")

    // Alerts
    if (data.alerts.length > 0) {
      rows.push("Alerts")
      rows.push("Type,Site,Message")
      for (const alert of data.alerts) {
        rows.push(`${alert.type},${escapeCsv(alert.site)},${escapeCsv(alert.message)}`)
      }
    }

    const csv = "\uFEFF" + rows.join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="corporate-dashboard-${format(now, "yyyy-MM-dd")}.csv"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
