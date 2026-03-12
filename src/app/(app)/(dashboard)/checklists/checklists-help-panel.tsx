"use client"

import { CheckSquare, ListChecks, BookTemplate, BarChart3, RefreshCw, SlidersHorizontal } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function ChecklistsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={CheckSquare}
      summary="Checklists let you track clause-by-clause compliance for a specific ISO standard. Mark each item as Compliant, Non-Compliant, or N/A, or use custom field types for richer data capture. Completion percentage feeds into your project's compliance score."
      items={[
        { icon: ListChecks, label: "Clause Items", description: "Each checklist auto-populates with clauses from your chosen standard" },
        { icon: SlidersHorizontal, label: "Custom Fields", description: "Add Yes/No, Number, Rating (1-5 stars), or Dropdown items for flexible data capture" },
        { icon: BookTemplate, label: "Templates", description: "Use pre-built templates for common audit types — field types are preserved" },
        { icon: BarChart3, label: "Progress", description: "Track completion % — feeds into project and dashboard metrics" },
        { icon: RefreshCw, label: "Recurring Schedules", description: "Set templates to auto-generate checklists on a weekly, monthly, quarterly, or custom schedule" },
      ]}
      expandLabel="Workflow & tips"
      tips={[
        "Select a standard and the checklist auto-fills with its clauses",
        "When adding items, choose a field type: Compliance (default), Yes/No, Number, Rating, or Dropdown",
        "Number fields support min/max validation and a unit label (e.g. mm, kg)",
        "Use templates (e.g. 'Monthly Safety Audit') for recurring checks — field types carry over",
        "Click the pencil icon on a template to configure field types for each item",
        "Assign a checklist to a team member for accountability",
        "Completion status: Not Started → In Progress → Completed",
        "Click the gear icon on a template to set up a recurring schedule",
        "You can pause/resume any recurring schedule without losing the configuration",
      ]}
    />
  )
}
