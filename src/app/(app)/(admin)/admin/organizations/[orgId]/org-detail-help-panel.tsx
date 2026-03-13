"use client"

import { ShieldAlert, CreditCard, Zap, Banknote, AlertTriangle, PauseCircle } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function OrgDetailHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={ShieldAlert}
      summary="This page contains high-impact controls. Suspending, cancelling, or changing an org's plan affects all their users immediately. Double-check before saving any changes."
      expandLabel="Show critical warnings"
      items={[
        {
          icon: PauseCircle,
          label: "Suspend / Reactivate",
          description: "Suspending locks out ALL org users instantly — no grace period.",
        },
        {
          icon: CreditCard,
          label: "Plan Changes",
          description: "Downgrading may remove features the org actively uses.",
        },
        {
          icon: Banknote,
          label: "Payment Method",
          description: "Changing payment method affects how invoices are generated and settled.",
        },
        {
          icon: Zap,
          label: "Credit Adjustments",
          description: "Negative adjustments remove credits — ensure customer has been notified.",
        },
      ]}
      tips={[
        "NEVER suspend an org without first contacting the customer — they lose access immediately.",
        "Before downgrading a plan, check if the org uses features only available on higher tiers.",
        "When changing to EFT or Invoice payment, ensure bank details are configured in environment variables.",
        "Always add a clear description when adjusting credits — it appears in the audit trail.",
        "Cancelling a subscription is effectively irreversible — the org loses all access.",
        "When funding a prepaid account, verify the bank deposit has cleared before adding the balance.",
        "Generating a manual invoice creates a real invoice with VAT — verify the plan and period are correct.",
      ]}
    />
  )
}
