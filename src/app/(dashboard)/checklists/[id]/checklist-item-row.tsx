"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Check, X, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toggleItemCompliance, updateItemEvidence } from "../actions"

interface ChecklistItemRowProps {
  item: {
    id: string
    description: string
    isCompliant: boolean | null
    evidence: string | null
    notes: string | null
    standardClause: { clauseNumber: string; title: string } | null
  }
  checklistId: string
}

export function ChecklistItemRow({ item, checklistId }: ChecklistItemRowProps) {
  const [isPending, startTransition] = useTransition()
  const [showEvidence, setShowEvidence] = useState(false)
  const [evidence, setEvidence] = useState(item.evidence ?? "")

  function handleToggle(value: boolean | null) {
    startTransition(async () => {
      const result = await toggleItemCompliance(item.id, checklistId, value)
      if (!result.success) toast.error(result.error)
    })
  }

  function handleSaveEvidence() {
    startTransition(async () => {
      const result = await updateItemEvidence(item.id, checklistId, evidence)
      if (result.success) {
        toast.success("Evidence saved")
        setShowEvidence(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">{item.description}</p>
          {item.standardClause && (
            <p className="text-xs text-muted-foreground">
              Clause {item.standardClause.clauseNumber}: {item.standardClause.title}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => handleToggle(true)}
            className={cn(
              "h-8 w-8 p-0",
              item.isCompliant === true && "bg-green-100 text-green-800 hover:bg-green-200"
            )}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => handleToggle(false)}
            className={cn(
              "h-8 w-8 p-0",
              item.isCompliant === false && "bg-red-100 text-red-800 hover:bg-red-200"
            )}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => handleToggle(null)}
            className={cn(
              "h-8 w-8 p-0",
              item.isCompliant === null && "bg-gray-100 text-gray-800 hover:bg-gray-200"
            )}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEvidence(!showEvidence)}
            className="ml-2 text-xs"
          >
            Evidence
          </Button>
        </div>
      </div>
      {showEvidence && (
        <div className="flex gap-2 items-end">
          <Textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Add evidence or references..."
            rows={2}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSaveEvidence} disabled={isPending}>
            Save
          </Button>
        </div>
      )}
    </div>
  )
}
