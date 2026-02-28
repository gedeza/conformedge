"use client"

import { useState, useTransition } from "react"
import { Bell, Mail } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { updateNotificationPreference, type NotificationPreferenceMap } from "./notification-actions"
import type { NotificationType } from "@/types"

const NOTIFICATION_LABELS: Record<NotificationType, { label: string; description: string }> = {
  DOCUMENT_EXPIRY: {
    label: "Document Expiry",
    description: "When documents are nearing or past their expiry date",
  },
  CAPA_DUE: {
    label: "CAPA Due / Overdue",
    description: "When corrective actions are due or escalated",
  },
  ASSESSMENT_SCHEDULED: {
    label: "Assessment Scheduled",
    description: "When new assessments are scheduled",
  },
  CERT_EXPIRY: {
    label: "Certification Expiry",
    description: "When subcontractor certifications are expiring",
  },
  SYSTEM: {
    label: "System",
    description: "General system notifications and announcements",
  },
}

const TYPES: NotificationType[] = [
  "DOCUMENT_EXPIRY",
  "CAPA_DUE",
  "ASSESSMENT_SCHEDULED",
  "CERT_EXPIRY",
  "SYSTEM",
]

interface Props {
  initialPreferences: NotificationPreferenceMap
}

export function NotificationPreferences({ initialPreferences }: Props) {
  const [prefs, setPrefs] = useState(initialPreferences)
  const [pending, startTransition] = useTransition()

  function handleToggle(type: NotificationType, channel: "IN_APP" | "EMAIL", current: boolean) {
    const newValue = !current

    // Optimistic update
    setPrefs((prev) => ({
      ...prev,
      [type]: { ...prev[type], [channel]: newValue },
    }))

    startTransition(async () => {
      const result = await updateNotificationPreference(type, channel, newValue)
      if (!result.success) {
        // Revert on failure
        setPrefs((prev) => ({
          ...prev,
          [type]: { ...prev[type], [channel]: current },
        }))
      }
    })
  }

  return (
    <div className="space-y-1">
      {/* Header row */}
      <div className="flex items-center justify-end gap-6 pb-2 pr-1 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1">
          <Bell className="h-3 w-3" />
          <span>In-App</span>
        </div>
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3" />
          <span>Email</span>
        </div>
      </div>

      {/* Notification type rows */}
      {TYPES.map((type) => {
        const config = NOTIFICATION_LABELS[type]
        const pref = prefs[type]

        return (
          <div
            key={type}
            className="flex items-center justify-between py-2.5 border-b last:border-b-0"
          >
            <div className="min-w-0 mr-4">
              <p className="text-sm font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
            <div className="flex items-center gap-8 shrink-0">
              <Switch
                checked={pref.IN_APP}
                onCheckedChange={() => handleToggle(type, "IN_APP", pref.IN_APP)}
                disabled={pending}
                aria-label={`${config.label} in-app notifications`}
              />
              <Switch
                checked={pref.EMAIL}
                onCheckedChange={() => handleToggle(type, "EMAIL", pref.EMAIL)}
                disabled={pending}
                aria-label={`${config.label} email notifications`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
