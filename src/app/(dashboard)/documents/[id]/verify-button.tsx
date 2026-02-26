"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyClassification } from "../actions"

interface VerifyButtonProps {
  documentId: string
  classificationId: string
}

export function VerifyButton({ documentId, classificationId }: VerifyButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleVerify() {
    startTransition(async () => {
      const result = await verifyClassification(documentId, classificationId)
      if (result.success) {
        toast.success("Classification verified")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleVerify} disabled={isPending}>
      <Check className="mr-1 h-3 w-3" />
      Verify
    </Button>
  )
}
