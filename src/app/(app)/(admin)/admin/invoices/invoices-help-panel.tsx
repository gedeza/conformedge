"use client"

import { Receipt, AlertTriangle, CheckCircle, Banknote } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function InvoicesHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Receipt}
      summary="Manage invoices across all organizations. Marking an invoice as PAID is a financial action — always verify bank statements before confirming payment."
      expandLabel="Show critical warnings"
      items={[
        {
          icon: AlertTriangle,
          label: "Mark as Paid",
          description: "Only mark PAID after verifying the deposit in your bank account.",
        },
        {
          icon: Banknote,
          label: "Bank Reference",
          description: "Always enter the EFT reference number for reconciliation and audit.",
        },
        {
          icon: CheckCircle,
          label: "Status Flow",
          description: "Invoices go: DRAFT → OPEN → PAID (or UNCOLLECTIBLE if overdue).",
        },
        {
          icon: Receipt,
          label: "Overdue Invoices",
          description: "Red rows indicate overdue invoices that need immediate follow-up.",
        },
      ]}
      tips={[
        "NEVER mark an invoice as paid without verifying the bank deposit — this affects accounting.",
        "Always include the bank reference number — it's required for financial reconciliation.",
        "Overdue invoices (red rows) may trigger automatic subscription downgrades after 14 days.",
        "The cron job auto-generates invoices for INVOICE-method orgs 3 days before period end.",
        "Check this page daily to catch overdue payments and follow up with customers.",
      ]}
    />
  )
}
