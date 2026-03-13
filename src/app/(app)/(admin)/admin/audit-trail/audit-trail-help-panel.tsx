"use client"

import { ScrollText, Search, Shield, Clock } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function AuditTrailHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={ScrollText}
      summary="Cross-organization audit trail showing all system actions. Use this for compliance reporting, investigating incidents, and monitoring admin activity."
      expandLabel="Show tips"
      items={[
        {
          icon: Search,
          label: "Search",
          description: "Search by action type, entity type, or user email address.",
        },
        {
          icon: Shield,
          label: "Admin Actions",
          description: "All admin operations (suspensions, credit adjustments, etc.) are logged here.",
        },
        {
          icon: Clock,
          label: "Timestamps",
          description: "All times are displayed in your local timezone (SAST).",
        },
        {
          icon: ScrollText,
          label: "Compliance",
          description: "Audit logs are retained indefinitely for ISO and POPIA compliance.",
        },
      ]}
      tips={[
        "This page is read-only — audit logs cannot be modified or deleted.",
        "Search for 'SUBSCRIPTION_UPDATED' to review recent plan changes.",
        "Search for 'INVOICE_PAID' to verify payment reconciliation actions.",
        "Review admin activity regularly to detect unauthorized or accidental changes.",
        "Audit logs are essential for ISO 27001 and POPIA compliance demonstrations.",
      ]}
    />
  )
}
