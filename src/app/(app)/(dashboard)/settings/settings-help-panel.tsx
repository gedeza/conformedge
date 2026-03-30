"use client"

import { Settings, Users, Bell, Share2, Building2 } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function SettingsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Settings}
      summary="Configure your organisation's preferences, manage team members and roles, toggle active ISO standards, set up notification channels, define approval workflows, manage multi-site hierarchy, and create external share links."
      items={[
        { icon: Users, label: "Team & Roles", description: "View members and their roles (Owner, Admin, Manager, Auditor, Viewer)" },
        { icon: Building2, label: "Multi-Site Hierarchy", description: "Create and manage divisions, sites, plants, and depots (Enterprise tier)" },
        { icon: Bell, label: "Notifications", description: "Toggle in-app and email alerts per notification type" },
        { icon: Share2, label: "External Sharing", description: "Create token-based links for clients, auditors, or vendors" },
      ]}
      expandLabel="Tips"
      tips={[
        "Toggle ISO standards on/off to control which appear in assessments and checklists",
        "Set up approval workflows to require sign-off before documents are approved",
        "Enable auto-classify in organisation settings to automatically classify uploaded documents",
        "Multi-Site Hierarchy supports up to 3 levels (e.g., HQ → Division → Site) — Enterprise plan required",
        "Use the site selector in the sidebar to filter all pages by a specific site",
        "Share links can be revoked at any time and have optional expiry dates",
        "Only Owners and Admins can manage settings",
      ]}
    />
  )
}
