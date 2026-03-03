import { Layers, TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { UpgradePrompt } from "@/components/billing/upgrade-prompt"
import { getIMSDashboardData } from "./actions"
import { IMSDashboardView } from "./ims-dashboard-view"
import { IMSHelpPanel } from "./ims-help-panel"

export default async function IMSDashboardPage() {
  const data = await getIMSDashboardData()

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Integrated Management System"
          description="Cross-standard intelligence — see how your compliance efforts connect across all ISO standards."
        >
          <IMSHelpPanel />
        </PageHeader>
        <UpgradePrompt
          feature="Integrated Management System"
          message="IMS cross-standard intelligence is available on Professional and Enterprise plans. Upgrade to see how your compliance efforts connect across all ISO standards."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Integrated Management System"
        description="Cross-standard intelligence — see how your compliance efforts connect across all ISO standards."
      >
        <IMSHelpPanel />
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Standards</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10">
              <Layers className="size-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeStandardCount}</div>
            <p className="text-xs text-muted-foreground">
              ISO standards in scope
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Integration Efficiency</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.integrationScore.efficiencyPercent}%</div>
            <p className="text-xs text-muted-foreground">
              {data.integrationScore.uniqueRequirements} unique of {data.integrationScore.totalClauses} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consolidated Readiness</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-green-500/10">
              <ShieldCheck className="size-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.consolidatedReadiness.weightedScore}%</div>
            <p className="text-xs text-muted-foreground">
              Deduplicated: {data.consolidatedReadiness.deduplicatedCoverage}% | Raw: {data.consolidatedReadiness.rawCoverage}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gap Cascades</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="size-4 text-amber-500" />
            </div>
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
