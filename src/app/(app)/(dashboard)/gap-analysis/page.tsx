import { SearchCheck, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/page-header"
import { UpgradePrompt } from "@/components/billing/upgrade-prompt"
import { getGapAnalysis, getStandardOptions, getProjectOptions } from "./actions"
import { GapAnalysisView } from "./gap-analysis-view"
import { GapAnalysisHelpPanel } from "./gap-analysis-help-panel"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function GapAnalysisPage({ searchParams }: Props) {
  const params = await searchParams
  const standardCode = (params.standard as string) || undefined
  const projectId = (params.project as string) || undefined

  const [data, standards, projects] = await Promise.all([
    getGapAnalysis(standardCode, projectId),
    getStandardOptions(),
    getProjectOptions(),
  ])

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Gap Analysis"
          description="ISO clause coverage across your organization"
        >
          <GapAnalysisHelpPanel />
        </PageHeader>
        <UpgradePrompt
          feature="Gap Analysis"
          message="Gap analysis is available on Professional and Enterprise plans. Upgrade to identify ISO clause coverage gaps across your organization."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Gap Analysis"
        description="ISO clause coverage across your organization"
      >
        <GapAnalysisHelpPanel />
      </PageHeader>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clauses</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-landing-accent/10">
              <SearchCheck className="size-4 text-landing-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSubClauses}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evidence Mapped</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-green-600/10">
              <ShieldCheck className="size-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.covered + data.partial}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="size-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{data.partial}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gaps</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-600/10">
              <ShieldAlert className="size-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.gaps}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall coverage bar */}
      <Card className="border-border/50 transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.covered + data.partial} of {data.totalSubClauses} clauses with evidence
            </span>
            <span className="font-semibold">{data.overallCoveragePercent}%</span>
          </div>
          <Progress value={data.overallCoveragePercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Client component with filters + expandable standard cards */}
      <GapAnalysisView
        data={data}
        standards={standards}
        projects={projects}
        currentStandard={standardCode}
        currentProject={projectId}
      />
    </div>
  )
}
