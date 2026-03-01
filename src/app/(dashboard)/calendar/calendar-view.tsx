"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { StatusBadge } from "@/components/shared/status-badge"
import { getAssessmentStatus, type AssessmentDerivedStatus } from "@/lib/assessment-status"
import { ASSESSMENT_STATUSES } from "@/lib/constants"

export interface CalendarAssessment {
  id: string
  title: string
  scheduledDate: string | null
  completedDate: string | null
  overallScore: number | null
  riskLevel: string | null
  standard: { id: string; code: string; name: string }
  assessor: { id: string; firstName: string; lastName: string }
  answerCount: number
}

interface CalendarViewProps {
  assessments: CalendarAssessment[]
  year: number
  month: number
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const STATUS_DOT_COLORS: Record<AssessmentDerivedStatus, string> = {
  DRAFT: "bg-gray-400",
  SCHEDULED: "bg-blue-500",
  IN_PROGRESS: "bg-yellow-500",
  COMPLETED: "bg-green-500",
  OVERDUE: "bg-red-500",
}

function getMonthName(month: number) {
  return new Date(2024, month - 1).toLocaleString("en-US", { month: "long" })
}

export function CalendarView({ assessments, year, month }: CalendarViewProps) {
  const router = useRouter()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

  // Calculate grid
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  // Monday=0, Sunday=6
  const startDayOfWeek = (firstDay.getDay() + 6) % 7

  // Group assessments by day
  const assessmentsByDay = new Map<number, (CalendarAssessment & { status: AssessmentDerivedStatus })[]>()

  for (const a of assessments) {
    const date = a.scheduledDate ? new Date(a.scheduledDate) : a.completedDate ? new Date(a.completedDate) : null
    if (!date) continue

    const day = date.getDate()
    const dateMonth = date.getMonth() + 1
    const dateYear = date.getFullYear()

    if (dateMonth !== month || dateYear !== year) continue

    const status = getAssessmentStatus({
      completedDate: a.completedDate ? new Date(a.completedDate) : null,
      scheduledDate: a.scheduledDate ? new Date(a.scheduledDate) : null,
      answerCount: a.answerCount,
    })

    const existing = assessmentsByDay.get(day) ?? []
    existing.push({ ...a, status })
    assessmentsByDay.set(day, existing)
  }

  function navigate(dir: -1 | 1) {
    let newMonth = month + dir
    let newYear = year
    if (newMonth < 1) { newMonth = 12; newYear-- }
    if (newMonth > 12) { newMonth = 1; newYear++ }
    router.push(`/calendar?year=${newYear}&month=${newMonth}`)
  }

  function goToToday() {
    const now = new Date()
    router.push(`/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`)
  }

  // Build grid cells
  const cells: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <Card>
      <CardContent className="p-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[180px] text-center">
              {getMonthName(month)} {year}
            </h2>
            <Button variant="outline" size="icon" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          {Object.entries(ASSESSMENT_STATUSES).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT_COLORS[key as AssessmentDerivedStatus]}`} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px bg-muted rounded-t-md overflow-hidden">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="bg-muted px-2 py-2 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-muted rounded-b-md overflow-hidden">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="bg-background min-h-[80px]" />
            }

            const dayAssessments = assessmentsByDay.get(day) ?? []
            const isToday = `${year}-${month}-${day}` === todayStr

            return (
              <div
                key={day}
                className={`bg-background min-h-[80px] p-1.5 ${isToday ? "ring-2 ring-inset ring-primary/50" : ""}`}
              >
                <div className={`text-xs mb-1 ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayAssessments.slice(0, 3).map((a) => (
                    <Popover key={a.id}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 w-full text-left hover:bg-muted/50 rounded px-1 py-0.5 transition-colors">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${STATUS_DOT_COLORS[a.status]}`} />
                          <span className="text-xs truncate">{a.title}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/assessments/${a.id}`}
                              className="font-medium text-sm hover:underline truncate"
                            >
                              {a.title}
                            </Link>
                            <StatusBadge type="assessment" value={a.status} />
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Standard: {a.standard.code}</p>
                            <p>Assessor: {a.assessor.firstName} {a.assessor.lastName}</p>
                            {a.overallScore !== null && <p>Score: {a.overallScore.toFixed(1)}%</p>}
                          </div>
                          <Button size="sm" variant="outline" asChild className="w-full">
                            <Link href={`/assessments/${a.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                  {dayAssessments.length > 3 && (
                    <p className="text-xs text-muted-foreground px-1">+{dayAssessments.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
