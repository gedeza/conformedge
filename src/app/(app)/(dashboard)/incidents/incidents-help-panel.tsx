"use client"

import { Siren, ShieldAlert, Search, Link2, Users, Activity } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function IncidentsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Siren}
      summary="Report and track workplace incidents, near-misses, and safety events. Each incident follows a structured workflow from reporting through investigation to closure, with full COIDA/MHSA compliance and optional CAPA linking."
      items={[
        { icon: ShieldAlert, label: "Report", description: "Log incidents with interactive body map (front & back), personnel details, injury classification, and consequence tracking" },
        { icon: Users, label: "Personnel", description: "Capture victim occupation, staff number, department, ID, nationality, contractor, and immediate supervisor for COIDA compliance" },
        { icon: Activity, label: "Impact", description: "Track injury type (26 categories), body parts injured, treatment obtained, estimated costs, spill volumes, and impact areas" },
        { icon: Search, label: "Investigate", description: "Assign investigators, set due dates, and document root cause analysis using simple or 5-Whys methods" },
        { icon: Link2, label: "Link CAPA", description: "Connect incidents to corrective actions for systematic resolution and regulatory compliance" },
      ]}
      expandLabel="Types & tips"
      tips={[
        "Incident types: Near Miss, First Aid, Medical, Lost Time, Fatality, Environmental, Property Damage",
        "Status flow: Reported → Investigating → Corrective Action → Closed",
        "Body map: Click front or back anatomical views to select injured body parts — supports multi-select with badge chips",
        "Nature of Injury is multi-select (26 types) — select all applicable injury classifications",
        "Non-injurious incidents (Environmental, Property Damage, Near Miss) show additional classification options: Fire/Explosion, Equipment Damage, Chemical Spill, etc.",
        "Consequence section tracks actual costs (R), spill volumes (m³), and impact areas (Health, Safety, Environment, Production)",
        "Outcome tracking: Record whether the injured person has returned to work — triggers 'Inform Safety & Health Officer' alert if not",
        "Statutory forms (Professional+): Generate pre-filled COIDA W.Cl.2 and SAPS 277 PDFs with all personnel and injury details",
        "Fatality incidents trigger immediate admin notifications and require SAPS reporting within 24 hours",
        "Contributing factors and regulatory reporting (MHSA sections 11, 23, 24) can be specified for reportable incidents",
      ]}
    />
  )
}
