"use client"

import { Target, TrendingUp, BarChart3, Link2 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function ObjectivesHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Target}
      summary="Define quality and safety objectives aligned to ISO standard clauses (e.g. ISO 9001 §6.2, ISO 45001 §6.2). Track progress with periodic measurements and visualize trends over time."
      items={[
        { icon: Target, label: "Set Targets", description: "Define measurable objectives with target values and due dates" },
        { icon: TrendingUp, label: "Track Progress", description: "Record periodic measurements to track achievement over time" },
        { icon: Link2, label: "Link Standards", description: "Map objectives to specific ISO standard clauses for compliance" },
      ]}
      expandLabel="Status & tips"
      tips={[
        "Status is <strong>auto-derived</strong> from progress vs. time: On Track, At Risk, or Behind",
        "Set <strong>measurement frequency</strong> (weekly, monthly, quarterly, annually) to get reminders",
        "Link objectives to <strong>ISO clauses</strong> to demonstrate compliance with §6.2 requirements",
        "The <strong>trend chart</strong> on the detail page shows measurement history with a target line",
        "Overdue measurements trigger <strong>notifications</strong> to the objective owner",
      ]}
    />
  )
}
