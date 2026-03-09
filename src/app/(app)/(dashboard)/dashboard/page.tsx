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
import type { LucideIcon } from "lucide-react"
import { getDashboardMetrics, getOnboardingStatus, getClassificationStats } from "./actions"
import { OnboardingCard } from "./onboarding-card"
import { GapCoverageCard } from "@/components/dashboard/gap-coverage-card"
import { PendingReviewsWidget } from "@/components/dashboard/pending-reviews-widget"
import { UpcomingAssessmentsWidget } from "@/components/dashboard/upcoming-assessments-widget"
import { UpcomingChecklistsWidget } from "@/components/dashboard/upcoming-checklists-widget"
import { SubscriptionWidget } from "@/components/dashboard/subscription-widget"
import { OpenIncidentsWidget } from "@/components/dashboard/open-incidents-widget"
import { ObjectivesWidget } from "@/components/dashboard/objectives-widget"
import { ManagementReviewsWidget } from "@/components/dashboard/management-reviews-widget"
import { DashboardHelpPanel } from "./dashboard-help-panel"

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  STATUS_CHANGE: "Changed status of",
  AI_CLASSIFY: "AI classified",
  CROSS_STANDARD_CLASSIFY: "Cross-standard classified",
  TAG_CLAUSE: "Tagged clause on",
  UNTAG_CLAUSE: "Untagged clause on",
  VERIFY_CLASSIFICATION: "Verified classification of",
  NEW_VERSION: "Created new version of",
  GENERATE_QUESTIONS: "Generated questions for",
  CALCULATE_SCORE: "Calculated score for",
  GENERATE_ITEMS: "Generated items for",
  TOGGLE_COMPLIANCE: "Updated compliance on",
  ADD_ITEM: "Added item to",
  UPDATE_RESPONSE: "Updated response on",
  RAISE_CAPA: "Raised CAPA from",
  CREATE_FROM_TEMPLATE: "Created from template",
  CREATE_TEMPLATE: "Created template",
  DELETE_TEMPLATE: "Deleted template",
  UPDATE_TEMPLATE_ITEMS: "Updated template items",
  ADD_ACTION: "Added action to",
  ESCALATE: "Escalated",
  LINK_CLAUSES: "Linked clauses on",
  UNLINK_CLAUSE: "Unlinked clause from",
  SUBMIT_FOR_APPROVAL: "Submitted for approval",
  APPROVAL_STEP_APPROVED: "Approved",
  APPROVAL_STEP_REJECTED: "Rejected",
  APPROVAL_STEP_SKIPPED: "Skipped approval step on",
  APPROVAL_CANCELLED: "Cancelled approval of",
  CREATE_SHARE_LINK: "Created share link for",
  REVOKE_SHARE_LINK: "Revoked share link",
  DELETE_SHARE_LINK: "Deleted share link",
  VIEW: "Viewed",
  DOWNLOAD: "Downloaded",
  DOWNLOAD_PDF: "Downloaded PDF of",
  UPLOAD: "Uploaded",
  PORTAL_CERT_UPLOAD: "Uploaded certification via portal",
  SET_INDUSTRY: "Set industry for",
  DISMISS_ONBOARDING: "Completed onboarding",
  UPDATE_SETTINGS: "Updated settings",
  UPDATE_ROLE: "Updated role for",
  REMOVE_MEMBER: "Removed member from",
  SET_DEFAULT: "Set default on",
  INVITE_SENT: "Sent invitation",
  INVITE_ACCEPTED: "Invitation accepted",
  INVITE_REVOKED: "Revoked invitation",
  ADD_CERTIFICATION: "Added certification to",
  UPDATE_CERTIFICATION: "Updated certification on",
  DELETE_CERTIFICATION: "Deleted certification from",
  RECALCULATE_SCORE: "Recalculated score for",
  AUTO_GENERATE: "Auto-generated",
  COMPILE: "Compiled",
  EMAIL_SENT: "Sent email for",
  CONFIGURE_RECURRENCE: "Configured recurrence on",
  TOGGLE_PAUSE: "Toggled pause on",
}

const ENTITY_LABELS: Record<string, string> = {
  Document: "document",
  Assessment: "assessment",
  Capa: "CAPA",
  ComplianceChecklist: "checklist",
  ChecklistTemplate: "checklist template",
  Project: "project",
  Organization: "organization",
  AuditPack: "audit pack",
  Subcontractor: "subcontractor",
  SubcontractorCertification: "certification",
  ShareLink: "share link",
  ApprovalRequest: "approval",
  User: "user",
  OrganizationUser: "member",
  Invitation: "invitation",
  Incident: "incident",
  Objective: "objective",
  ManagementReview: "management review",
}

function humanizeActivity(action: string, entityType: string, metadata: Record<string, unknown> | null): string {
  const verb = ACTION_LABELS[action] || action.toLowerCase().replace(/_/g, " ")
  const entity = ENTITY_LABELS[entityType] || entityType.toLowerCase()
  const name = metadata?.title || metadata?.name || ""
  if (name) return `${verb} ${entity} "${name}"`
  return `${verb} ${entity}`
}

function activityDotColor(action: string): string {
  if (action === "DELETE" || action === "REMOVE_MEMBER") return "bg-red-500"
  if (action === "CREATE" || action === "UPLOAD" || action === "ADD_CERTIFICATION") return "bg-green-500"
  if (action.includes("APPROVE")) return "bg-green-500"
  if (action.includes("REJECT")) return "bg-red-500"
  if (action === "AI_CLASSIFY" || action === "CROSS_STANDARD_CLASSIFY") return "bg-purple-500"
  if (action === "STATUS_CHANGE") return "bg-yellow-500"
  if (action === "COMPILE" || action === "DOWNLOAD_PDF") return "bg-blue-500"
  return "bg-primary"
}

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

  const cards: { title: string; value: number; icon: LucideIcon; iconBg: string; iconColor: string }[] = [
    {
      title: "Active Projects",
      value: metrics?.activeProjects ?? 0,
      icon: FolderKanban,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Documents",
      value: metrics?.totalDocuments ?? 0,
      icon: FileText,
      iconBg: "bg-landing-accent/10",
      iconColor: "text-landing-accent",
    },
    {
      title: "Assessments",
      value: metrics?.completedAssessments ?? 0,
      icon: ClipboardCheck,
      iconBg: "bg-landing-cta/10",
      iconColor: "text-landing-cta",
    },
    {
      title: "Open CAPAs",
      value: metrics?.openCapas ?? 0,
      icon: AlertTriangle,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
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
          <Card key={card.title} className="border-border/50 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`flex size-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                <card.icon className={`size-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden border-border/50 transition-all hover:shadow-md">
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
                <CheckSquare className="h-4 w-4 text-purple-500" />
                <span>{metrics?.totalChecklists ?? 0} checklists</span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-landing-cta" />
                <span>{metrics?.completedAssessments ?? 0} assessments done</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-landing-cta to-landing-accent" />
        </Card>

        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>AI Classification</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-landing-accent/10">
              <Sparkles className="size-4 text-landing-accent" />
            </div>
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

        <SubscriptionWidget />

        <UpcomingAssessmentsWidget />

        <UpcomingChecklistsWidget />

        <OpenIncidentsWidget />

        <ObjectivesWidget />

        <ManagementReviewsWidget />

        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {!metrics || metrics.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {metrics.recentActivity.map((event) => {
                  const label = humanizeActivity(event.action, event.entityType, event.metadata as Record<string, unknown> | null)
                  return (
                    <div key={event.id} className="flex items-start gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${activityDotColor(event.action)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.user
                            ? `${event.user.firstName} ${event.user.lastName}`
                            : "System"}
                          {" — "}
                          {format(event.createdAt, "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
