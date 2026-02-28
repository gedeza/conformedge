import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { getAssessment } from "../../actions"
import { ConductForm } from "./conduct-form"
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

  const questions = assessment.questions.map((q) => ({
    id: q.id,
    question: q.question,
    guidance: q.guidance,
    existingAnswer: q.answers[0] ? {
      answer: q.answers[0].answer,
      score: q.answers[0].score,
      evidence: q.answers[0].evidence,
      notes: q.answers[0].notes,
    } : undefined,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
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

      <ConductForm questions={questions} initialAnswered={answeredQuestions} />
    </div>
  )
}
