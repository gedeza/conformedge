import Link from "next/link"
import { Target, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/shared/status-badge"
import { getObjectiveSummary } from "@/app/(app)/(dashboard)/objectives/actions"
import { deriveObjectiveStatus } from "@/lib/objective-status"

export async function ObjectivesWidget() {
  let objectives: Awaited<ReturnType<typeof getObjectiveSummary>> = []

  try {
    objectives = await getObjectiveSummary()
  } catch {
    return null
  }

  if (objectives.length === 0) return null

  const statusCounts = { ON_TRACK: 0, AT_RISK: 0, BEHIND: 0, ACHIEVED: 0 }
  const withDerived = objectives.map((o) => {
    const derived = deriveObjectiveStatus({
      currentValue: o.currentValue,
      targetValue: o.targetValue,
      dueDate: o.dueDate,
      createdAt: o.createdAt,
      status: o.status,
    })
    if (derived in statusCounts) statusCounts[derived as keyof typeof statusCounts]++
    return { ...o, derived }
  })

  const top3 = withDerived.filter((o) => o.derived !== "ACHIEVED").slice(0, 3)

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Objectives</CardTitle>
        <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10">
          <Target className="size-4 text-indigo-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-3">{objectives.length}</div>
        <div className="flex items-center gap-3 mb-3">
          {statusCounts.ON_TRACK > 0 && (
            <div className="flex items-center gap-1">
              <StatusBadge type="objective" value="ON_TRACK" />
              <span className="text-xs font-medium">{statusCounts.ON_TRACK}</span>
            </div>
          )}
          {statusCounts.AT_RISK > 0 && (
            <div className="flex items-center gap-1">
              <StatusBadge type="objective" value="AT_RISK" />
              <span className="text-xs font-medium">{statusCounts.AT_RISK}</span>
            </div>
          )}
          {statusCounts.BEHIND > 0 && (
            <div className="flex items-center gap-1">
              <StatusBadge type="objective" value="BEHIND" />
              <span className="text-xs font-medium">{statusCounts.BEHIND}</span>
            </div>
          )}
          {statusCounts.ACHIEVED > 0 && (
            <div className="flex items-center gap-1">
              <StatusBadge type="objective" value="ACHIEVED" />
              <span className="text-xs font-medium">{statusCounts.ACHIEVED}</span>
            </div>
          )}
        </div>
        {top3.length > 0 && (
          <div className="space-y-2">
            {top3.map((o) => {
              const pct = o.targetValue > 0 ? Math.min((o.currentValue / o.targetValue) * 100, 100) : 0
              return (
                <div key={o.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <Link href={`/objectives/${o.id}`} className="font-medium hover:underline truncate max-w-[160px]">
                      {o.title}
                    </Link>
                    <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              )
            })}
          </div>
        )}
        <div className="mt-3 pt-3 border-t">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link href="/objectives">
              View All Objectives
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
