"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { compileAuditPack } from "../actions"

export function CompileButton({ auditPackId }: { auditPackId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleCompile() {
    startTransition(async () => {
      const result = await compileAuditPack(auditPackId)
      if (result.success) {
        toast.success("Audit pack compiled and ready for download")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button onClick={handleCompile} disabled={isPending}>
      <FileCheck className="mr-2 h-4 w-4" />
      {isPending ? "Compiling..." : "Compile"}
    </Button>
  )
}
