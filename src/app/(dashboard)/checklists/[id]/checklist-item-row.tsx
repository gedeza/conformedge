"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Check, X, Minus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FIELD_TYPES } from "@/lib/constants"
import { toggleItemCompliance, updateItemEvidence, raiseCapaFromItem } from "../actions"
import { FieldRenderer } from "./field-renderer"

interface ChecklistItemRowProps {
  item: {
    id: string
    description: string
    isCompliant: boolean | null
    evidence: string | null
    notes: string | null
    fieldType: string | null
    fieldConfig: Record<string, unknown> | null
    response: Record<string, unknown> | null
    standardClause: { clauseNumber: string; title: string; description: string | null } | null
    capa: { id: string; title: string; status: string; priority: string } | null
  }
  checklistId: string
}

export function ChecklistItemRow({ item, checklistId }: ChecklistItemRowProps) {
  const [isPending, startTransition] = useTransition()
  const [showEvidence, setShowEvidence] = useState(false)
  const [evidence, setEvidence] = useState(item.evidence ?? "")

  const isCustomField = item.fieldType && item.fieldType !== "COMPLIANCE"
  const fieldLabel = item.fieldType ? FIELD_TYPES[item.fieldType as keyof typeof FIELD_TYPES]?.label : null

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

  function handleRaiseCapa() {
    startTransition(async () => {
      const result = await raiseCapaFromItem(item.id, checklistId)
      if (result.success) {
        toast.success("CAPA raised successfully", {
          action: {
            label: "View CAPA",
            onClick: () => window.location.assign(`/capas/${result.data!.capaId}`),
          },
        })
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{item.description}</p>
            {isCustomField && fieldLabel && (
              <Badge variant="secondary" className="text-[10px]">{fieldLabel}</Badge>
            )}
          </div>
          {item.standardClause && (
            <div>
              <p className="text-xs text-muted-foreground">
                Clause {item.standardClause.clauseNumber}: {item.standardClause.title}
              </p>
              {item.standardClause.description && (
                <p className="text-xs text-muted-foreground/70 line-clamp-1">
                  {item.standardClause.description}
                </p>
              )}
            </div>
          )}
          {item.capa && (
            <Link href={`/capas/${item.capa.id}`} className="inline-flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-[10px] gap-1 hover:bg-accent">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                CAPA: {item.capa.title.slice(0, 40)}{item.capa.title.length > 40 ? "..." : ""}
                <span className="text-muted-foreground">({item.capa.status})</span>
              </Badge>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isCustomField ? (
            <FieldRenderer
              itemId={item.id}
              checklistId={checklistId}
              fieldType={item.fieldType!}
              fieldConfig={item.fieldConfig}
              response={item.response}
            />
          ) : (
            <>
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
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEvidence(!showEvidence)}
            className="ml-2 text-xs"
          >
            Evidence
          </Button>
          {!isCustomField && item.isCompliant === false && !item.capa && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRaiseCapa}
              disabled={isPending}
              className="ml-1 text-xs"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Raise CAPA
            </Button>
          )}
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
