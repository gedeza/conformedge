"use client"

import { ShieldCheck, Flame, ClipboardCheck, Clock, FileCheck } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function PermitsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={ShieldCheck}
      summary="Manage Permit to Work (PTW) for high-risk activities. Each permit follows a structured approval workflow, includes safety checklists, and can be extended when needed. Supports ISO 45001 requirements for controlling hazardous work."
      items={[
        { icon: Flame, label: "Permit Types", description: "Hot work, confined space, heights, electrical, excavation, lifting" },
        { icon: ClipboardCheck, label: "Safety Checklists", description: "Pre-work safety verification items checked before activation" },
        { icon: Clock, label: "Validity Tracking", description: "Time-bound permits with auto-expiry and extension requests" },
        { icon: FileCheck, label: "Approval Workflow", description: "Draft, submit, approve, activate, close — full audit trail" },
      ]}
      expandLabel="Types & tips"
      tips={[
        "Workflow: <strong>Draft -> Pending Approval -> Approved -> Active -> Closed</strong>",
        "Permits auto-expire when the <strong>Valid To</strong> date passes",
        "Request extensions for active permits — requires manager approval",
        "<strong>Suspended</strong> permits can be resumed or closed",
        "All transitions are logged in the <strong>Audit Trail</strong>",
      ]}
    />
  )
}
