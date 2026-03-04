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
        "Filter by <strong>standard</strong> to focus on a specific ISO certification",
        "Filter by <strong>project</strong> to see coverage for a specific initiative",
        "Coverage improves as you <strong>upload documents</strong> and <strong>complete assessments</strong>",
        "Below 25% coverage triggers an <strong>automatic notification</strong> to alert your team",
        "Expand each standard to see <strong>clause-level detail</strong> and identify exactly what's missing",
      ]}
    />
  )
}
