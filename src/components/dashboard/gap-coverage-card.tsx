import Link from "next/link"
import { SearchCheck, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getGapSummaryForDashboard } from "@/lib/gap-detection"
import { getAuthContext } from "@/lib/auth"

export async function GapCoverageCard() {
  let summary: Awaited<ReturnType<typeof getGapSummaryForDashboard>> | null = null

  try {
    const { dbOrgId } = await getAuthContext()
    summary = await getGapSummaryForDashboard(dbOrgId)
  } catch {
    return null
  }

  if (!summary || summary.totalClauses === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Gap Coverage</CardTitle>
          <SearchCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No standards data available. Seed ISO standards to see gap coverage.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Gap Coverage</CardTitle>
        <SearchCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall</span>
            <span className="font-medium">{summary.overallCoveragePercent}%</span>
          </div>
          <Progress value={summary.overallCoveragePercent} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">
            {summary.totalGaps} gap{summary.totalGaps !== 1 ? "s" : ""} across {summary.totalClauses} clauses
          </p>
        </div>

        <div className="space-y-2">
          {summary.standards.map((std) => (
            <div key={std.code} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{std.code}</span>
                <span className="text-muted-foreground">
                  {std.coveragePercent}% · {std.gaps} gap{std.gaps !== 1 ? "s" : ""}
                </span>
              </div>
              <Progress value={std.coveragePercent} className="h-1.5" />
            </div>
          ))}
        </div>

        <Link
          href="/gap-analysis"
          className="inline-flex items-center text-xs text-primary hover:underline"
        >
          View gap analysis <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  )
}
