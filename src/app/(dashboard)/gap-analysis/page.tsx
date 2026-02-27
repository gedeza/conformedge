import { SearchCheck, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/page-header"
import { getGapAnalysis, getStandardOptions, getProjectOptions } from "./actions"
import { GapAnalysisView } from "./gap-analysis-view"

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

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Gap Analysis"
        description="ISO clause coverage across your organization"
      >
        <SearchCheck className="h-5 w-5 text-muted-foreground" />
      </PageHeader>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clauses</CardTitle>
            <SearchCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSubClauses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Covered</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.covered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{data.partial}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gaps</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.gaps}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall coverage bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.covered} of {data.totalSubClauses} clauses fully covered
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
