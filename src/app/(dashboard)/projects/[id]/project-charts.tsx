"use client"

import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChartCard, PieChartCard, BarChartCard } from "@/components/dashboard/charts"
import type { ProjectChartData } from "../actions"

interface ProjectChartsProps {
  data: ProjectChartData
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-")
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" })
}

function formatAction(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ProjectCharts({ data }: ProjectChartsProps) {
  const trendData = data.complianceTrend.map((d) => ({
    month: formatMonth(d.month),
    "Assessment Score": d.assessmentScore,
    "Checklist %": d.checklistCompletion,
  }))

  const hasChartData =
    data.documentsByStatus.length > 0 ||
    data.capasByStatus.length > 0 ||
    data.capasByPriority.some((d) => d.value > 0) ||
    data.complianceTrend.some((d) => d.assessmentScore !== null || d.checklistCompletion !== null)

  if (!hasChartData && data.recentActivity.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Compliance Trend */}
      <LineChartCard
        title="Compliance Trend"
        description="Monthly assessment scores and checklist completion (last 12 months)"
        data={trendData}
        xKey="month"
        lines={[
          { key: "Assessment Score", color: "hsl(215, 70%, 45%)", label: "Assessment Score" },
          { key: "Checklist %", color: "hsl(160, 60%, 40%)", label: "Checklist Completion %" },
        ]}
      />

      {/* Status Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PieChartCard
          title="Documents by Status"
          data={data.documentsByStatus}
        />
        <PieChartCard
          title="CAPAs by Status"
          data={data.capasByStatus}
        />
        <BarChartCard
          title="CAPAs by Priority"
          data={data.capasByPriority}
          xKey="name"
          bars={[
            { key: "value", color: "hsl(215, 70%, 45%)", label: "Count" },
          ]}
        />
      </div>

      {/* Recent Activity */}
      {data.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.map((event) => (
                <div key={event.id} className="flex items-start justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {event.entityType}
                    </Badge>
                    <span className="font-medium truncate">
                      {formatAction(event.action)}
                    </span>
                    {event.user && (
                      <span className="text-muted-foreground truncate">
                        by {event.user.firstName} {event.user.lastName}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
