"use client"

import { useTransition } from "react"
import { FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { generateInvoice } from "../actions"

export function GenerateInvoiceButton() {
  const [pending, startTransition] = useTransition()

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateInvoice()
      if (result.success) {
        toast.success("Invoice generated successfully")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button size="sm" onClick={handleGenerate} disabled={pending}>
      <FileText className="mr-1 h-4 w-4" />
      {pending ? "Generating..." : "Generate Invoice"}
    </Button>
  )
}
