"use client"

import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { IntegrationScore } from "@/lib/ims/types"

interface IntegrationScoreCardProps {
  score: IntegrationScore
}

export function IntegrationScoreCard({ score }: IntegrationScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Integration Efficiency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{score.efficiencyPercent}%</div>
            <p className="text-sm text-muted-foreground">Efficiency</p>
          </div>
          <div className="flex-1 space-y-2">
            <Progress value={score.efficiencyPercent} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{score.totalClauses} total clauses</span>
              <span>{score.uniqueRequirements} unique requirements</span>
            </div>
          </div>
        </div>

        {score.savings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Shared Requirements by HLS Group</h4>
            <div className="space-y-2">
              {score.savings.slice(0, 10).map((saving, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      HLS {saving.hlsGroup}
                    </Badge>
                    <span className="text-sm">
                      {saving.rawCount} clauses shared across {saving.standards.length} standards
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {saving.standards.map((std) => (
                      <Badge key={std} variant="secondary" className="text-[10px]">
                        {std}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {score.savings.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No cross-standard equivalences found. Add cross-references to see integration savings.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
