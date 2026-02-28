"use client"

import { useState, useTransition } from "react"
import { ChevronRight, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { MAPPING_TYPE_COLORS } from "@/lib/constants"
import { getClauseCrossReferences, type CrossRefItem } from "../gap-analysis/cross-ref-actions"
import type {
  CrossReferenceMatrixData,
  StandardOverlapData,
  MatrixCrossRef,
} from "./actions"

interface Props {
  matrixData: CrossReferenceMatrixData
  overlapData: StandardOverlapData
}

// HLS clause numbers 4-10 with their standard titles
const HLS_CLAUSES = [
  { number: "4", title: "Context of the Organization" },
  { number: "5", title: "Leadership" },
  { number: "6", title: "Planning" },
  { number: "7", title: "Support" },
  { number: "8", title: "Operation" },
  { number: "9", title: "Performance Evaluation" },
  { number: "10", title: "Improvement" },
]

type MappingType = "EQUIVALENT" | "RELATED" | "SUPPORTING"

function getMappingDotClass(type: MappingType) {
  return MAPPING_TYPE_COLORS[type].dot
}

function getMappingBadgeClass(type: MappingType) {
  return MAPPING_TYPE_COLORS[type].badge
}

export function CrossRefBrowser({ matrixData, overlapData }: Props) {
  return (
    <Tabs defaultValue="matrix" className="space-y-4">
      <TabsList>
        <TabsTrigger value="matrix">Cross-Reference Matrix</TabsTrigger>
        <TabsTrigger value="overlap">Standard Overlap</TabsTrigger>
      </TabsList>

      <TabsContent value="matrix" className="space-y-4">
        <MatrixTab data={matrixData} />
      </TabsContent>

      <TabsContent value="overlap" className="space-y-4">
        <OverlapTab data={overlapData} />
      </TabsContent>
    </Tabs>
  )
}

/* ------------------------------------------------------------------ */
/* Tab 1: Cross-Reference Matrix                                       */
/* ------------------------------------------------------------------ */

function MatrixTab({ data }: { data: CrossReferenceMatrixData }) {
  const [expandedClause, setExpandedClause] = useState<string | null>(null)
  const [clauseRefs, setClauseRefs] = useState<CrossRefItem[] | null>(null)
  const [pending, startTransition] = useTransition()

  const { standards, clauses, crossRefs } = data

  // Build a lookup: for each HLS clause number + standard code → clause id + cross-ref types
  const clauseMap = new Map<string, typeof clauses[0]>()
  for (const c of clauses) {
    clauseMap.set(`${c.number}|${c.standardCode}`, c)
  }

  // Build cross-ref lookup: clauseId → set of { targetStandardCode, mappingType }
  const refsByClause = new Map<string, { standardCode: string; type: MappingType }[]>()
  for (const ref of crossRefs) {
    // Source clause has cross-ref to target standard
    if (!refsByClause.has(ref.sourceClauseId)) refsByClause.set(ref.sourceClauseId, [])
    refsByClause.get(ref.sourceClauseId)!.push({
      standardCode: ref.targetStandardCode,
      type: ref.mappingType,
    })
    // Target clause has cross-ref to source standard
    if (!refsByClause.has(ref.targetClauseId)) refsByClause.set(ref.targetClauseId, [])
    refsByClause.get(ref.targetClauseId)!.push({
      standardCode: ref.sourceStandardCode,
      type: ref.mappingType,
    })
  }

  function handleExpandClause(clauseNumber: string) {
    if (expandedClause === clauseNumber) {
      setExpandedClause(null)
      setClauseRefs(null)
      return
    }

    setExpandedClause(clauseNumber)
    setClauseRefs(null)

    // Find the first clause with this number (e.g., ISO 9001 clause 4) to load refs
    const firstClause = clauses.find((c) => c.number === clauseNumber)
    if (!firstClause) return

    startTransition(async () => {
      const refs = await getClauseCrossReferences(firstClause.id)
      setClauseRefs(refs)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">HLS Clause Coverage Across Standards</CardTitle>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className={cn("inline-block h-2.5 w-2.5 rounded-full", MAPPING_TYPE_COLORS.EQUIVALENT.dot)} />
            Equivalent
          </span>
          <span className="flex items-center gap-1.5">
            <span className={cn("inline-block h-2.5 w-2.5 rounded-full", MAPPING_TYPE_COLORS.RELATED.dot)} />
            Related
          </span>
          <span className="flex items-center gap-1.5">
            <span className={cn("inline-block h-2.5 w-2.5 rounded-full", MAPPING_TYPE_COLORS.SUPPORTING.dot)} />
            Supporting
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[640px]">
            {/* Header row with standard codes */}
            <div className="grid gap-0" style={{ gridTemplateColumns: `200px repeat(${standards.length}, 1fr)` }}>
              <div className="p-2 text-xs font-medium text-muted-foreground border-b">
                Clause
              </div>
              {standards.map((std) => (
                <TooltipProvider key={std.code} delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-2 text-xs font-medium text-center border-b truncate cursor-help">
                        {std.code}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{std.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

              {/* Clause rows */}
              {HLS_CLAUSES.map((hls) => {
                const isExpanded = expandedClause === hls.number

                return (
                  <div key={hls.number} className="contents">
                    {/* Clause label */}
                    <button
                      onClick={() => handleExpandClause(hls.number)}
                      className={cn(
                        "flex items-center gap-1.5 p-2 text-xs text-left hover:bg-muted/50 transition-colors border-b",
                        isExpanded && "bg-muted/50 font-medium"
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "h-3 w-3 shrink-0 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                      <span className="font-mono mr-1">{hls.number}</span>
                      <span className="truncate">{hls.title}</span>
                    </button>

                    {/* Standard cells */}
                    {standards.map((std) => {
                      const clause = clauseMap.get(`${hls.number}|${std.code}`)
                      if (!clause) {
                        return (
                          <div
                            key={std.code}
                            className="flex items-center justify-center p-2 border-b bg-muted/20"
                          >
                            <span className="text-xs text-muted-foreground/50">—</span>
                          </div>
                        )
                      }

                      // Get cross-refs from this clause to other standards
                      const refs = refsByClause.get(clause.id) || []
                      // Unique mapping types found
                      const types = [...new Set(refs.map((r) => r.type))]
                      // Sort: EQUIVALENT → RELATED → SUPPORTING
                      const ORDER: Record<string, number> = { EQUIVALENT: 0, RELATED: 1, SUPPORTING: 2 }
                      types.sort((a, b) => (ORDER[a] ?? 3) - (ORDER[b] ?? 3))

                      return (
                        <TooltipProvider key={std.code} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "flex items-center justify-center gap-1 p-2 border-b cursor-help",
                                  isExpanded && "bg-muted/30"
                                )}
                              >
                                {types.length > 0 ? (
                                  types.map((type) => (
                                    <span
                                      key={type}
                                      className={cn(
                                        "inline-block h-2.5 w-2.5 rounded-full",
                                        getMappingDotClass(type)
                                      )}
                                    />
                                  ))
                                ) : (
                                  <span className={cn("inline-block h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-gray-700")} />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">
                                {std.code} — Clause {clause.number}
                              </p>
                              <p className="text-xs text-muted-foreground">{clause.title}</p>
                              {refs.length > 0 && (
                                <p className="text-xs mt-1">{refs.length} cross-reference{refs.length !== 1 && "s"}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <div
                        className="col-span-full border-b bg-muted/10 p-3"
                        style={{ gridColumn: `1 / -1` }}
                      >
                        {pending && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading cross-references...
                          </div>
                        )}
                        {clauseRefs && clauseRefs.length === 0 && (
                          <p className="text-xs text-muted-foreground">No cross-references for this clause.</p>
                        )}
                        {clauseRefs && clauseRefs.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium">
                              Cross-references for Clause {hls.number} — {hls.title}
                            </p>
                            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                              {clauseRefs.map((ref) => (
                                <div
                                  key={ref.clauseId}
                                  className="flex items-start gap-2 p-2 rounded-md bg-background border text-xs"
                                >
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-[10px] shrink-0",
                                      getMappingBadgeClass(ref.mappingType)
                                    )}
                                  >
                                    {ref.mappingType}
                                  </Badge>
                                  <div className="min-w-0">
                                    <span className="font-mono text-muted-foreground">{ref.standardCode}</span>{" "}
                                    <span className="font-medium">{ref.clauseNumber}</span> — {ref.title}
                                    {ref.notes && (
                                      <p className="text-muted-foreground mt-0.5">{ref.notes}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Tab 2: Standard Overlap Grid                                        */
/* ------------------------------------------------------------------ */

function OverlapTab({ data }: { data: StandardOverlapData }) {
  const [selectedCell, setSelectedCell] = useState<{ a: string; b: string } | null>(null)

  const { standards, matrix, details } = data

  // Find max off-diagonal value for color scaling
  let maxCount = 0
  for (const a of standards) {
    for (const b of standards) {
      if (a.code !== b.code) {
        const count = matrix[a.code]?.[b.code] ?? 0
        if (count > maxCount) maxCount = count
      }
    }
  }

  function getIntensity(count: number, isDiagonal: boolean): string {
    if (isDiagonal) return "bg-primary/10"
    if (count === 0) return "bg-muted/30"
    const ratio = maxCount > 0 ? count / maxCount : 0
    if (ratio > 0.75) return "bg-blue-200 dark:bg-blue-900/60"
    if (ratio > 0.5) return "bg-blue-150 dark:bg-blue-900/40"
    if (ratio > 0.25) return "bg-blue-100 dark:bg-blue-900/30"
    return "bg-blue-50 dark:bg-blue-900/20"
  }

  const selectedKey = selectedCell
    ? [selectedCell.a, selectedCell.b].sort().join("|")
    : null
  const selectedRefs = selectedKey ? details[selectedKey] || [] : []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pairwise Standard Overlap</CardTitle>
          <p className="text-xs text-muted-foreground">
            Diagonal shows total top-level clauses per standard. Off-diagonal shows cross-reference count between standards. Click a cell to see details.
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="min-w-[500px]">
              <div
                className="grid gap-0.5"
                style={{
                  gridTemplateColumns: `120px repeat(${standards.length}, 1fr)`,
                }}
              >
                {/* Header row */}
                <div className="p-2" />
                {standards.map((std) => (
                  <TooltipProvider key={std.code} delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-2 text-xs font-medium text-center truncate cursor-help">
                          {std.code}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{std.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}

                {/* Data rows */}
                {standards.map((rowStd) => (
                  <div key={rowStd.code} className="contents">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-2 text-xs font-medium truncate cursor-help flex items-center">
                            {rowStd.code}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p className="text-xs">{rowStd.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {standards.map((colStd) => {
                      const count = matrix[rowStd.code]?.[colStd.code] ?? 0
                      const isDiagonal = rowStd.code === colStd.code
                      const isSelected =
                        selectedCell?.a === rowStd.code && selectedCell?.b === colStd.code

                      return (
                        <button
                          key={colStd.code}
                          onClick={() => {
                            if (isDiagonal) return
                            if (isSelected) {
                              setSelectedCell(null)
                            } else {
                              setSelectedCell({ a: rowStd.code, b: colStd.code })
                            }
                          }}
                          disabled={isDiagonal || count === 0}
                          className={cn(
                            "p-2 text-xs text-center rounded-sm transition-colors",
                            getIntensity(count, isDiagonal),
                            !isDiagonal && count > 0 && "hover:ring-2 hover:ring-primary/50 cursor-pointer",
                            isDiagonal && "font-semibold cursor-default",
                            isSelected && "ring-2 ring-primary"
                          )}
                        >
                          {count}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected cell detail */}
      {selectedCell && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedCell.a} ↔ {selectedCell.b} Cross-References
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {selectedRefs.length} cross-reference{selectedRefs.length !== 1 && "s"} between these standards
            </p>
          </CardHeader>
          <CardContent>
            {selectedRefs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No cross-references between these standards.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedRefs.map((ref, i) => (
                  <CrossRefDetailCard key={i} crossRef={ref} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CrossRefDetailCard({ crossRef }: { crossRef: MatrixCrossRef }) {
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-md border text-xs">
      <Badge
        variant="secondary"
        className={cn(
          "text-[10px] shrink-0",
          getMappingBadgeClass(crossRef.mappingType)
        )}
      >
        {crossRef.mappingType}
      </Badge>
      <div className="min-w-0">
        <span className="font-mono text-muted-foreground">{crossRef.sourceStandardCode}</span>
        {" → "}
        <span className="font-mono text-muted-foreground">{crossRef.targetStandardCode}</span>
        {crossRef.notes && (
          <p className="text-muted-foreground mt-0.5">{crossRef.notes}</p>
        )}
      </div>
    </div>
  )
}
