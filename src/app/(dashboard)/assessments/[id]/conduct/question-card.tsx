"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { saveAnswer } from "../../actions"

interface QuestionCardProps {
  questionId: string
  number: number
  question: string
  guidance: string | null
  existingAnswer?: {
    answer: string | null
    score: number | null
    evidence: string | null
    notes: string | null
  }
}

const SCORE_OPTIONS = [
  { value: "0", label: "0 — Not Addressed" },
  { value: "1", label: "1 — Minimal" },
  { value: "2", label: "2 — Partial" },
  { value: "3", label: "3 — Adequate" },
  { value: "4", label: "4 — Good" },
  { value: "5", label: "5 — Excellent" },
]

export function QuestionCard({ questionId, number, question, guidance, existingAnswer }: QuestionCardProps) {
  const [isPending, startTransition] = useTransition()
  const [score, setScore] = useState<string>(existingAnswer?.score?.toString() ?? "")
  const [answer, setAnswer] = useState(existingAnswer?.answer ?? "")
  const [evidence, setEvidence] = useState(existingAnswer?.evidence ?? "")
  const [notes, setNotes] = useState(existingAnswer?.notes ?? "")
  const [saved, setSaved] = useState(!!existingAnswer?.score)

  function handleSave() {
    startTransition(async () => {
      const result = await saveAnswer(questionId, {
        answer: answer || undefined,
        score: score ? parseInt(score) : undefined,
        evidence: evidence || undefined,
        notes: notes || undefined,
      })

      if (result.success) {
        toast.success(`Question ${number} saved`)
        setSaved(true)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card className={saved ? "border-green-200" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            <span className="text-muted-foreground mr-2">Q{number}.</span>
            {question}
          </CardTitle>
          {saved && <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Saved</Badge>}
        </div>
        {guidance && <p className="text-sm text-muted-foreground">{guidance}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Score (0-5)</Label>
          <RadioGroup value={score} onValueChange={setScore} className="flex flex-wrap gap-2">
            {SCORE_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-1">
                <RadioGroupItem value={opt.value} id={`${questionId}-${opt.value}`} />
                <Label htmlFor={`${questionId}-${opt.value}`} className="text-xs cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Answer</Label>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="How does the organization address this?"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Evidence</Label>
            <Textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="References, document IDs..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional observations..."
              rows={2}
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? "Saving..." : "Save Answer"}
        </Button>
      </CardContent>
    </Card>
  )
}
