"use client"

import { LayoutDashboard, TrendingUp, AlertTriangle, Sparkles } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function DashboardHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={LayoutDashboard}
      summary="Your compliance command centre. See key metrics at a glance — active projects, open CAPAs, compliance scores, AI classification progress, and recent activity across your organisation."
      items={[
        { icon: TrendingUp, label: "Compliance Score", description: "Average score across all assessments and checklists" },
        { icon: AlertTriangle, label: "Open CAPAs", description: "Corrective actions that need attention" },
        { icon: Sparkles, label: "AI Classification", description: "How many documents have been auto-classified" },
      ]}
      expandLabel="Tips"
      tips={[
        "Complete the onboarding checklist to set up your organisation properly",
        "The gap coverage card shows your overall ISO clause coverage",
        "The pending reviews widget shows documents awaiting your approval",
        "Click any metric card to navigate to the relevant page for details",
      ]}
    />
  )
}
