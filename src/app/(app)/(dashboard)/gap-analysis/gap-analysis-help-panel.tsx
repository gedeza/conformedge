"use client"

import { SearchCheck, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function GapAnalysisHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={SearchCheck}
      summary="Gap Analysis shows which ISO clauses you've covered with documents and assessments, which are partially addressed, and where gaps remain. Use it to prioritise what to work on next."
      items={[
        { icon: ShieldCheck, label: "Covered", description: "Clauses with documents and passing assessments" },
        { icon: AlertTriangle, label: "Partial", description: "Clauses with some evidence but incomplete coverage" },
        { icon: ShieldAlert, label: "Gaps", description: "Clauses with no evidence — prioritise these first" },
      ]}
      expandLabel="Tips"
      tips={[
        "Filter by standard to focus on a specific ISO certification",
        "Filter by project to see coverage for a specific initiative",
        "Coverage improves as you upload documents and complete assessments",
        "Below 25% coverage triggers an automatic notification to alert your team",
        "Expand each standard to see clause-level detail and identify exactly what's missing",
      ]}
    />
  )
}
