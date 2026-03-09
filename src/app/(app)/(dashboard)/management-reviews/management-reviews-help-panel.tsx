"use client"

import { HelpPanel } from "@/components/shared/help-panel"
import { Calendar, Users, ListChecks, ClipboardCheck, ClipboardList } from "lucide-react"

export function ManagementReviewsHelpPanel() {
  return (
    <HelpPanel
      title="Management Reviews"
      icon={ClipboardList}
      summary="Management Reviews fulfill ISO Clause 9.3 requirements. Schedule periodic reviews, record agenda items from required inputs, track action items, and document meeting minutes."
      items={[
        { icon: Calendar, label: "Schedule Reviews", description: "Set date, facilitator, and standards scope" },
        { icon: ListChecks, label: "Agenda Items", description: "Add ISO-required inputs (audit results, CAPA status, etc.)" },
        { icon: ClipboardCheck, label: "Action Tracking", description: "Track action items with assignees and due dates" },
        { icon: Users, label: "Audit Evidence", description: "Record attendees and meeting minutes" },
      ]}
      tips={[
        "ISO 9001/14001/45001 Clause 9.3 requires periodic management reviews at planned intervals",
        "Agenda items map to required review inputs: audit results, customer feedback, process performance, etc.",
        "Action items from reviews can be tracked to completion for continual improvement evidence",
        "Link multiple standards to a single review for integrated management system audits",
      ]}
    />
  )
}
