import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import {
  FileText,
  ClipboardCheck,
  AlertTriangle,
  FolderKanban,
  CheckSquare,
  Sparkles,
} from "lucide-react"
import { getDashboardMetrics, getOnboardingStatus, getClassificationStats } from "./actions"
import { OnboardingCard } from "./onboarding-card"
import { GapCoverageCard } from "@/components/dashboard/gap-coverage-card"
import { PendingReviewsWidget } from "@/components/dashboard/pending-reviews-widget"
import { DashboardHelpPanel } from "./dashboard-help-panel"

export default async function DashboardPage() {
  let metrics: Awaited<ReturnType<typeof getDashboardMetrics>> | null = null
  let onboarding: Awaited<ReturnType<typeof getOnboardingStatus>> | null = null
  let classificationStats: Awaited<ReturnType<typeof getClassificationStats>> | null = null

  try {
    ;[metrics, onboarding, classificationStats] = await Promise.all([
      getDashboardMetrics(),
      getOnboardingStatus(),
      getClassificationStats(),
    ])
  } catch {
    // Auth error — show empty state
  }

  const cards = [
    {
      title: "Active Projects",
      value: metrics?.activeProjects ?? 0,
      icon: FolderKanban,
    },
    {
      title: "Documents",
      value: metrics?.totalDocuments ?? 0,
      icon: FileText,
    },
    {
      title: "Assessments",
      value: metrics?.completedAssessments ?? 0,
      icon: ClipboardCheck,
    },
    {
      title: "Open CAPAs",
      value: metrics?.openCapas ?? 0,
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Dashboard"
        description="Overview of your compliance status"
      >
        <DashboardHelpPanel />
      </PageHeader>

      {onboarding && !onboarding.isComplete && (
        <OnboardingCard
          steps={onboarding.steps}
          completedCount={onboarding.completedCount}
          totalSteps={onboarding.totalSteps}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Average Score</span>
                <span className="font-medium">
                  {metrics?.avgComplianceScore != null
                    ? `${metrics.avgComplianceScore.toFixed(1)}%`
                    : "—"}
                </span>
              </div>
              <Progress
                value={metrics?.avgComplianceScore ?? 0}
                className="h-3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span>{metrics?.totalChecklists ?? 0} checklists</span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                <span>{metrics?.completedAssessments ?? 0} assessments done</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>AI Classification</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Classified</span>
                <span className="font-medium">
                  {classificationStats
                    ? `${classificationStats.classifiedDocuments} / ${classificationStats.totalDocuments}`
                    : "—"}
                </span>
              </div>
              <Progress
                value={
                  classificationStats && classificationStats.totalDocuments > 0
                    ? (classificationStats.classifiedDocuments / classificationStats.totalDocuments) * 100
                    : 0
                }
                className="h-3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Avg accuracy</span>
                <p className="font-medium">
                  {classificationStats?.avgConfidence != null
                    ? `${(classificationStats.avgConfidence * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Pending review</span>
                <p className="font-medium text-amber-600">
                  {classificationStats?.unverifiedCount ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <GapCoverageCard />

        <PendingReviewsWidget />

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {!metrics || metrics.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {metrics.recentActivity.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {event.action} {event.entityType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.user
                          ? `${event.user.firstName} ${event.user.lastName}`
                          : "System"}
                        {" — "}
                        {format(event.createdAt, "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
