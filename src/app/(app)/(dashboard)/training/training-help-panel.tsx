"use client"

import { GraduationCap, Award, Users, Clock, FileCheck2 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function TrainingHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={GraduationCap}
      summary="Track employee training history, competency certificates, and expiry dates per OHS Act s8(2)(e) and Construction Regulations 2014. Ensures your workforce has valid, up-to-date training for all safety-critical activities."
      items={[
        { icon: GraduationCap, label: "Training Records", description: "Log training by 16 SA statutory categories with trainer, provider, and accreditation details" },
        { icon: Award, label: "Certificates", description: "Track certificate numbers, SAQA unit standards, NQF levels, and expiry dates" },
        { icon: Users, label: "Competency Matrix", description: "Visual grid showing each employee's training status by category — current, expiring, or expired" },
        { icon: Clock, label: "Expiry Alerts", description: "Automated notifications 30/14/7 days before certificate expiry. Auto-expires past-due records" },
        { icon: FileCheck2, label: "SHE File", description: "Training records automatically populate Section 12 of the SHE File PDF" },
      ]}
      expandLabel="Categories & expiry periods"
      tips={[
        "SA statutory expiry periods: First Aid (3yr), Fire Fighting (2yr), Working at Heights (2yr), Scaffolding (2-3yr), Crane/Forklift (2yr), Confined Space (2yr), HCS/HCA (2yr)",
        "Categories: Induction, First Aid, Fire Fighting, Working at Heights, Scaffolding, Crane Operator, Forklift Operator, Confined Space, Hazardous Chemicals, Electrical, Excavation, H&S Representative, Toolbox Talk, Competency, Refresher, Other",
        "Assessment results: Competent or Not Yet Competent (per SAQA standards)",
        "The competency matrix at /training/matrix shows a colour-coded grid for quick gap identification",
        "Available on Professional plan and above",
      ]}
    />
  )
}
