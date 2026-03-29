"use client"

import { HardHat, FileDown, Shield, BookOpen, CheckCircle2 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function SHEFilesHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={HardHat}
      summary="Generate Safety, Health & Environment files per OHS Act 85/1993 and Construction Regulations 2014 (Regulation 7). The SHE file is compiled on-demand from your existing ConformEdge data."
      items={[
        { icon: FileDown, label: "On-Demand PDF", description: "Click 'Download SHE File' on any project card to generate a fresh 18-section PDF" },
        { icon: CheckCircle2, label: "Readiness Score", description: "Each project shows a readiness percentage based on how many data sections are populated" },
        { icon: BookOpen, label: "18 Sections", description: "Project info, legal standing, OHS policy, Section 37(2), H&S plan, organogram, risk assessments, training records, and more" },
        { icon: Shield, label: "Regulatory References", description: "Each section includes the applicable OHS Act, Construction Regulations, or NEMA reference" },
      ]}
      expandLabel="SHE file sections"
      tips={[
        "The more data you capture in ConformEdge, the more complete your SHE file becomes",
        "SHE file sections: Project Info, Legal Standing, OHS Policy, Section 37(2), H&S Plan, Organogram & Appointments, Risk Assessments, Safe Work Procedures, Permits to Work, Incident Register, Inspections, Training Records, Environmental Compliance, Sub-Contractors, CAPAs, Safety Statistics, Document Register, Sign-Off",
        "Per Construction Regulation 7(1)(b), the principal contractor must maintain a SHE file on site",
        "Records must be retained for 30 years per statutory requirements",
        "The SHE file must be available for inspection by DoEL inspectors at any time",
        "Available on all plans",
      ]}
    />
  )
}
