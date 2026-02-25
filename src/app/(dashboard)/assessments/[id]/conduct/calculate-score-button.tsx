"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calculateScore } from "../../actions"

export function CalculateScoreButton({ assessmentId, disabled }: { assessmentId: string; disabled: boolean }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleCalculate() {
    startTransition(async () => {
      const result = await calculateScore(assessmentId)
      if (result.success) {
        toast.success("Score calculated successfully")
        router.push(`/assessments/${assessmentId}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button onClick={handleCalculate} disabled={isPending || disabled}>
      <Calculator className="mr-2 h-4 w-4" />
      {isPending ? "Calculating..." : "Calculate Score"}
    </Button>
  )
}
