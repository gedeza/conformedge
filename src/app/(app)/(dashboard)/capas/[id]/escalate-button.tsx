"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { ArrowUpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { escalateCapa } from "../actions"

interface EscalateButtonProps {
  capaId: string
  currentPriority: string
}

const NEXT_PRIORITY: Record<string, string> = {
  LOW: "MEDIUM",
  MEDIUM: "HIGH",
  HIGH: "CRITICAL",
}

export function EscalateButton({ capaId, currentPriority }: EscalateButtonProps) {
  const [isPending, startTransition] = useTransition()
  const nextPriority = NEXT_PRIORITY[currentPriority]

  if (!nextPriority) return null

  function handleEscalate() {
    startTransition(async () => {
      const result = await escalateCapa(capaId)
      if (result.success) {
        toast.success(`CAPA escalated to ${nextPriority}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleEscalate}
      disabled={isPending}
    >
      <ArrowUpCircle className="mr-2 h-4 w-4" />
      {isPending ? "Escalating..." : `Escalate to ${nextPriority}`}
    </Button>
  )
}
