"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, Plus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { linkCapaToStandardClauses, unlinkCapaFromStandardClause } from "./actions"
import type { CoverageStatus } from "@/app/(dashboard)/gap-analysis/gap-analysis-core"

interface LinkedClause {
  id: string
  standardClause: {
    id: string
    clauseNumber: string
    title: string
    standard: { code: string; name: string }
  }
}

interface EquivalentGap {
  clauseId: string
  clauseNumber: string
  title: string
  standardCode: string
  standardName: string
  status: CoverageStatus
  mappingType: "EQUIVALENT" | "RELATED" | "SUPPORTING"
}

interface CrossStandardGapsProps {
  capaId: string
  linkedClauses: LinkedClause[]
  equivalentGaps: EquivalentGap[]
}

const STATUS_STYLES: Record<CoverageStatus, string> = {
  COVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PARTIAL: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  GAP: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export function CrossStandardGaps({
  capaId,
  linkedClauses,
  equivalentGaps,
}: CrossStandardGapsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const linkedClauseIds = new Set(linkedClauses.map((lc) => lc.standardClause.id))

  // Filter out already-linked clauses from suggestions
  const unlinkedGaps = equivalentGaps.filter((g) => !linkedClauseIds.has(g.clauseId))

  const toggleSelect = (clauseId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(clauseId)) next.delete(clauseId)
      else next.add(clauseId)
      return next
    })
  }

  const handleLinkSelected = () => {
    if (selected.size === 0) return
    startTransition(async () => {
      const result = await linkCapaToStandardClauses(capaId, Array.from(selected))
      if (result.success) {
        toast.success(`Linked ${selected.size} clause(s) to this CAPA`)
        setSelected(new Set())
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleUnlink = (clauseId: string) => {
    startTransition(async () => {
      const result = await unlinkCapaFromStandardClause(capaId, clauseId)
      if (result.success) {
        toast.success("Clause unlinked")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Cross-Standard Coverage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linked clauses */}
        {linkedClauses.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Linked Standard Clauses</h4>
            <div className="space-y-2">
              {linkedClauses.map((lc) => (
                <div
                  key={lc.id}
                  className="flex items-center justify-between rounded-md border p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {lc.standardClause.standard.code}
                    </Badge>
                    <span className="font-mono text-xs">{lc.standardClause.clauseNumber}</span>
                    <span className="text-sm">{lc.standardClause.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlink(lc.standardClause.id)}
                    disabled={isPending}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Unlink
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested equivalent gaps */}
        {unlinkedGaps.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Related Gaps in Other Standards</h4>
              {selected.size > 0 && (
                <Button
                  size="sm"
                  onClick={handleLinkSelected}
                  disabled={isPending}
                >
                  <Plus className="mr-1.5 h-3 w-3" />
                  Link {selected.size} selected
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {unlinkedGaps.map((gap) => (
                <label
                  key={gap.clauseId}
                  className="flex items-center gap-3 rounded-md border p-2.5 cursor-pointer hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selected.has(gap.clauseId)}
                    onCheckedChange={() => toggleSelect(gap.clauseId)}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge variant="outline" className="text-[10px]">
                      {gap.standardCode}
                    </Badge>
                    <span className="font-mono text-xs">{gap.clauseNumber}</span>
                    <span className="text-sm truncate">{gap.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLES[gap.status])}>
                      {gap.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {gap.mappingType}
                    </Badge>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {linkedClauses.length === 0 && unlinkedGaps.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No cross-standard references found for the clauses linked to this CAPA.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
