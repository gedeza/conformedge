"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, Link2, Unlink, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { canEdit } from "@/lib/permissions"
import { Textarea } from "@/components/ui/textarea"
import { transitionIncident, linkIncidentToCapa, unlinkIncidentFromCapa, signOffInvestigation } from "../actions"

const VALID_TRANSITIONS: Record<string, { target: string; label: string }[]> = {
  REPORTED: [
    { target: "INVESTIGATING", label: "Start Investigation" },
    { target: "CLOSED", label: "Close" },
  ],
  INVESTIGATING: [
    { target: "CORRECTIVE_ACTION", label: "Move to Corrective Action" },
    { target: "CLOSED", label: "Close" },
  ],
  CORRECTIVE_ACTION: [
    { target: "CLOSED", label: "Close" },
  ],
  CLOSED: [],
}

interface IncidentActionsPanelProps {
  incidentId: string
  currentStatus: string
  incidentType: string
  severity: string
  isSignedOff: boolean
  signedOffBy?: string
  signedOffAt?: Date
  linkedCapa: { id: string; title: string; status: string } | null
  capaOptions: { id: string; title: string; status: string }[]
  role: string
}

export function IncidentActionsPanel({
  incidentId,
  currentStatus,
  incidentType,
  severity,
  isSignedOff,
  signedOffBy,
  signedOffAt,
  linkedCapa,
  capaOptions,
  role,
}: IncidentActionsPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmTransition, setConfirmTransition] = useState<string | null>(null)
  const [selectedCapaId, setSelectedCapaId] = useState("")
  const [showSignOff, setShowSignOff] = useState(false)
  const [signOffNotes, setSignOffNotes] = useState("")

  const requiresSignOff = incidentType === "FATALITY" || (incidentType === "LOST_TIME" && ["HIGH", "CRITICAL"].includes(severity))

  const transitions = VALID_TRANSITIONS[currentStatus] ?? []

  function handleTransition(newStatus: string) {
    startTransition(async () => {
      const result = await transitionIncident(incidentId, newStatus)
      if (result.success) {
        toast.success(`Incident moved to ${newStatus.replace(/_/g, " ").toLowerCase()}`)
        setConfirmTransition(null)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleLinkCapa() {
    if (!selectedCapaId) return
    startTransition(async () => {
      const result = await linkIncidentToCapa(incidentId, selectedCapaId)
      if (result.success) {
        toast.success("CAPA linked")
        setSelectedCapaId("")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleUnlinkCapa() {
    startTransition(async () => {
      const result = await unlinkIncidentFromCapa(incidentId)
      if (result.success) {
        toast.success("CAPA unlinked")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleSignOff() {
    startTransition(async () => {
      const result = await signOffInvestigation(incidentId, signOffNotes || undefined)
      if (result.success) {
        toast.success("Investigation signed off")
        setShowSignOff(false)
        setSignOffNotes("")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  if (!canEdit(role)) return null

  return (
    <div className="space-y-4">
      {/* Investigation Sign-off */}
      {requiresSignOff && !isSignedOff && ["INVESTIGATING", "CORRECTIVE_ACTION"].includes(currentStatus) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Sign-off Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              This {incidentType === "FATALITY" ? "fatality" : "serious lost-time"} incident requires management sign-off before closure.
            </p>
            {["OWNER", "ADMIN", "MANAGER"].includes(role) ? (
              showSignOff ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Sign-off notes (optional)"
                    value={signOffNotes}
                    onChange={(e) => setSignOffNotes(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSignOff} disabled={isPending} className="flex-1">
                      {isPending ? "Signing..." : "Confirm Sign-off"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowSignOff(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="default" className="w-full" onClick={() => setShowSignOff(true)}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Sign Off Investigation
                </Button>
              )
            ) : (
              <p className="text-xs text-amber-700">A manager must sign off before this incident can be closed.</p>
            )}
          </CardContent>
        </Card>
      )}

      {requiresSignOff && isSignedOff && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Investigation Signed Off
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {signedOffBy && `Signed off by ${signedOffBy}`}
              {signedOffAt && ` on ${new Date(signedOffAt).toLocaleDateString()}`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status Transitions */}
      {transitions.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transitions.map((t) => (
              <Button
                key={t.target}
                variant={t.target === "CLOSED" ? "outline" : "default"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setConfirmTransition(t.target)}
                disabled={isPending}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                {t.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CAPA Linking */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Linked CAPA</CardTitle>
        </CardHeader>
        <CardContent>
          {linkedCapa ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{linkedCapa.title}</p>
                  <StatusBadge type="capa" value={linkedCapa.status} className="mt-1" />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlinkCapa}
                disabled={isPending}
                className="w-full"
              >
                <Unlink className="mr-2 h-4 w-4" />
                Unlink CAPA
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Select value={selectedCapaId} onValueChange={setSelectedCapaId}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select a CAPA..." />
                </SelectTrigger>
                <SelectContent>
                  {capaOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="default"
                size="sm"
                onClick={handleLinkCapa}
                disabled={isPending || !selectedCapaId}
                className="w-full"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Link CAPA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transition confirmation */}
      <ConfirmDialog
        open={!!confirmTransition}
        onOpenChange={(open) => !open && setConfirmTransition(null)}
        title="Confirm Status Change"
        description={`Move this incident to "${confirmTransition?.replace(/_/g, " ")}"?`}
        confirmLabel="Confirm"
        onConfirm={() => confirmTransition && handleTransition(confirmTransition)}
        loading={isPending}
      />
    </div>
  )
}
