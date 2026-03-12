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
        "Choose a standard (e.g. ISO 9001) and a project to scope the assessment",
        "For each clause, select Compliant, Partial, or Non-Compliant",
        "Add findings and evidence notes to support your ratings",
        "Low-scoring assessments automatically trigger gap analysis alerts",
        "Create CAPAs directly from assessment findings to track remediation",
      ]}
    />
  )
}
