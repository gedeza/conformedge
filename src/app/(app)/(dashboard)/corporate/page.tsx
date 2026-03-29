import { Building2, AlertTriangle, ShieldCheck, FileCheck2, Siren } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { getCorporateDashboardData } from "./actions"
import { SiteComparisonTable } from "./site-comparison-table"
import { CorporateCharts } from "./corporate-charts"
import { CorporateHelpPanel } from "./corporate-help-panel"

export default async function CorporateDashboardPage() {
  const data = await getCorporateDashboardData()

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Corporate Dashboard" description="Cross-site compliance overview" />
        <EmptyState
          icon={Building2}
          title="Enterprise feature"
          description="The Corporate Dashboard requires the Enterprise plan with Multi-Site Hierarchy enabled. Upgrade to compare compliance, safety, and operational metrics across all your sites."
        />
      </div>
    )
  }

  if (data.sites.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Corporate Dashboard" description="Cross-site compliance overview" />
        <EmptyState
          icon={Building2}
          title="No sites configured"
          description="Create sites in Settings → Multi-Site Hierarchy to enable the corporate dashboard."
        />
      </div>
    )
  }

  const { sites, totals, alerts } = data

  return (
    <div className="space-y-6">
      <PageHeader heading="Corporate Dashboard" description="Cross-site compliance and safety overview">
        <div className="flex items-center gap-2">
        <CorporateHelpPanel />
        <Button variant="outline" size="sm" asChild>
          <a href="/api/corporate/csv" target="_blank" rel="noopener noreferrer">
            Export CSV
          </a>
        </Button>
        </div>
      </PageHeader>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <Siren className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.incidents}</div>
            <p className="text-xs text-muted-foreground">{totals.ltiCount} lost time injuries</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTIFR</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.ltifr !== null ? (totals.ltifr >= 1.0 ? "text-red-600" : totals.ltifr >= 0.5 ? "text-yellow-600" : "text-green-600") : ""}`}>
              {totals.ltifr !== null ? totals.ltifr.toFixed(2) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals.monthlyHoursWorked ? "Rolling 12-month" : "Configure hours in Settings"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obligations</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.activeObligations}</div>
            <p className="text-xs text-muted-foreground">
              {totals.expiringObligations > 0 ? (
                <span className="text-yellow-600">{totals.expiringObligations} expiring within 30d</span>
              ) : (
                "All current"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.checklistCompliance >= 80 ? "text-green-600" : totals.checklistCompliance >= 50 ? "text-yellow-600" : "text-red-600"}`}>
              {totals.checklistCompliance > 0 ? `${totals.checklistCompliance.toFixed(0)}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals.overdueCapas > 0 ? (
                <span className="text-red-600">{totals.overdueCapas} overdue CAPAs</span>
              ) : (
                "Average checklist compliance"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <Card className="border-border/50 border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Badge
                    variant="outline"
                    className={alert.type === "critical" ? "bg-red-50 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}
                  >
                    {alert.site}
                  </Badge>
                  <span className="text-muted-foreground">{alert.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Site Comparison Table ── */}
      <SiteComparisonTable sites={sites} />

      {/* ── Charts ── */}
      <CorporateCharts sites={sites} />
    </div>
  )
}
