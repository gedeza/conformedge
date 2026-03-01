import { PageHeader } from "@/components/shared/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCalendarAssessments } from "@/app/(dashboard)/assessments/actions"
import { CalendarView } from "./calendar-view"
import { CalendarListView } from "./calendar-list-view"
import { CalendarHelpPanel } from "./calendar-help-panel"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams
  const now = new Date()
  const year = Number(params.year) || now.getFullYear()
  const month = Number(params.month) || now.getMonth() + 1 // 1-indexed

  let assessments: Awaited<ReturnType<typeof getCalendarAssessments>> = []

  try {
    assessments = await getCalendarAssessments(year, month)
  } catch {
    // Auth error — will show empty calendar
  }

  // Serialize dates for client components
  const serialized = assessments.map((a) => ({
    id: a.id,
    title: a.title,
    scheduledDate: a.scheduledDate?.toISOString() ?? null,
    completedDate: a.completedDate?.toISOString() ?? null,
    overallScore: a.overallScore,
    riskLevel: a.riskLevel,
    standard: a.standard,
    assessor: a.assessor,
    answerCount: a.questions.filter((q) => q.answers.length > 0).length,
  }))

  return (
    <div className="space-y-6">
      <PageHeader heading="Calendar" description="View scheduled and completed assessments">
        <CalendarHelpPanel />
      </PageHeader>

      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Month View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="month" className="mt-4">
          <CalendarView assessments={serialized} year={year} month={month} />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <CalendarListView assessments={serialized} year={year} month={month} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
