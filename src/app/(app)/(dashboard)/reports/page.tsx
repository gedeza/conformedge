import {
  FolderKanban,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  Building2,
  TrendingUp,
  Clock,
  FileWarning,
  ShieldAlert,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/page-header"
import { getReportData, getIncidentTrend, getLtifr } from "./actions"
import { parseDateRange } from "./date-utils"
import { ReportChartsLazy as ReportCharts } from "./report-charts-lazy"
import { DateRangeFilter } from "./date-range-filter"
import { ReportExportButtons } from "./report-export-buttons"
import { ReportsHelpPanel } from "./reports-help-panel"
import { IncidentTrendChart } from "@/components/dashboard/incident-trend-chart"
import { LtifrChart } from "@/components/dashboard/ltifr-chart"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams
  const dateRange = parseDateRange(
    params.range as string | undefined,
    params.from as string | undefined,
    params.to as string | undefined
  )

  let data: Awaited<ReturnType<typeof getReportData>>
  let incidentTrend: Awaited<ReturnType<typeof getIncidentTrend>> = []
  let ltifrData: Awaited<ReturnType<typeof getLtifr>> = { monthly: [], rolling12MonthLtifr: null, monthlyHoursWorked: null }

  try {
    ;[data, incidentTrend, ltifrData] = await Promise.all([
      getReportData(dateRange),
      getIncidentTrend(12),
      getLtifr(12),
    ])
  } catch {
    return (
      <div className="space-y-6">
        <PageHeader heading="Reports" description="Compliance analytics and insights" />
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Please select an organization to view reports.
          </CardContent>
        </Card>
      </div>
    )
  }

  const s = data.summary

  const metricCards = [
    { title: "Projects", value: s.totalProjects, icon: FolderKanban, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    { title: "Documents", value: s.totalDocuments, icon: FileText, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    { title: "Assessments", value: s.totalAssessments, icon: ClipboardCheck, iconBg: "bg-landing-cta/10", iconColor: "text-landing-cta" },
    { title: "CAPAs", value: s.totalCapas, icon: AlertTriangle, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
    { title: "Checklists", value: s.totalChecklists, icon: CheckSquare, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
    { title: "Subcontractors", value: s.totalSubcontractors, icon: Building2, iconBg: "bg-slate-500/10", iconColor: "text-slate-500" },
    { title: "Incidents", value: s.totalIncidents, icon: ShieldAlert, iconBg: "bg-red-500/10", iconColor: "text-red-500" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader heading="Reports" description="Compliance analytics and insights">
        <ReportsHelpPanel />
        <ReportExportButtons />
      </PageHeader>

      {/* Date range filter */}
      <DateRangeFilter />

      {/* Summary metrics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {metricCards.map((card) => (
          <Card key={card.title} className="border-border/50 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`flex size-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                <card.icon className={`size-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance score + alerts row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance Score</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {s.avgComplianceScore !== null ? `${s.avgComplianceScore.toFixed(1)}%` : "—"}
            </div>
            <Progress value={s.avgComplianceScore ?? 0} className="h-2 mt-3" />
          </CardContent>
        </Card>
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue CAPAs</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10">
              <Clock className="size-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${s.overdueCapas > 0 ? "text-red-600" : "text-green-600"}`}>
              {s.overdueCapas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {s.overdueCapas > 0 ? "Require immediate attention" : "All CAPAs on track"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Documents</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-orange-500/10">
              <FileWarning className="size-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${s.expiringDocs > 0 ? "text-orange-600" : "text-green-600"}`}>
              {s.expiringDocs}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {s.expiringDocs > 0 ? "Need review or renewal" : "All documents current"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10">
              <ShieldAlert className="size-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${s.openIncidents > 0 ? "text-red-600" : "text-green-600"}`}>
              {s.openIncidents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {s.openIncidents > 0 ? "Reported or under investigation" : "No open incidents"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts — client component */}
      <ReportCharts
        complianceByStandard={data.complianceByStandard}
        capasByStatus={data.capasByStatus}
        capasByPriority={data.capasByPriority}
        documentsByStatus={data.documentsByStatus}
        checklistsByStatus={data.checklistsByStatus}
        riskDistribution={data.riskDistribution}
        monthlyActivity={data.monthlyActivity}
        complianceTrend={data.complianceTrend}
        subcontractorMetrics={data.subcontractorMetrics}
        incidentsByType={data.incidentsByType}
        incidentsBySeverity={data.incidentsBySeverity}
        incidentsByStatus={data.incidentsByStatus}
      />

      {/* ── Incident Trends & LTIFR ── */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Incident Trends &amp; Safety Performance</h2>
        <p className="text-sm text-muted-foreground">Monthly incident breakdown and Lost Time Injury Frequency Rate</p>
      </div>

      <IncidentTrendChart data={incidentTrend} />

      <LtifrChart data={ltifrData} />
    </div>
  )
}
