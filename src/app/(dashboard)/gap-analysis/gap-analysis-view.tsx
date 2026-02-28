"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ChevronRight, FileText, ListChecks } from "lucide-react"
import { CrossRefPopover } from "./cross-ref-popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { GapAnalysisSummary, CoverageStatus, TopLevelClauseGap, ClauseGapData } from "./actions"

interface Props {
  data: GapAnalysisSummary
  standards: { code: string; name: string }[]
  projects: { id: string; name: string }[]
  currentStandard?: string
  currentProject?: string
}

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
        {clause.crossRefCount > 0 && (
          <CrossRefPopover clauseId={clause.clauseId} count={clause.crossRefCount} />
        )}
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

  // Skip rendering if no children
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

export function GapAnalysisView({ data, standards, projects, currentStandard, currentProject }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/gap-analysis?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={currentStandard || "all"}
          onValueChange={(v) => updateFilter("standard", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All standards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All standards</SelectItem>
            {standards.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentProject || "all"}
          onValueChange={(v) => updateFilter("project", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Standard cards */}
      {data.standards.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No standards found. Ensure ISO standards are seeded in the database.
          </CardContent>
        </Card>
      ) : (
        data.standards.map((standard) => (
          <StandardCard key={standard.standardId} standard={standard} />
        ))
      )}
    </div>
  )
}
