import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { Progress } from "@/components/ui/progress"
import { getAssessment } from "../actions"
import { GenerateQuestionsButton } from "./generate-questions-button"

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let assessment: Awaited<ReturnType<typeof getAssessment>>

  try {
    assessment = await getAssessment(id)
  } catch {
    notFound()
  }

  if (!assessment) notFound()

  const totalQuestions = assessment.questions.length
  const answeredQuestions = assessment.questions.filter(
    (q) => q.answers.length > 0 && q.answers[0].score !== null
  ).length
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/assessments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader heading={assessment.title} description={assessment.description ?? undefined}>
        <div className="flex items-center gap-2">
          {assessment.riskLevel && <StatusBadge type="risk" value={assessment.riskLevel} />}
          {totalQuestions > 0 && (
            <Button asChild>
              <Link href={`/assessments/${id}/conduct`}>
                <Play className="mr-2 h-4 w-4" />
                {answeredQuestions > 0 ? "Continue" : "Start"} Assessment
              </Link>
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessment.overallScore !== null ? `${assessment.overallScore.toFixed(1)}%` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment.riskLevel ? (
              <StatusBadge type="risk" value={assessment.riskLevel} />
            ) : (
              <span className="text-2xl font-bold">—</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{answeredQuestions}/{totalQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Standard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{assessment.standard.code}</div>
            <p className="text-xs text-muted-foreground">{assessment.standard.name}</p>
          </CardContent>
        </Card>
      </div>

      {totalQuestions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{progress.toFixed(0)}% complete</p>
          </CardContent>
        </Card>
      )}

      {totalQuestions === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No questions generated yet. Generate questions from the standard clauses to begin.</p>
            <GenerateQuestionsButton assessmentId={assessment.id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Assessor</span>
              <p className="mt-1 font-medium">{assessment.assessor.firstName} {assessment.assessor.lastName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Project</span>
              <p className="mt-1 font-medium">
                {assessment.project ? (
                  <Link href={`/projects/${assessment.project.id}`} className="hover:underline">{assessment.project.name}</Link>
                ) : "None"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Scheduled</span>
              <p className="mt-1 font-medium">{assessment.scheduledDate ? format(assessment.scheduledDate, "PPP") : "Not scheduled"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Completed</span>
              <p className="mt-1 font-medium">{assessment.completedDate ? format(assessment.completedDate, "PPP") : "In progress"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
