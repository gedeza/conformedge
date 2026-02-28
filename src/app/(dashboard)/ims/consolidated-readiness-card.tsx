"use client"

import { ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ConsolidatedReadiness } from "@/lib/ims/types"

interface ConsolidatedReadinessCardProps {
  readiness: ConsolidatedReadiness
}

export function ConsolidatedReadinessCard({ readiness }: ConsolidatedReadinessCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Consolidated Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{readiness.weightedScore}%</div>
            <p className="text-sm text-muted-foreground">Weighted Score</p>
          </div>
          <div className="flex-1 space-y-2">
            <Progress value={readiness.weightedScore} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Deduplicated: {readiness.deduplicatedCoverage}%</span>
              <span>Raw: {readiness.rawCoverage}%</span>
            </div>
          </div>
        </div>

        {readiness.standards.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Per-Standard Breakdown</h4>
            <div className="space-y-3">
              {readiness.standards.map((std) => (
                <div key={std.standardCode} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{std.standardCode}</span>
                    <span className="text-muted-foreground">
                      {std.covered}/{std.totalClauses} covered
                      {std.partial > 0 && ` · ${std.partial} partial`}
                      {std.gaps > 0 && ` · ${std.gaps} gaps`}
                    </span>
                  </div>
                  <Progress value={std.rawCoverage} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
