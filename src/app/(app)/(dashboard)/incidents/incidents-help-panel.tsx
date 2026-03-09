"use client"

import { Siren, ShieldAlert, Search, Link2, FileText } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function IncidentsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Siren}
      summary="Report and track workplace incidents, near-misses, and safety events. Each incident follows a structured workflow from reporting through investigation to closure, with optional CAPA linking for corrective actions."
      items={[
        { icon: ShieldAlert, label: "Report", description: "Log incidents with type, severity, location, and injured party details" },
        { icon: Search, label: "Investigate", description: "Assign investigators, set due dates, and document root cause analysis" },
        { icon: Link2, label: "Link CAPA", description: "Connect incidents to corrective actions for systematic resolution" },
      ]}
      expandLabel="Types & tips"
      tips={[
        "Incident types: <strong>Near Miss</strong>, First Aid, Medical, Lost Time, Fatality, Environmental, Property Damage",
        "Status flow: <strong>Reported → Investigating → Corrective Action → Closed</strong>",
        "<strong>Fatality</strong> incidents trigger immediate admin notifications",
        "Overdue investigations appear on the <strong>dashboard</strong> and trigger <strong>notifications</strong>",
        "Link incidents to <strong>CAPAs</strong> to ensure corrective actions are tracked and closed",
      ]}
    />
  )
}
