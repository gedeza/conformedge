"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { RefreshCcw, Shield, Award, AlertTriangle, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { recalculateComplianceScore, type ComplianceScore } from "../actions"

interface ComplianceScoreCardProps {
  subcontractorId: string
  initialScore: ComplianceScore
}

const TIER_CONFIG: Record<string, { color: string; label: string }> = {
  PLATINUM: { color: "bg-purple-100 text-purple-800", label: "Platinum" },
  GOLD: { color: "bg-yellow-100 text-yellow-800", label: "Gold" },
  SILVER: { color: "bg-gray-100 text-gray-800", label: "Silver" },
  BRONZE: { color: "bg-orange-100 text-orange-800", label: "Bronze" },
  UNRATED: { color: "bg-red-100 text-red-600", label: "Unrated" },
}

function ScoreBar({ label, score, max, icon: Icon }: { label: string; score: number; max: number; icon: React.ElementType }) {
  const pct = max > 0 ? (score / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{label}</span>
        </div>
        <span className="text-muted-foreground font-mono text-xs">{score}/{max}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  )
}

export function ComplianceScoreCard({ subcontractorId, initialScore }: ComplianceScoreCardProps) {
  const [score, setScore] = useState(initialScore)
  const [isPending, startTransition] = useTransition()

  function handleRecalculate() {
    startTransition(async () => {
      const result = await recalculateComplianceScore(subcontractorId)
      if (result.success && result.data) {
        setScore(result.data)
        toast.success(`Score recalculated: ${result.data.total}/100 (${result.data.tier})`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const tierInfo = TIER_CONFIG[score.tier] ?? TIER_CONFIG.UNRATED

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Compliance Score</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleRecalculate} disabled={isPending}>
          <RefreshCcw className={`mr-2 h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Calculating..." : "Recalculate"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{score.total}</div>
          <div className="space-y-1">
            <Badge className={tierInfo.color}>{tierInfo.label}</Badge>
            <p className="text-xs text-muted-foreground">out of 100</p>
          </div>
        </div>

        <div className="space-y-3">
          <ScoreBar label="Certifications" score={score.certScore} max={40} icon={BadgeCheck} />
          <ScoreBar label="Safety Rating" score={score.safetyScore} max={35} icon={Shield} />
          <ScoreBar label="BEE Level" score={score.beeScore} max={25} icon={Award} />
        </div>

        {score.total < 50 && (
          <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-2 text-xs text-yellow-800">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Score below 50. Consider reviewing certifications and safety records.</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
