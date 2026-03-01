"use client"

import { Settings, Users, Bell, Share2 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function SettingsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Settings}
      summary="Configure your organisation's preferences, manage team members and roles, toggle active ISO standards, set up notification channels, define approval workflows, and create external share links."
      items={[
        { icon: Users, label: "Team & Roles", description: "View members and their roles (Owner, Admin, Manager, Auditor, Viewer)" },
        { icon: Bell, label: "Notifications", description: "Toggle in-app and email alerts per notification type" },
        { icon: Share2, label: "External Sharing", description: "Create token-based links for clients, auditors, or subcontractors" },
      ]}
      expandLabel="Tips"
      tips={[
        "Toggle <strong>ISO standards</strong> on/off to control which appear in assessments and checklists",
        "Set up <strong>approval workflows</strong> to require sign-off before documents are approved",
        "Enable <strong>auto-classify</strong> in organisation settings to automatically classify uploaded documents",
        "Share links can be <strong>revoked</strong> at any time and have optional expiry dates",
        "Only <strong>Owners and Admins</strong> can manage settings",
      ]}
    />
  )
}
