import { Layers, TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { getIMSDashboardData } from "./actions"
import { IMSDashboardView } from "./ims-dashboard-view"
import { IMSHelpPanel } from "./ims-help-panel"

export default async function IMSDashboardPage() {
  const data = await getIMSDashboardData()

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Integrated Management System"
        description="Cross-standard intelligence — see how your compliance efforts connect across all ISO standards."
      >
        <IMSHelpPanel />
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Standards</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeStandardCount}</div>
            <p className="text-xs text-muted-foreground">
              ISO standards in scope
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Integration Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.integrationScore.efficiencyPercent}%</div>
            <p className="text-xs text-muted-foreground">
              {data.integrationScore.uniqueRequirements} unique of {data.integrationScore.totalClauses} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consolidated Readiness</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.consolidatedReadiness.weightedScore}%</div>
            <p className="text-xs text-muted-foreground">
              Deduplicated: {data.consolidatedReadiness.deduplicatedCoverage}% | Raw: {data.consolidatedReadiness.rawCoverage}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gap Cascades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.gapCascades.length}</div>
            <p className="text-xs text-muted-foreground">
              Gaps affecting multiple standards
            </p>
          </CardContent>
        </Card>
      </div>

      <IMSDashboardView data={data} />
    </div>
  )
}
