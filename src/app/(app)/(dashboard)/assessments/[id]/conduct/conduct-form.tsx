"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QuestionCard } from "./question-card"

interface Question {
  id: string
  question: string
  guidance: string | null
  existingAnswer?: {
    answer: string | null
    score: number | null
    evidence: string | null
    notes: string | null
  }
}

interface ConductFormProps {
  questions: Question[]
  initialAnswered: number
}

export function ConductForm({ questions, initialAnswered }: ConductFormProps) {
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    questions.forEach((q) => {
      if (q.existingAnswer?.score != null) ids.add(q.id)
    })
    return ids
  })

  const totalQuestions = questions.length
  const answeredCount = answeredIds.size
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  function handleSaved(questionId: string) {
    setAnsweredIds((prev) => new Set(prev).add(questionId))
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{progress.toFixed(0)}% Complete</span>
            <span className="text-sm text-muted-foreground">{answeredCount}/{totalQuestions}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            questionId={question.id}
            number={index + 1}
            question={question.question}
            guidance={question.guidance}
            existingAnswer={question.existingAnswer ?? undefined}
            onSaved={() => handleSaved(question.id)}
          />
        ))}
      </div>
    </>
  )
}
