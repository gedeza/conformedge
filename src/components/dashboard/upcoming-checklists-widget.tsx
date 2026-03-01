import { formatDistanceToNow } from "date-fns"
import { RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { addDays } from "date-fns"
import { RECURRENCE_FREQUENCIES } from "@/lib/constants"

export async function UpcomingChecklistsWidget() {
  let schedules: {
    id: string
    name: string
    recurrenceFrequency: string | null
    nextDueDate: Date | null
    defaultAssignee: { firstName: string; lastName: string } | null
  }[] = []

  try {
    const { dbOrgId } = await getAuthContext()
    const now = new Date()
    const in7Days = addDays(now, 7)

    schedules = await db.checklistTemplate.findMany({
      where: {
        organizationId: dbOrgId,
        isRecurring: true,
        isPaused: false,
        nextDueDate: { lte: in7Days },
      },
      select: {
        id: true,
        name: true,
        recurrenceFrequency: true,
        nextDueDate: true,
        defaultAssignee: { select: { firstName: true, lastName: true } },
      },
      orderBy: { nextDueDate: "asc" },
      take: 5,
    })
  } catch {
    return null
  }

  if (schedules.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Checklists</CardTitle>
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-3">{schedules.length}</div>
        <div className="space-y-2">
          {schedules.map((s) => {
            const freqLabel = s.recurrenceFrequency
              ? RECURRENCE_FREQUENCIES[s.recurrenceFrequency as keyof typeof RECURRENCE_FREQUENCIES]?.label ?? s.recurrenceFrequency
              : ""

            return (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {freqLabel}
                    {s.nextDueDate && ` · ${formatDistanceToNow(new Date(s.nextDueDate), { addSuffix: true })}`}
                    {s.defaultAssignee && ` · ${s.defaultAssignee.firstName} ${s.defaultAssignee.lastName}`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
