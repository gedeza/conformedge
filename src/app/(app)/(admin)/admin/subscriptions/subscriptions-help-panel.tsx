"use client"

import { CreditCard, Search, Filter, Download } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function SubscriptionsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={CreditCard}
      summary="View all subscriptions across the platform. Use filters to find specific plans or statuses. Subscription changes are made on the individual org detail page."
      expandLabel="Show tips"
      items={[
        {
          icon: Search,
          label: "Search & Filter",
          description: "Filter by plan tier or subscription status to find specific orgs.",
        },
        {
          icon: CreditCard,
          label: "Plan Distribution",
          description: "See which plans are most popular and spot tier migration opportunities.",
        },
        {
          icon: Filter,
          label: "Status Monitoring",
          description: "Watch for PAST_DUE or CANCELLED subscriptions needing intervention.",
        },
        {
          icon: Download,
          label: "CSV Export",
          description: "Export subscription data for financial reporting and reconciliation.",
        },
      ]}
      tips={[
        "This page is read-only — subscription changes are made from the org detail page.",
        "PAST_DUE subscriptions need follow-up — the customer may have a payment issue.",
        "Use CSV export for monthly financial reconciliation with your accounting system.",
        "TRIALING orgs approaching trial end may need outreach to convert to paid.",
      ]}
    />
  )
}
