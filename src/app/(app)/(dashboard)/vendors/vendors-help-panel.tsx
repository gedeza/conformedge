"use client"

import { Building2, Award, ShieldCheck, Share2 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function VendorsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Building2}
      summary="Track your vendors' compliance status, certifications, BEE levels, and safety ratings. Invite vendors to upload their own certificates via a self-service portal."
      items={[
        { icon: Award, label: "Certifications", description: "ISO certs, CIDB grading, BEE certificates, Letters of Good Standing" },
        { icon: ShieldCheck, label: "Tiers & Ratings", description: "Platinum / Gold / Silver tier based on BEE level and safety rating" },
        { icon: Share2, label: "Self-Service Portal", description: "Send a link so vendors can upload certs themselves" },
      ]}
      expandLabel="Portal & tips"
      tips={[
        "Click Invite to Portal on a vendor's detail page to generate a share link",
        "Vendors can upload new or renewed certs — uploads are Pending Review until you approve",
        "Expiring certifications trigger automatic notifications so nothing lapses",
        "BEE level and safety rating determine the vendor's tier (Platinum, Gold, Silver)",
        "Use the detail page to approve or reject uploaded certificates",
      ]}
    />
  )
}
