"use client"

import { AlertTriangle, CircleDot, Users, Clock } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function CapasHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={AlertTriangle}
      summary="CAPAs (Corrective and Preventive Actions) track issues found during assessments or audits. Each CAPA has an owner, priority, due date, and moves through a defined workflow until resolved."
      items={[
        { icon: CircleDot, label: "Types", description: "Corrective (fix existing issues) or Preventive (prevent future issues)" },
        { icon: Users, label: "Assign", description: "Assign to a team member with a due date for accountability" },
        { icon: Clock, label: "Track", description: "Monitor status: Open → In Progress → Verification → Closed" },
      ]}
      expandLabel="Priorities & tips"
      tips={[
        "Set priority (Low / Medium / High / Critical) based on risk severity",
        "Overdue CAPAs appear on the dashboard and trigger notifications",
        "Link CAPAs to a project to track them alongside related assessments",
        "Use the root cause field to document why the issue occurred",
        "CAPAs can span multiple standards — use cross-standard linking for shared gaps",
      ]}
    />
  )
}
