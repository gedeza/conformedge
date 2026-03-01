"use client"

import Link from "next/link"
import { format, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { getAssessmentStatus } from "@/lib/assessment-status"
import type { CalendarAssessment } from "./calendar-view"

interface CalendarListViewProps {
  assessments: CalendarAssessment[]
  year: number
  month: number
}

export function CalendarListView({ assessments, year, month }: CalendarListViewProps) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0)

  // Get all weeks in this month
  const weeks = eachWeekOfInterval(
    { start: startOfMonth, end: endOfMonth },
    { weekStartsOn: 1 }
  )

  // Derive status and sort by date
  const enriched = assessments
    .map((a) => {
      const status = getAssessmentStatus({
        completedDate: a.completedDate ? new Date(a.completedDate) : null,
        scheduledDate: a.scheduledDate ? new Date(a.scheduledDate) : null,
        answerCount: a.answerCount,
      })
      const primaryDate = a.scheduledDate ? new Date(a.scheduledDate) : a.completedDate ? new Date(a.completedDate) : null
      return { ...a, status, primaryDate }
    })
    .filter((a) => a.primaryDate !== null)
    .sort((a, b) => a.primaryDate!.getTime() - b.primaryDate!.getTime())

  if (enriched.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No assessments scheduled for this month.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

        const weekAssessments = enriched.filter((a) => {
          const d = a.primaryDate!
          return d >= startOfWeek(weekStart, { weekStartsOn: 1 }) && d <= weekEnd
        })

        if (weekAssessments.length === 0) return null

        return (
          <Card key={weekStart.toISOString()}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {format(weekStart, "MMM d")} — {format(weekEnd, "MMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {weekAssessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/assessments/${a.id}`}
                        className="font-medium text-sm hover:underline truncate block"
                      >
                        {a.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{a.standard.code}</span>
                        <span>{a.assessor.firstName} {a.assessor.lastName}</span>
                        {a.primaryDate && <span>{format(a.primaryDate, "EEE, MMM d")}</span>}
                      </div>
                    </div>
                    <StatusBadge type="assessment" value={a.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
