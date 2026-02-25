"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { removeClauseTag } from "../actions"

interface RemoveTagButtonProps {
  documentId: string
  classificationId: string
}

export function RemoveTagButton({ documentId, classificationId }: RemoveTagButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      const result = await removeClauseTag(documentId, classificationId)
      if (result.success) {
        toast.success("Tag removed")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleRemove} disabled={isPending}>
      <X className="h-4 w-4" />
    </Button>
  )
}
