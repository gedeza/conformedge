"use client"

import { TrendingUp, BarChart3, PieChart, Calculator } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function RevenueHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={TrendingUp}
      summary="Revenue analytics showing MRR, plan distribution, and payment trends. All figures are calculated from active subscriptions and paid invoices."
      expandLabel="Show tips"
      items={[
        {
          icon: Calculator,
          label: "MRR Calculation",
          description: "Monthly Recurring Revenue from ACTIVE and TRIALING subscriptions only.",
        },
        {
          icon: BarChart3,
          label: "Revenue Chart",
          description: "Historical revenue trend based on paid invoices per month.",
        },
        {
          icon: PieChart,
          label: "Plan Distribution",
          description: "Breakdown of subscriptions by tier to understand your customer mix.",
        },
        {
          icon: TrendingUp,
          label: "Growth Metrics",
          description: "Track month-over-month changes in subscriptions and revenue.",
        },
      ]}
      tips={[
        "This page is read-only — no actions can be performed here.",
        "MRR excludes paused and cancelled subscriptions.",
        "Annual subscriptions are divided by 12 for the MRR calculation.",
        "Use this data to inform pricing decisions and identify churn risk.",
      ]}
    />
  )
}
