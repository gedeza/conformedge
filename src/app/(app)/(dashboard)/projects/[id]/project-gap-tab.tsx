"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, FileText, ListChecks, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { GapAnalysisSummary, CoverageStatus, TopLevelClauseGap, ClauseGapData } from "../../gap-analysis/actions"

const STATUS_CONFIG: Record<CoverageStatus, { label: string; className: string }> = {
  COVERED: { label: "Covered", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  PARTIAL: { label: "Partial", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  GAP: { label: "Gap", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
}

function StatusBadge({ status }: { status: CoverageStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  )
}

function SubClauseRow({ clause }: { clause: ClauseGapData }) {
  return (
    <div className="flex items-center justify-between py-2 px-4 text-sm border-b last:border-b-0">
      <div className="flex-1 min-w-0 mr-4">
        <span className="font-mono text-xs text-muted-foreground mr-2">{clause.clauseNumber}</span>
        <span>{clause.title}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Verified documents">
          <FileText className="h-3 w-3" />
          <span>{clause.docCount}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Compliant checklist items">
          <ListChecks className="h-3 w-3" />
          <span>{clause.checklistCompliantCount}/{clause.checklistTotalCount}</span>
        </div>
        <StatusBadge status={clause.status} />
      </div>
    </div>
  )
}

function ClauseGroup({ clause }: { clause: TopLevelClauseGap }) {
  const [open, setOpen] = useState(false)
  if (clause.children.length === 0) return null

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 px-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="font-mono text-xs text-muted-foreground">{clause.clauseNumber}</span>
          <span className="text-sm font-medium truncate">{clause.title}</span>
        </div>
        <StatusBadge status={clause.status} />
      </button>
      {open && (
        <div className="bg-muted/20 border-t">
          {clause.children.map((child) => (
            <SubClauseRow key={child.clauseId} clause={child} />
          ))}
        </div>
      )}
    </div>
  )
}

function StandardCard({ standard }: { standard: GapAnalysisSummary["standards"][number] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle className="text-base">
              {standard.code} — {standard.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className="text-green-700 border-green-300 dark:text-green-400 dark:border-green-700">
              {standard.covered}
            </Badge>
            <Badge variant="outline" className="text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-700">
              {standard.partial}
            </Badge>
            <Badge variant="outline" className="text-red-700 border-red-300 dark:text-red-400 dark:border-red-700">
              {standard.gaps}
            </Badge>
            <span className="font-semibold w-10 text-right">{standard.coveragePercent}%</span>
          </div>
        </div>
        <Progress value={standard.coveragePercent} className="h-2 mt-2" />
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 px-0">
          <div className="border-t">
            {standard.clauses.map((clause) => (
              <ClauseGroup key={clause.clauseId} clause={clause} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function ProjectGapTab({ data }: { data: GapAnalysisSummary }) {
  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold">{data.totalSubClauses}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span className="text-green-700 dark:text-green-400 font-semibold">{data.covered} covered</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-amber-700 dark:text-amber-400 font-semibold">{data.partial} partial</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          <span className="text-red-700 dark:text-red-400 font-semibold">{data.gaps} gaps</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Project coverage</span>
          <span className="font-semibold">{data.overallCoveragePercent}%</span>
        </div>
        <Progress value={data.overallCoveragePercent} className="h-2" />
      </div>

      {/* Standard cards */}
      {data.standards.map((standard) => (
        <StandardCard key={standard.standardId} standard={standard} />
      ))}
    </div>
  )
}
