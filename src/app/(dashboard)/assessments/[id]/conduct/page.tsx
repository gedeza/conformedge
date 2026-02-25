import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/page-header"
import { getAssessment } from "../../actions"
import { QuestionCard } from "./question-card"
import { CalculateScoreButton } from "./calculate-score-button"

export default async function ConductAssessmentPage({
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
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/assessments/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Link>
        </Button>
      </div>

      <PageHeader
        heading={`Conduct: ${assessment.title}`}
        description={`${assessment.standard.code} — ${answeredQuestions}/${totalQuestions} questions answered`}
      >
        <CalculateScoreButton assessmentId={id} disabled={answeredQuestions === 0} />
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{progress.toFixed(0)}% Complete</span>
            <span className="text-sm text-muted-foreground">{answeredQuestions}/{totalQuestions}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {assessment.questions.map((question, index) => {
          const existingAnswer = question.answers[0]
          return (
            <QuestionCard
              key={question.id}
              questionId={question.id}
              number={index + 1}
              question={question.question}
              guidance={question.guidance}
              existingAnswer={existingAnswer ? {
                answer: existingAnswer.answer,
                score: existingAnswer.score,
                evidence: existingAnswer.evidence,
                notes: existingAnswer.notes,
              } : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
