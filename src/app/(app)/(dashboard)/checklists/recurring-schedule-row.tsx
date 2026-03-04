"use client"

import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ConfigureRecurrenceDialog } from "./configure-recurrence-dialog"
import type { RecurrenceFrequency } from "@/types"

interface RecurringScheduleRowProps {
  schedule: {
    id: string
    name: string
    isRecurring: boolean
    isPaused: boolean
    recurrenceFrequency: RecurrenceFrequency | null
    customIntervalDays: number | null
    nextDueDate: Date | string | null
    defaultAssigneeId: string | null
    defaultProjectId: string | null
    standard: { code: string }
    defaultAssignee: { firstName: string; lastName: string } | null
    _count: { generatedChecklists: number }
  }
  freqLabel: string
  members: { id: string; name: string }[]
  projects: { id: string; name: string }[]
}

export function RecurringScheduleRow({ schedule, freqLabel, members, projects }: RecurringScheduleRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{schedule.name}</span>
          <Badge variant="secondary" className="text-[10px] shrink-0">{schedule.standard.code}</Badge>
          <Badge variant="outline" className="text-[10px] shrink-0">{freqLabel}</Badge>
          {schedule.isPaused && <Badge variant="destructive" className="text-[10px] shrink-0">Paused</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {schedule.nextDueDate && !schedule.isPaused
            ? `Next: ${formatDistanceToNow(new Date(schedule.nextDueDate), { addSuffix: true })}`
            : schedule.isPaused ? "Paused" : "Not scheduled"}
          {schedule.defaultAssignee && ` · ${schedule.defaultAssignee.firstName} ${schedule.defaultAssignee.lastName}`}
          {` · ${schedule._count.generatedChecklists} generated`}
        </p>
      </div>
      <ConfigureRecurrenceDialog
        template={schedule}
        members={members}
        projects={projects}
      />
    </div>
  )
}
