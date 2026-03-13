"use client"

import { Building2, Search, Filter, Download } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function OrganizationsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Building2}
      summary="Browse and filter all organizations on the platform. Click any org card to access detailed controls including subscription management, credits, and suspension."
      expandLabel="Show warnings & tips"
      items={[
        {
          icon: Search,
          label: "Search & Filter",
          description: "Search by name/industry, filter by plan tier or subscription status.",
        },
        {
          icon: Building2,
          label: "Org Cards",
          description: "Each card shows plan, status, member count, documents, and CAPAs.",
        },
        {
          icon: Filter,
          label: "Status Indicators",
          description: "Watch for Past Due or Cancelled statuses that need attention.",
        },
        {
          icon: Download,
          label: "CSV Export",
          description: "Export the full organization list for reporting or reconciliation.",
        },
      ]}
      tips={[
        "This page is read-only — all management actions are on the individual org detail page.",
        "Pay attention to orgs with PAST_DUE status — they may need follow-up.",
        "Use the CSV export to reconcile org data with external billing systems.",
        "Check member counts to ensure orgs aren't exceeding their plan limits.",
      ]}
    />
  )
}
