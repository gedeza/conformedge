"use client"

import { LayoutDashboard, Users, Building2, AlertTriangle } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function AdminOverviewHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={LayoutDashboard}
      summary="Platform-wide overview of organizations, users, subscriptions, and revenue. All figures are live and reflect the current database state."
      expandLabel="Show warnings & tips"
      items={[
        {
          icon: Building2,
          label: "Organization Metrics",
          description: "Total orgs, active subscriptions, and trial counts.",
        },
        {
          icon: Users,
          label: "User Counts",
          description: "Total registered users across all organizations.",
        },
        {
          icon: AlertTriangle,
          label: "Revenue (MRR)",
          description: "Monthly Recurring Revenue calculated from active subscriptions.",
        },
        {
          icon: LayoutDashboard,
          label: "Recent Activity",
          description: "Latest admin actions logged in the audit trail.",
        },
      ]}
      tips={[
        "This page is read-only — no destructive actions are possible here.",
        "MRR only counts ACTIVE and TRIALING subscriptions, not cancelled or paused.",
        "Use this dashboard to spot anomalies before drilling into individual orgs.",
        "Check the activity log regularly for unexpected admin actions.",
      ]}
    />
  )
}
