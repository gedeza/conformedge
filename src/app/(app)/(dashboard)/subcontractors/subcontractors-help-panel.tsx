"use client"

import { Building2, Award, ShieldCheck, Share2 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function SubcontractorsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Building2}
      summary="Track your subcontractors' compliance status, certifications, BEE levels, and safety ratings. Invite subcontractors to upload their own certificates via a self-service portal."
      items={[
        { icon: Award, label: "Certifications", description: "ISO certs, CIDB grading, BEE certificates, Letters of Good Standing" },
        { icon: ShieldCheck, label: "Tiers & Ratings", description: "Platinum / Gold / Silver tier based on BEE level and safety rating" },
        { icon: Share2, label: "Self-Service Portal", description: "Send a link so subcontractors can upload certs themselves" },
      ]}
      expandLabel="Portal & tips"
      tips={[
        "Click Invite to Portal on a subcontractor's detail page to generate a share link",
        "Subcontractors can upload new or renewed certs — uploads are Pending Review until you approve",
        "Expiring certifications trigger automatic notifications so nothing lapses",
        "BEE level and safety rating determine the subcontractor's tier (Platinum, Gold, Silver)",
        "Use the detail page to approve or reject uploaded certificates",
      ]}
    />
  )
}
