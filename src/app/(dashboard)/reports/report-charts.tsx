"use client"

import { BarChartCard, PieChartCard, AreaChartCard, LineChartCard } from "@/components/dashboard/charts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { ReportData } from "./actions"

interface ReportChartsProps {
  complianceByStandard: ReportData["complianceByStandard"]
  capasByStatus: ReportData["capasByStatus"]
  capasByPriority: ReportData["capasByPriority"]
  documentsByStatus: ReportData["documentsByStatus"]
  checklistsByStatus: ReportData["checklistsByStatus"]
  riskDistribution: ReportData["riskDistribution"]
  monthlyActivity: ReportData["monthlyActivity"]
  complianceTrend: ReportData["complianceTrend"]
  subcontractorMetrics: ReportData["subcontractorMetrics"]
}

function expiryBadgeVariant(days: number): "destructive" | "secondary" | "outline" | "default" {
  if (days < 14) return "destructive"
  if (days < 30) return "secondary"
  if (days < 60) return "outline"
  return "default"
}

function expiryBadgeClass(days: number): string {
  if (days < 14) return ""
  if (days < 30) return "bg-orange-100 text-orange-700 border-orange-200"
  if (days < 60) return "bg-yellow-100 text-yellow-700 border-yellow-200"
  return "bg-green-100 text-green-700 border-green-200"
}

const TIER_COLORS: Record<string, string> = {
  PLATINUM: "bg-purple-100 text-purple-700",
  GOLD: "bg-yellow-100 text-yellow-700",
  SILVER: "bg-gray-100 text-gray-700",
  BRONZE: "bg-orange-100 text-orange-700",
  UNRATED: "bg-gray-50 text-gray-500",
}

export function ReportCharts({
  complianceByStandard,
  capasByStatus,
  capasByPriority,
  documentsByStatus,
  checklistsByStatus,
  riskDistribution,
  monthlyActivity,
  complianceTrend,
  subcontractorMetrics,
}: ReportChartsProps) {
  return (
    <>
      {/* Compliance Trend Over Time */}
      <LineChartCard
        title="Compliance Trend"
        description="Monthly average assessment scores and checklist completion (last 12 months)"
        data={complianceTrend}
        xKey="month"
        lines={[
          { key: "assessmentScore", color: "hsl(215, 70%, 45%)", label: "Assessment Score %" },
          { key: "checklistCompletion", color: "hsl(160, 60%, 40%)", label: "Checklist Completion %" },
        ]}
      />

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

      {/* ── Subcontractor Metrics Section ── */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Subcontractor Metrics</h2>
        <p className="text-sm text-muted-foreground">BEE levels, certification expiry, and compliance scoring</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* BEE Level Distribution */}
        <BarChartCard
          title="BEE Level Distribution"
          description="Broad-Based Black Economic Empowerment levels"
          data={subcontractorMetrics.beeDistribution}
          xKey="level"
          bars={[{ key: "count", color: "hsl(215, 70%, 45%)", label: "Subcontractors" }]}
        />

        {/* Tier Distribution (reuse existing data) */}
        <PieChartCard
          title="Compliance Tier Distribution"
          description="Subcontractor compliance tiers based on scoring"
          data={
            subcontractorMetrics.scoredSubcontractors.length > 0
              ? Object.entries(
                  subcontractorMetrics.scoredSubcontractors.reduce<Record<string, number>>(
                    (acc, s) => {
                      acc[s.tier] = (acc[s.tier] ?? 0) + 1
                      return acc
                    },
                    {}
                  )
                ).map(([name, value]) => ({ name, value }))
              : []
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Cert Expiry Countdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certification Expiry Countdown</CardTitle>
            <CardDescription>Certifications expiring within the next 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            {subcontractorMetrics.certExpiryCountdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No certifications expiring in the next 90 days
              </p>
            ) : (
              <div className="space-y-3">
                {subcontractorMetrics.certExpiryCountdown.map((cert, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{cert.subcontractorName}</p>
                      <p className="text-xs text-muted-foreground truncate">{cert.certName}</p>
                    </div>
                    <Badge
                      variant={expiryBadgeVariant(cert.daysUntilExpiry)}
                      className={expiryBadgeClass(cert.daysUntilExpiry)}
                    >
                      {cert.daysUntilExpiry}d
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Score Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Score Rankings</CardTitle>
            <CardDescription>Top subcontractors by compliance score</CardDescription>
          </CardHeader>
          <CardContent>
            {subcontractorMetrics.scoredSubcontractors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No subcontractors to score
              </p>
            ) : (
              <div className="space-y-3">
                {subcontractorMetrics.scoredSubcontractors.map((sub, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{sub.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{sub.score}%</span>
                        <Badge variant="outline" className={TIER_COLORS[sub.tier] ?? ""}>
                          {sub.tier}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={sub.score} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
