"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GapInsight } from "@/lib/gap-detection"

interface GapInsightsPanelProps {
  insights: GapInsight[]
}

function StandardSection({
  insight,
  defaultExpanded,
}: {
  insight: GapInsight
  defaultExpanded: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <span className="font-medium text-sm">{insight.standardCode}</span>
            <span className="text-xs text-muted-foreground ml-2">{insight.standardName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {insight.coveragePercent}%
            </Badge>
            {insight.gaps > 0 && (
              <Badge variant="destructive" className="text-xs">
                {insight.gaps} gap{insight.gaps !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          <Progress value={insight.coveragePercent} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {insight.covered} covered, {insight.partial} partial, {insight.gaps} gaps of {insight.totalClauses} clauses
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Clauses covered by this document */}
            {insight.coveredByThisDoc.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-green-700">
                  Covered by this document
                </p>
                {insight.coveredByThisDoc.map((c) => (
                  <div
                    key={c.clauseNumber}
                    className="flex items-start gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                    <span>
                      <span className="font-medium">{c.clauseNumber}</span>{" "}
                      {c.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Remaining gaps */}
            {insight.remainingGaps.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-red-700">
                  Remaining gaps
                </p>
                {insight.remainingGaps.slice(0, 5).map((c) => (
                  <div
                    key={c.clauseNumber}
                    className="flex items-start gap-1.5 text-xs"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <span>
                      <span className="font-medium">{c.clauseNumber}</span>{" "}
                      {c.title}
                    </span>
                  </div>
                ))}
                {insight.remainingGaps.length > 5 && (
                  <p className="text-xs text-muted-foreground pl-5">
                    +{insight.remainingGaps.length - 5} more gaps
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-1">
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
              <Link href={`/gap-analysis?standard=${insight.standardCode}`}>
                View full gap analysis <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function GapInsightsPanel({ insights }: GapInsightsPanelProps) {
  if (insights.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gap Coverage Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight) => (
          <StandardSection
            key={insight.standardCode}
            insight={insight}
            defaultExpanded={insights.length === 1}
          />
        ))}
      </CardContent>
    </Card>
  )
}
