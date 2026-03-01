"use client"

import { HardHat, Award, ShieldCheck, Share2 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function SubcontractorsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={HardHat}
      summary="Track your subcontractors' compliance status, certifications, BEE levels, and safety ratings. Invite subcontractors to upload their own certificates via a self-service portal."
      items={[
        { icon: Award, label: "Certifications", description: "ISO certs, CIDB grading, BEE certificates, Letters of Good Standing" },
        { icon: ShieldCheck, label: "Tiers & Ratings", description: "Platinum / Gold / Silver tier based on BEE level and safety rating" },
        { icon: Share2, label: "Self-Service Portal", description: "Send a link so subcontractors can upload certs themselves" },
      ]}
      expandLabel="Portal & tips"
      tips={[
        "Click <strong>Invite to Portal</strong> on a subcontractor's detail page to generate a share link",
        "Subcontractors can upload new or renewed certs — uploads are <strong>Pending Review</strong> until you approve",
        "Expiring certifications trigger <strong>automatic notifications</strong> so nothing lapses",
        "BEE level and safety rating determine the subcontractor's <strong>tier</strong> (Platinum, Gold, Silver)",
        "Use the detail page to <strong>approve or reject</strong> uploaded certificates",
      ]}
    />
  )
}
