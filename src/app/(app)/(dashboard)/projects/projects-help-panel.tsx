"use client"

import {
  FolderKanban,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  Package,
} from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function ProjectsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={FolderKanban}
      summary="Projects are compliance initiative containers that group all related work under one umbrella. Use them to track progress for a certification drive, construction site, or audit preparation."
      items={[
        { icon: FileText, label: "Documents", description: "Policies, procedures, SOPs, and certificates" },
        { icon: ClipboardCheck, label: "Assessments", description: "Compliance assessments scoped to this project" },
        { icon: AlertTriangle, label: "CAPAs", description: "Corrective and preventive actions" },
        { icon: CheckSquare, label: "Checklists", description: "Clause-by-clause compliance tracking" },
        { icon: Package, label: "Audit Packs", description: "Bundled evidence for auditors or clients" },
      ]}
      expandLabel="Lifecycle & tips"
      tips={[
        "Lifecycle: <strong>Planning → Active → On Hold → Completed → Archived</strong>",
        "Projects are <strong>optional</strong> — entities can exist without being linked to any project",
        "Deleting a project <strong>does not delete its contents</strong> — linked items are simply unlinked",
        "Use the <strong>Project dropdown</strong> when creating documents, assessments, CAPAs, or checklists to link them",
        "The project dashboard shows <strong>compliance score, overdue CAPAs, risk distribution</strong>, and trends",
      ]}
    />
  )
}
