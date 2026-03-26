"use client"

import { Bell, Settings, Mail } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function NotificationsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Bell}
      summary="Notifications alert you to important events — expiring documents, overdue CAPAs, scheduled assessments, approval requests, and vendor certificate uploads. Delivered in-app and via email."
      items={[
        { icon: Mail, label: "Dual Channel", description: "Notifications are sent both in-app and via email" },
        { icon: Settings, label: "Preferences", description: "Customise which notifications you receive in Settings" },
      ]}
      expandLabel="Tips"
      tips={[
        "Click a notification to navigate directly to the relevant item",
        "Use Mark all as read to clear your unread count",
        "Go to Settings → Notifications to toggle specific notification types on/off",
        "Notification types: Document Expiry, CAPA Due, Assessment Scheduled, Cert Expiry, Approval Request, Cert Upload",
      ]}
    />
  )
}
