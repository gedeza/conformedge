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
        "Select two standards to see their clause-by-clause mappings",
        "Use mappings to write one procedure that satisfies multiple standards",
        "The overlap count shows how much effort you can save through integration",
        "This data feeds into the IMS dashboard for integration efficiency scoring",
      ]}
    />
  )
}
