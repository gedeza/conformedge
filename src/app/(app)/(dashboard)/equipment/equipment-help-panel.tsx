"use client"

import { Wrench, CalendarCheck, ClipboardList, Settings, AlertTriangle } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function EquipmentHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Wrench}
      summary="Manage your equipment register with calibration tracking, maintenance scheduling, and repair history. Ensures compliance with ISO 9001 Clause 7.1.5 (Monitoring & Measuring Resources) and ISO 45001 equipment safety requirements."
      items={[
        { icon: ClipboardList, label: "Register", description: "Add equipment with category, serial number, SWL, CE marking, and specifications" },
        { icon: CalendarCheck, label: "Calibration", description: "Track calibration dates, certificates, results (Pass/Fail/Conditional), and next due dates" },
        { icon: Settings, label: "Maintenance", description: "Schedule and track routine, preventive, corrective, and overhaul maintenance" },
        { icon: AlertTriangle, label: "Repairs", description: "Log repair history with supplier details, costs, and parts used — escalate defects to CAPA" },
      ]}
      expandLabel="Categories & tips"
      tips={[
        "Categories: Lifting Accessories, Lifting Machines, NDT Equipment, Drilling Equipment, Safety Equipment, Measurement Instruments, Vehicles, PPE, Fire Equipment, Electrical Equipment, General",
        "Status flow: Active → Under Repair / Quarantined → Active or Decommissioned",
        "Quarantined equipment indicates failed calibration or safety concern — requires resolution before returning to service",
        "Overdue calibrations are highlighted in red on the equipment list",
        "Equipment decommissioning preserves full history for audit purposes",
        "Link repairs to CAPA for systematic defect resolution and regulatory compliance",
        "Available on Professional plan and above",
      ]}
    />
  )
}
