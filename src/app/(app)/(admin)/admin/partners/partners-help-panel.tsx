"use client"

import { Handshake, Users, Building2, TrendingUp } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function PartnersHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Handshake}
      summary="View all partner organizations, their tiers, client counts, and commission structures. Partner management actions are handled on individual partner pages."
      expandLabel="Show tips"
      items={[
        {
          icon: Handshake,
          label: "Partner Tiers",
          description: "Consulting, White-Label, and Referral partners with different fee structures.",
        },
        {
          icon: Building2,
          label: "Client Orgs",
          description: "Number of active client organizations managed by each partner.",
        },
        {
          icon: Users,
          label: "Team Size",
          description: "Partner team members who have access to the partner dashboard.",
        },
        {
          icon: TrendingUp,
          label: "Commissions",
          description: "Referral partners earn commission — check percentages are correct.",
        },
      ]}
      tips={[
        "This page is read-only — partner status changes are managed from partner detail pages.",
        "Verify partner commission rates match the signed partner agreement.",
        "Suspended partners still appear in the list — check status before taking action.",
        "White-label partners have custom branding — changes may affect their customer experience.",
      ]}
    />
  )
}
