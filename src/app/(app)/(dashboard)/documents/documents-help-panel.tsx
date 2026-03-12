"use client"

import { FileText, Upload, Sparkles, Send, FolderKanban } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function DocumentsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={FileText}
      summary="Upload compliance documents (policies, SOPs, certificates) and let AI automatically classify them against ISO standard clauses. Documents flow through approval workflows before going live."
      items={[
        { icon: Upload, label: "Upload", description: "Upload files — AI auto-classifies them to ISO clauses" },
        { icon: Sparkles, label: "AI Classification", description: "Our AI analyses content and maps to relevant standard clauses" },
        { icon: Send, label: "Approval Workflow", description: "Submit documents for sequential review and sign-off" },
        { icon: FolderKanban, label: "Link to Project", description: "Assign documents to a project for organised tracking" },
      ]}
      expandLabel="Statuses & tips"
      tips={[
        "Use Bulk Upload to upload multiple files at once — they'll all be auto-classified",
        "Documents move through: Draft → Pending Review → Approved (or Rejected)",
        "Set an expiry date to get notified before a document lapses",
        "Use the project filter in the table to focus on a specific initiative",
        "AI classification confidence is shown as a percentage — verify low-confidence matches manually",
      ]}
    />
  )
}
