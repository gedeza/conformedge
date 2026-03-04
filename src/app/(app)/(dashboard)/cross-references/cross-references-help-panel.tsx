"use client"

import { GitCompareArrows, Link, Layers } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function CrossReferencesHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={GitCompareArrows}
      summary="Cross-References map equivalent clauses between different ISO standards. When two standards require the same thing (e.g. document control), this view shows the mapping so you can address both with a single policy or procedure."
      items={[
        { icon: Link, label: "Clause Mappings", description: "See which clauses across standards address the same requirement" },
        { icon: Layers, label: "Overlap Counts", description: "How many overlapping clauses exist between each pair of standards" },
      ]}
      expandLabel="Tips"
      tips={[
        "Select two standards to see their <strong>clause-by-clause mappings</strong>",
        "Use mappings to <strong>write one procedure</strong> that satisfies multiple standards",
        "The overlap count shows how much <strong>effort you can save</strong> through integration",
        "This data feeds into the <strong>IMS dashboard</strong> for integration efficiency scoring",
      ]}
    />
  )
}
