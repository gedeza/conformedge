"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, Link2, Unlink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { canEdit } from "@/lib/permissions"
import { transitionIncident, linkIncidentToCapa, unlinkIncidentFromCapa } from "../actions"

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
  linkedCapa: { id: string; title: string; status: string } | null
  capaOptions: { id: string; title: string; status: string }[]
  role: string
}

export function IncidentActionsPanel({
  incidentId,
  currentStatus,
  linkedCapa,
  capaOptions,
  role,
}: IncidentActionsPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmTransition, setConfirmTransition] = useState<string | null>(null)
  const [selectedCapaId, setSelectedCapaId] = useState("")

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

  if (!canEdit(role)) return null

  return (
    <div className="space-y-4">
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
