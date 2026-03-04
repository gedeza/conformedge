"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateQuestionsFromStandard } from "../actions"

export function GenerateQuestionsButton({ assessmentId }: { assessmentId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateQuestionsFromStandard(assessmentId)
      if (result.success) {
        toast.success("Questions generated from standard clauses")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button onClick={handleGenerate} disabled={isPending}>
      <Sparkles className="mr-2 h-4 w-4" />
      {isPending ? "Generating..." : "Generate Questions"}
    </Button>
  )
}
