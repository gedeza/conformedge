"use client"

import { Bell, Settings, Mail } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function NotificationsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Bell}
      summary="Notifications alert you to important events — expiring documents, overdue CAPAs, scheduled assessments, approval requests, and subcontractor certificate uploads. Delivered in-app and via email."
      items={[
        { icon: Mail, label: "Dual Channel", description: "Notifications are sent both in-app and via email" },
        { icon: Settings, label: "Preferences", description: "Customise which notifications you receive in Settings" },
      ]}
      expandLabel="Tips"
      tips={[
        "Click a notification to <strong>navigate directly</strong> to the relevant item",
        "Use <strong>Mark all as read</strong> to clear your unread count",
        "Go to <strong>Settings → Notifications</strong> to toggle specific notification types on/off",
        "Notification types: Document Expiry, CAPA Due, Assessment Scheduled, Cert Expiry, Approval Request, Cert Upload",
      ]}
    />
  )
}
