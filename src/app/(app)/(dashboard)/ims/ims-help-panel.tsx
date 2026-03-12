"use client"

import { Layers, GitMerge, AlertTriangle, TrendingUp } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function IMSHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Layers}
      summary="The Integrated Management System shows how your compliance work connects across multiple ISO standards. It identifies shared requirements so you avoid duplicating effort, and highlights gaps that cascade across standards."
      items={[
        { icon: GitMerge, label: "Integration Efficiency", description: "How many requirements are shared vs unique across your standards" },
        { icon: TrendingUp, label: "Consolidated Readiness", description: "Overall compliance score accounting for cross-standard overlaps" },
        { icon: AlertTriangle, label: "Gap Cascades", description: "Gaps in one standard that affect others — fix once, benefit everywhere" },
      ]}
      expandLabel="Tips"
      tips={[
        "A high integration efficiency means many clauses overlap — less work to maintain",
        "Gap cascades are high-priority — fixing one gap can improve compliance across multiple standards",
        "Use the shared requirements matrix to see exactly which clauses map together",
        "This view is most useful when you have 2+ active ISO standards",
      ]}
    />
  )
}
