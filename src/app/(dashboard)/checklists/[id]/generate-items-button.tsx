"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateItemsFromStandard } from "../actions"

export function GenerateItemsButton({ checklistId }: { checklistId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateItemsFromStandard(checklistId)
      if (result.success) {
        toast.success("Items generated from standard clauses")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button onClick={handleGenerate} disabled={isPending} variant="outline" size="sm">
      <Sparkles className="mr-2 h-4 w-4" />
      {isPending ? "Generating..." : "Generate from Standard"}
    </Button>
  )
}
