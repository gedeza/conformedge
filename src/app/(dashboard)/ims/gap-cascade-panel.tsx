"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GapCascade } from "@/lib/ims/types"
import type { CoverageStatus } from "@/app/(dashboard)/gap-analysis/gap-analysis-core"

interface GapCascadePanelProps {
  cascades: GapCascade[]
}

const STATUS_STYLES: Record<CoverageStatus, string> = {
  COVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PARTIAL: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  GAP: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const MAPPING_STYLES: Record<string, string> = {
  EQUIVALENT: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  RELATED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  SUPPORTING: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
}

export function GapCascadePanel({ cascades }: GapCascadePanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  if (cascades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Gap Cascades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No gap cascades detected. All gaps are isolated to single standards, or there are no gaps.
          </p>
        </CardContent>
      </Card>
    )
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Gap Cascades
          <Badge variant="secondary" className="ml-auto">
            {cascades.length} cascades
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {cascades.map((cascade) => {
          const isExpanded = expandedIds.has(cascade.sourceClauseId)
          return (
            <div
              key={cascade.sourceClauseId}
              className="rounded-md border"
            >
              <button
                onClick={() => toggleExpand(cascade.sourceClauseId)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {cascade.sourceStandardCode}
                  </Badge>
                  <span className="font-mono text-sm shrink-0">
                    {cascade.sourceClauseNumber}
                  </span>
                  <span className="text-sm truncate">{cascade.sourceTitle}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", STATUS_STYLES[cascade.sourceStatus])}
                  >
                    {cascade.sourceStatus}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {cascade.impactCount} standards
                  </Badge>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t px-3 pb-3 pt-2 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Affected clauses in other standards:
                  </p>
                  {cascade.targets.map((target) => (
                    <div
                      key={target.clauseId}
                      className="flex items-center justify-between rounded-sm bg-muted/30 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", MAPPING_STYLES[target.mappingType])}
                        >
                          {target.mappingType}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {target.standardCode}
                        </Badge>
                        <span className="font-mono text-xs">{target.clauseNumber}</span>
                        <span className="text-sm truncate">{target.title}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] shrink-0", STATUS_STYLES[target.status])}
                      >
                        {target.status}
                      </Badge>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/capas?source=ims&clause=${cascade.sourceClauseId}`}>
                        Create CAPA
                        <ExternalLink className="ml-1.5 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
