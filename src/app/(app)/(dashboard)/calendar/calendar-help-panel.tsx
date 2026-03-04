"use client"

import { CalendarDays, ClipboardCheck, Eye, Bell } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function CalendarHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={CalendarDays}
      summary="View all scheduled and completed assessments in a calendar layout. Navigate months to plan ahead and spot overdue assessments at a glance."
      items={[
        { icon: ClipboardCheck, label: "Assessments", description: "Colour-coded dots show assessment status on each day" },
        { icon: Eye, label: "Quick View", description: "Click any assessment dot to see details and navigate" },
        { icon: Bell, label: "Reminders", description: "Assessors receive notifications 7 days and 1 day before" },
      ]}
      expandLabel="Calendar tips"
      tips={[
        "Switch between <strong>Month View</strong> and <strong>List View</strong> using the tabs",
        "Colour key: <strong>Blue</strong> = Scheduled, <strong>Yellow</strong> = In Progress, <strong>Green</strong> = Completed, <strong>Red</strong> = Overdue",
        "Use the <strong>Today</strong> button to jump back to the current month",
        "Schedule assessments from the <strong>Assessments</strong> page using the scheduled date field",
      ]}
    />
  )
}
