"use client"

import { ClipboardCheck, Target, AlertTriangle, BarChart3 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function AssessmentsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={ClipboardCheck}
      summary="Conduct gap assessments against ISO standard clauses to identify where your organisation is compliant, partially compliant, or has gaps. Each assessment generates a risk-rated compliance score."
      items={[
        { icon: Target, label: "Scope", description: "Select a standard and assess clause-by-clause compliance" },
        { icon: AlertTriangle, label: "Risk Rating", description: "Each assessment is scored and rated: Low, Medium, High, or Critical" },
        { icon: BarChart3, label: "Compliance Score", description: "Auto-calculated percentage based on clause responses" },
      ]}
      expandLabel="How to assess"
      tips={[
        "Choose a <strong>standard</strong> (e.g. ISO 9001) and a <strong>project</strong> to scope the assessment",
        "For each clause, select <strong>Compliant</strong>, <strong>Partial</strong>, or <strong>Non-Compliant</strong>",
        "Add <strong>findings and evidence</strong> notes to support your ratings",
        "Low-scoring assessments automatically trigger <strong>gap analysis alerts</strong>",
        "Create <strong>CAPAs</strong> directly from assessment findings to track remediation",
      ]}
    />
  )
}
