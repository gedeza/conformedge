import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, TrendingUp, AlertTriangle, Activity } from "lucide-react"
import { getPartnerInsightsData } from "./actions"
import { InsightsHelpPanel } from "./insights-help-panel"
import { AlertsPanel } from "./alerts-panel"
import { ScoreRecalcButton } from "./score-recalc-button"

function getRiskColor(risk: string) {
  switch (risk) {
    case "LOW": return "bg-green-100 text-green-800 border-green-200"
    case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200"
    case "CRITICAL": return "bg-red-100 text-red-800 border-red-200"
    default: return "bg-gray-100 text-gray-800"
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  if (score >= 40) return "text-orange-600"
  return "text-red-600"
}

export default async function PartnerInsightsPage() {
  const data = await getPartnerInsightsData()
  const { latestScore, openAlerts, scoreHistory, partner } = data

  const totalUsers = latestScore?.totalUsers ?? 0
  const activeUsers = latestScore?.activeUsers ?? 0
  const overallScore = latestScore?.overallScore ?? 0
  const riskLevel = latestScore?.riskLevel ?? "LOW"
  const totalRevenue = latestScore?.totalRevenueCents ?? 0

  return (
    <div className="space-y-6">
      <PageHeader heading="Partner Compliance Monitor" description="Track partner health, user activity, and behavioral compliance">
        <InsightsHelpPanel />
        <ScoreRecalcButton />
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Health Score</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
              <span className="text-xs text-muted-foreground">/100</span>
              <Badge variant="outline" className={`ml-auto text-[10px] ${getRiskColor(riskLevel)}`}>
                {riskLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">User Activity</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{activeUsers}</span>
              <span className="text-xs text-muted-foreground">/ {totalUsers} active</span>
            </div>
            {totalUsers > 0 && (
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.round((activeUsers / totalUsers) * 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Open Alerts</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${openAlerts.length > 0 ? "text-orange-600" : "text-green-600"}`}>
                {openAlerts.length}
              </span>
              {openAlerts.filter(a => a.severity === "HIGH" || a.severity === "CRITICAL").length > 0 && (
                <span className="text-xs text-red-600">
                  {openAlerts.filter(a => a.severity === "HIGH" || a.severity === "CRITICAL").length} critical
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Monthly Revenue</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                R{(totalRevenue / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}
              </span>
              {latestScore?.revenueGrowthPercent != null && latestScore.revenueGrowthPercent !== 0 && (
                <span className={`text-xs ${latestScore.revenueGrowthPercent > 0 ? "text-green-600" : "text-red-600"}`}>
                  {latestScore.revenueGrowthPercent > 0 ? "+" : ""}{latestScore.revenueGrowthPercent.toFixed(0)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      {openAlerts.length > 0 && (
        <AlertsPanel alerts={openAlerts} />
      )}

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimension Scores */}
        {latestScore && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Score Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "User Activity", score: latestScore.activityScore, weight: "30%", detail: `${latestScore.activeUsers}/${latestScore.totalUsers} users active` },
                  { label: "Client Density", score: latestScore.clientDensityScore, weight: "20%", detail: `${latestScore.avgUsersPerClient.toFixed(1)} users/client` },
                  { label: "Revenue Health", score: latestScore.revenueScore, weight: "25%", detail: `R${(latestScore.totalRevenueCents / 100).toLocaleString("en-ZA")} MRR` },
                  { label: "Feature Utilization", score: latestScore.featureUtilizationScore, weight: "15%", detail: "module variety" },
                ].map(dim => (
                  <div key={dim.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{dim.label} <span className="text-muted-foreground">({dim.weight})</span></span>
                      <span className={`font-bold ${getScoreColor(dim.score)}`}>{dim.score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${dim.score >= 80 ? "bg-green-500" : dim.score >= 60 ? "bg-yellow-500" : dim.score >= 40 ? "bg-orange-500" : "bg-red-500"}`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{dim.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client Org Breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Client Organizations</CardTitle></CardHeader>
          <CardContent>
            {partner?.clientOrganizations && partner.clientOrganizations.length > 0 ? (
              <div className="space-y-2">
                {partner.clientOrganizations.map(co => (
                  <div key={co.organizationId} className="flex items-center justify-between rounded-md border p-2 text-xs">
                    <span className="font-medium">{co.organization.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        <Users className="h-2.5 w-2.5 mr-1" />
                        {co.organization._count.members} users
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No active client organizations</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score History */}
      {scoreHistory.length > 1 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Score History</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {scoreHistory.map(s => (
                <div key={s.periodMonth} className="text-center">
                  <div className={`text-lg font-bold ${getScoreColor(s.overallScore)}`}>{s.overallScore}</div>
                  <div className="text-[10px] text-muted-foreground">{s.periodMonth}</div>
                  <Badge variant="outline" className={`text-[9px] mt-1 ${getRiskColor(s.riskLevel)}`}>{s.riskLevel}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
