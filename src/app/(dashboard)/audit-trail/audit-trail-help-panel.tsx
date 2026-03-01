"use client"

import { ScrollText, Search, Filter } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function AuditTrailHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={ScrollText}
      summary="The Audit Trail is an immutable log of every action taken in the system — creates, updates, deletes, approvals, and uploads. Use it for accountability, compliance evidence, and investigating changes."
      items={[
        { icon: Search, label: "Investigate", description: "See who did what, when, and to which entity" },
        { icon: Filter, label: "Filter", description: "Filter by action type, entity type, or specific user" },
      ]}
      expandLabel="Tips"
      tips={[
        "Every create, update, delete, and approval is <strong>automatically logged</strong>",
        "Logs are <strong>immutable</strong> — they cannot be edited or deleted by anyone",
        "Use during <strong>external audits</strong> to demonstrate change control compliance",
        "Filter by <strong>user</strong> to review a team member's actions",
        "Subcontractor portal uploads are also logged (marked as 'via subcontractor portal')",
      ]}
    />
  )
}
