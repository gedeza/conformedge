import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getAuthContext } from "@/lib/auth"
import { getObjective } from "../actions"
import { deriveObjectiveStatus } from "@/lib/objective-status"
import { MEASUREMENT_FREQUENCIES } from "@/lib/constants"
import { MeasurementTrendChart } from "./measurement-trend-chart"
import { ObjectiveActionsPanel } from "./objective-actions-panel"

export default async function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let objective: Awaited<ReturnType<typeof getObjective>>
  let role = "VIEWER"

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    objective = await getObjective(id)
    if (!objective) notFound()
  } catch {
    notFound()
  }

  if (!objective) notFound()

  const derivedStatus = deriveObjectiveStatus({
    currentValue: objective.currentValue,
    targetValue: objective.targetValue,
    dueDate: objective.dueDate,
    createdAt: objective.createdAt,
    status: objective.status,
  })

  const progressPct = objective.targetValue > 0
    ? Math.min((objective.currentValue / objective.targetValue) * 100, 100)
    : 0

  const freqLabel = MEASUREMENT_FREQUENCIES[objective.measurementFrequency as keyof typeof MEASUREMENT_FREQUENCIES]?.label ?? objective.measurementFrequency

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/objectives"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      </div>

      <PageHeader heading={objective.title} description={objective.description ?? undefined}>
        <div className="flex items-center gap-2">
          <StatusBadge type="objective" value={derivedStatus} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress card */}
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {objective.currentValue}{objective.unit ? ` ${objective.unit}` : ""} / {objective.targetValue}{objective.unit ? ` ${objective.unit}` : ""}
                </span>
                <span className="font-medium">{progressPct.toFixed(0)}%</span>
              </div>
              <Progress value={progressPct} className="h-3" />
            </CardContent>
          </Card>

          {/* Details card */}
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1"><StatusBadge type="objective" value={derivedStatus} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Measurement Frequency</span>
                  <p className="mt-1 font-medium">{freqLabel}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date</span>
                  <p className="mt-1 font-medium">{objective.dueDate ? format(objective.dueDate, "PPP") : "No deadline"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Owner</span>
                  <p className="mt-1 font-medium">{objective.owner.firstName} {objective.owner.lastName}</p>
                </div>
                {objective.standard && (
                  <div>
                    <span className="text-muted-foreground">ISO Standard</span>
                    <p className="mt-1 font-medium">{objective.standard.code} — {objective.standard.name}</p>
                  </div>
                )}
                {objective.standardClause && (
                  <div>
                    <span className="text-muted-foreground">Clause</span>
                    <p className="mt-1 font-medium">§{objective.standardClause.clauseNumber} — {objective.standardClause.title}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Measurements</span>
                  <p className="mt-1 font-medium">{objective.measurements.length} recorded</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="mt-1 font-medium">{format(objective.createdAt, "PPP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend chart */}
          <MeasurementTrendChart
            measurements={objective.measurements}
            targetValue={objective.targetValue}
            unit={objective.unit}
          />

          {/* Measurement history */}
          {objective.measurements.length > 0 && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Measurement History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {objective.measurements.map((m) => (
                    <div key={m.id} className="flex items-start justify-between border-b last:border-b-0 pb-2 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">
                          {m.value}{objective.unit ? ` ${objective.unit}` : ""}
                        </p>
                        {m.notes && <p className="text-xs text-muted-foreground mt-0.5">{m.notes}</p>}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{format(new Date(m.measuredAt), "MMM d, yyyy")}</p>
                        <p>{m.recordedBy.firstName} {m.recordedBy.lastName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <ObjectiveActionsPanel
            objectiveId={objective.id}
            objectiveStatus={derivedStatus}
            targetValue={objective.targetValue}
            unit={objective.unit}
            role={role}
          />
        </div>
      </div>
    </div>
  )
}
