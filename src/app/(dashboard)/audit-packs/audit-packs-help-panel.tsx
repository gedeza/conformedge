"use client"

import { Package, FileText, Download, Share2 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function AuditPacksHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Package}
      summary="Audit Packs bundle your compliance evidence into a single downloadable PDF. Use them to prepare for external audits, share with clients, or archive compliance snapshots for a specific project or time period."
      items={[
        { icon: FileText, label: "Contents", description: "Includes assessments, documents, CAPAs, and checklist results" },
        { icon: Download, label: "Export", description: "Generate a professional PDF with all evidence compiled" },
        { icon: Share2, label: "Share", description: "Email to auditors or share via a secure external link" },
      ]}
      expandLabel="Tips"
      tips={[
        "Link an audit pack to a <strong>project</strong> to automatically include its related evidence",
        "Use the <strong>email</strong> feature to send the PDF directly to external auditors",
        "Create <strong>share links</strong> in Settings to give clients read-only access to audit packs",
        "Generate packs <strong>before</strong> surveillance audits to have evidence ready",
      ]}
    />
  )
}
