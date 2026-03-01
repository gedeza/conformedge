"use client"

import { CheckSquare, ListChecks, BookTemplate, BarChart3 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function ChecklistsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={CheckSquare}
      summary="Checklists let you track clause-by-clause compliance for a specific ISO standard. Mark each item as Compliant, Non-Compliant, or N/A. Completion percentage feeds into your project's compliance score."
      items={[
        { icon: ListChecks, label: "Clause Items", description: "Each checklist auto-populates with clauses from your chosen standard" },
        { icon: BookTemplate, label: "Templates", description: "Use pre-built templates for common audit types to save time" },
        { icon: BarChart3, label: "Progress", description: "Track completion % — feeds into project and dashboard metrics" },
      ]}
      expandLabel="Workflow & tips"
      tips={[
        "Select a <strong>standard</strong> and the checklist auto-fills with its clauses",
        "Use <strong>templates</strong> (e.g. 'Monthly Safety Audit') for recurring checks",
        "Assign a checklist to a <strong>team member</strong> for accountability",
        "Completion status: <strong>Not Started → In Progress → Completed</strong>",
        "Checklist results directly impact your project's <strong>compliance score</strong> on the dashboard",
      ]}
    />
  )
}
