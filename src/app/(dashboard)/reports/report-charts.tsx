"use client"

import { BarChartCard, PieChartCard, AreaChartCard } from "@/components/dashboard/charts"

interface ReportChartsProps {
  complianceByStandard: Array<{ standard: string; checklistCompletion: number; assessmentScore: number }>
  capasByStatus: Array<{ status: string; count: number }>
  capasByPriority: Array<{ priority: string; count: number }>
  documentsByStatus: Array<{ status: string; count: number }>
  checklistsByStatus: Array<{ status: string; count: number }>
  riskDistribution: Array<{ level: string; count: number }>
  monthlyActivity: Array<{ month: string; events: number }>
}

export function ReportCharts({
  complianceByStandard,
  capasByStatus,
  capasByPriority,
  documentsByStatus,
  checklistsByStatus,
  riskDistribution,
  monthlyActivity,
}: ReportChartsProps) {
  return (
    <>
      {/* Compliance by Standard */}
      <BarChartCard
        title="Compliance by ISO Standard"
        description="Average checklist completion and assessment scores per standard"
        data={complianceByStandard}
        xKey="standard"
        bars={[
          { key: "checklistCompletion", color: "hsl(215, 70%, 45%)", label: "Checklist %" },
          { key: "assessmentScore", color: "hsl(160, 60%, 40%)", label: "Assessment %" },
        ]}
      />

      {/* CAPA + Document charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        <PieChartCard
          title="CAPA Status Distribution"
          description="Current status of all corrective and preventive actions"
          data={capasByStatus.map((c) => ({ name: c.status, value: c.count }))}
        />
        <PieChartCard
          title="CAPA Priority Distribution"
          description="Priority levels across all CAPAs"
          data={capasByPriority.map((c) => ({ name: c.priority, value: c.count }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PieChartCard
          title="Document Status"
          description="Distribution of document lifecycle stages"
          data={documentsByStatus.map((d) => ({ name: d.status, value: d.count }))}
        />
        <PieChartCard
          title="Checklist Progress"
          description="Completion status of compliance checklists"
          data={checklistsByStatus.map((c) => ({ name: c.status, value: c.count }))}
        />
      </div>

      {/* Risk + Activity row */}
      <div className="grid gap-4 md:grid-cols-2">
        <PieChartCard
          title="Assessment Risk Distribution"
          description="Risk levels from completed assessments"
          data={riskDistribution.map((r) => ({ name: r.level, value: r.count }))}
        />
        <AreaChartCard
          title="Activity Trend"
          description="System activity over the last 6 months"
          data={monthlyActivity}
          xKey="month"
          yKey="events"
        />
      </div>
    </>
  )
}
