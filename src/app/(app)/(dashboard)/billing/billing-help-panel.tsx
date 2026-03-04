"use client"

import { CreditCard, Zap, TrendingUp, Shield } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function BillingHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={CreditCard}
      summary="Manage your subscription, monitor usage, and purchase AI credits."
      expandLabel="Show tips"
      items={[
        {
          icon: CreditCard,
          label: "Subscription",
          description: "View your current plan, billing cycle, and subscription status.",
        },
        {
          icon: TrendingUp,
          label: "Usage Tracking",
          description: "Monitor AI classifications, document counts, and user limits.",
        },
        {
          icon: Zap,
          label: "AI Credits",
          description: "Purchase additional credits when your monthly quota runs out.",
        },
        {
          icon: Shield,
          label: "Plan Comparison",
          description: "Compare features across tiers and upgrade when ready.",
        },
      ]}
      tips={[
        "Purchased AI credits never expire and are used after your monthly quota.",
        "Annual billing saves ~17% compared to monthly payments.",
        "Upgrade or downgrade anytime — changes apply at the next billing cycle.",
      ]}
    />
  )
}
