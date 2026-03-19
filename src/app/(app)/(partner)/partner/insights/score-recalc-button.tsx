"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { recalculatePartnerScore } from "./actions"

export function ScoreRecalcButton() {
  const [isPending, startTransition] = useTransition()

  function handleRecalc() {
    startTransition(async () => {
      const result = await recalculatePartnerScore()
      if (result.success) {
        toast.success("Partner score recalculated")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRecalc} disabled={isPending}>
      <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Calculating..." : "Recalculate"}
    </Button>
  )
}
