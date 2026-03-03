import { formatDistanceToNow } from "date-fns"
import { RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RECURRENCE_FREQUENCIES } from "@/lib/constants"
import { getRecurringSchedules, getProjectOptions, getMembers } from "./actions"
import { RecurringScheduleRow } from "./recurring-schedule-row"

export async function RecurringSchedulesCard() {
  let schedules: Awaited<ReturnType<typeof getRecurringSchedules>> = []
  let members: { id: string; name: string }[] = []
  let projects: { id: string; name: string }[] = []

  try {
    ;[schedules, members, projects] = await Promise.all([
      getRecurringSchedules(),
      getMembers(),
      getProjectOptions(),
    ])
  } catch {
    return null
  }

  if (schedules.length === 0) return null

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recurring Schedules</CardTitle>
        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
          <RefreshCw className="size-4 text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {schedules.map((s) => {
            const freqLabel = s.recurrenceFrequency
              ? RECURRENCE_FREQUENCIES[s.recurrenceFrequency]?.label ?? s.recurrenceFrequency
              : "—"

            return (
              <RecurringScheduleRow
                key={s.id}
                schedule={s}
                freqLabel={freqLabel}
                members={members}
                projects={projects}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
