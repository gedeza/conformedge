import {
  FolderKanban,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  HardHat,
  TrendingUp,
  Clock,
  FileWarning,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/page-header"
import { getReportData } from "./actions"
import { ReportCharts } from "./report-charts"

export default async function ReportsPage() {
  const data = await getReportData()
  const s = data.summary

  const metricCards = [
    { title: "Projects", value: s.totalProjects, icon: FolderKanban },
    { title: "Documents", value: s.totalDocuments, icon: FileText },
    { title: "Assessments", value: s.totalAssessments, icon: ClipboardCheck },
    { title: "CAPAs", value: s.totalCapas, icon: AlertTriangle },
    { title: "Checklists", value: s.totalChecklists, icon: CheckSquare },
    { title: "Subcontractors", value: s.totalSubcontractors, icon: HardHat },
  ]

  return (
    <div className="space-y-6">
      <PageHeader heading="Reports" description="Compliance analytics and insights" />

      {/* Summary metrics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {metricCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance score + alerts row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {s.avgComplianceScore !== null ? `${s.avgComplianceScore.toFixed(1)}%` : "—"}
            </div>
            <Progress value={s.avgComplianceScore ?? 0} className="h-2 mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue CAPAs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Documents</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
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
      />
    </div>
  )
}
