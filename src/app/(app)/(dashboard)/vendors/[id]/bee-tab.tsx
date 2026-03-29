"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { Award, AlertTriangle, CheckCircle2, Shield } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { updateBeeScorecard } from "../actions"
import {
  BEE_ELEMENTS,
  BEE_ENTITY_TYPES,
  calculateBeeLevel,
  buildScorecard,
  type BeeScorecard,
} from "../bee-calculator"

interface BeeTabProps {
  vendorId: string
  beeLevel: string | null
  beeEntityType: string | null
  beeScore: number | null
  beeScorecard: unknown
  beeCertExpiry: Date | null
  beeVerifier: string | null
  beeBlackOwnership: number | null
  canEdit: boolean
}

export function BeeTab({
  vendorId,
  beeLevel,
  beeEntityType,
  beeScore,
  beeScorecard: initialScorecard,
  beeCertExpiry,
  beeVerifier,
  beeBlackOwnership,
  canEdit,
}: BeeTabProps) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)

  // Parse existing scorecard or create empty
  const scorecard = (initialScorecard as BeeScorecard) ?? null

  // Calculate current level
  const result = calculateBeeLevel(
    beeScore ?? scorecard?.totalScore ?? null,
    beeEntityType,
    beeBlackOwnership,
    scorecard,
  )

  // Form state for editing
  const [entityType, setEntityType] = useState(beeEntityType ?? "")
  const [blackOwnership, setBlackOwnership] = useState(beeBlackOwnership ?? 0)
  const [verifier, setVerifier] = useState(beeVerifier ?? "")
  const [certExpiry, setCertExpiry] = useState(beeCertExpiry ? new Date(beeCertExpiry).toISOString().split("T")[0] : "")
  const [elements, setElements] = useState<Record<string, number>>({
    ownership: scorecard?.ownership?.score ?? 0,
    managementControl: scorecard?.managementControl?.score ?? 0,
    skillsDevelopment: scorecard?.skillsDevelopment?.score ?? 0,
    esd: scorecard?.esd?.score ?? 0,
    sed: scorecard?.sed?.score ?? 0,
  })

  // Live calculation while editing
  const liveScorecard = buildScorecard(elements)
  const liveResult = calculateBeeLevel(
    liveScorecard.totalScore,
    entityType || null,
    blackOwnership || null,
    liveScorecard,
  )

  function handleSave() {
    startTransition(async () => {
      const sc = buildScorecard(elements)
      const res = await updateBeeScorecard(vendorId, {
        beeEntityType: entityType || null,
        beeBlackOwnership: blackOwnership || null,
        beeScorecard: sc as unknown as Record<string, unknown>,
        beeScore: sc.totalScore,
        beeCertExpiry: certExpiry ? new Date(certExpiry) : null,
        beeVerifier: verifier || null,
        beeLevel: liveResult.level,
      })
      if (res.success) {
        toast.success("B-BBEE scorecard updated")
        setEditing(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  const displayResult = editing ? liveResult : result
  const displayScorecard = editing ? liveScorecard : scorecard

  const isExpired = beeCertExpiry && new Date(beeCertExpiry) < new Date()

  return (
    <div className="space-y-4">
      {/* Level Summary Card */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                displayResult.level !== null
                  ? displayResult.level <= 3 ? "bg-green-100 text-green-800"
                  : displayResult.level <= 6 ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {displayResult.level !== null ? displayResult.level : "N/C"}
              </div>
              <div>
                <p className="text-lg font-semibold">
                  B-BBEE Level {displayResult.level ?? "Non-Compliant"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {displayResult.recognition}% Recognition
                  {displayResult.entityType && (
                    <span className="ml-2">
                      <Badge variant="outline" className="text-xs">{BEE_ENTITY_TYPES.find((t) => t.value === displayResult.entityType)?.label ?? displayResult.entityType}</Badge>
                    </span>
                  )}
                </p>
                {displayResult.levelDiscounting > 0 && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    Level discounted by {displayResult.levelDiscounting} due to priority sub-minimum failure
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              {beeCertExpiry && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Certificate expires: </span>
                  <span className={isExpired ? "text-red-600 font-medium" : ""}>{format(new Date(beeCertExpiry), "PP")}</span>
                  {isExpired && <Badge variant="destructive" className="ml-2 text-xs">Expired</Badge>}
                </div>
              )}
              {beeVerifier && <p className="text-xs text-muted-foreground mt-1">Verified by: {beeVerifier}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scorecard Breakdown or Edit Form */}
      {editing ? (
        <Card className="border-border/50 border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm">Edit B-BBEE Scorecard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {BEE_ENTITY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label} — {t.description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Black Ownership %</Label>
                <Input type="number" min={0} max={100} value={blackOwnership} onChange={(e) => setBlackOwnership(Number(e.target.value))} />
              </div>
            </div>

            {entityType !== "EME" && (
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">Scorecard Elements (per Amended Codes of Good Practice)</p>
                {BEE_ELEMENTS.map((el) => (
                  <div key={el.key} className="flex items-center gap-3">
                    <div className="w-48 text-sm">
                      {el.label}
                      {el.isPriority && <Badge variant="outline" className="ml-1 text-[10px]">Priority</Badge>}
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={el.maxPoints}
                      className="w-20"
                      value={elements[el.key] ?? 0}
                      onChange={(e) => setElements((prev) => ({ ...prev, [el.key]: Number(e.target.value) }))}
                    />
                    <span className="text-xs text-muted-foreground">/ {el.maxPoints}</span>
                    <Progress value={(elements[el.key] / el.maxPoints) * 100} className="flex-1 h-2" />
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="w-48 text-sm font-semibold">Total Score</div>
                  <span className="w-20 text-center font-bold">{liveScorecard.totalScore}</span>
                  <span className="text-xs text-muted-foreground">/ 109</span>
                  <div className="flex-1 text-right">
                    <Badge className={liveResult.level !== null && liveResult.level <= 3 ? "bg-green-600" : liveResult.level !== null && liveResult.level <= 6 ? "bg-yellow-600" : "bg-red-600"}>
                      Level {liveResult.level ?? "N/C"} — {liveResult.recognition}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Certificate Expiry</Label>
                <Input type="date" value={certExpiry} onChange={(e) => setCertExpiry(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Verification Agency</Label>
                <Input value={verifier} onChange={(e) => setVerifier(e.target.value)} placeholder="e.g., BEE.conomics" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={isPending}>{isPending ? "Saving..." : "Save Scorecard"}</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {displayScorecard && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Scorecard Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {BEE_ELEMENTS.map((el) => {
                  const elData = (displayScorecard as any)?.[el.key]
                  if (!elData) return null
                  const pct = (elData.score / el.maxPoints) * 100
                  const subMinOk = el.isPriority ? (displayScorecard as BeeScorecard)?.prioritySubMinimums?.[el.key as keyof BeeScorecard["prioritySubMinimums"]] : true
                  return (
                    <div key={el.key} className="flex items-center gap-3">
                      <div className="w-56 text-sm flex items-center gap-2">
                        {el.label}
                        {el.isPriority && (
                          subMinOk
                            ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                            : <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <span className="w-16 text-sm font-medium text-right">{elData.score} / {el.maxPoints}</span>
                      <Progress value={pct} className="flex-1 h-2" />
                      <span className="w-12 text-xs text-muted-foreground text-right">{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Shield className="mr-2 h-4 w-4" />
              {displayScorecard ? "Edit Scorecard" : "Add B-BBEE Scorecard"}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
