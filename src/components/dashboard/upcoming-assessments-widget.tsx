import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { CalendarDays, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { getUpcomingAssessments } from "@/app/(dashboard)/assessments/actions"

export async function UpcomingAssessmentsWidget() {
  let assessments: Awaited<ReturnType<typeof getUpcomingAssessments>> = []

  try {
    assessments = await getUpcomingAssessments(5)
  } catch {
    return null
  }

  if (assessments.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Assessments</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-3">{assessments.length}</div>
        <div className="space-y-2">
          {assessments.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/assessments/${a.id}`}
                  className="font-medium hover:underline truncate block"
                >
                  {a.title}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{a.standard.code}</span>
                  <span>—</span>
                  <span>
                    {a.scheduledDate
                      ? formatDistanceToNow(new Date(a.scheduledDate), { addSuffix: true })
                      : "No date"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <StatusBadge type="assessment" value="SCHEDULED" />
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/assessments/${a.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link href="/calendar">View Calendar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
