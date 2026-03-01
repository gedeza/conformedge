"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Settings2, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RECURRENCE_FREQUENCIES } from "@/lib/constants"
import { configureRecurrence, toggleRecurrencePause } from "./actions"
import type { RecurrenceFrequency } from "@/types"

interface ConfigureRecurrenceDialogProps {
  template: {
    id: string
    name: string
    isRecurring: boolean
    isPaused: boolean
    recurrenceFrequency: RecurrenceFrequency | null
    customIntervalDays: number | null
    nextDueDate: Date | string | null
    defaultAssigneeId: string | null
    defaultProjectId: string | null
  }
  members: { id: string; name: string }[]
  projects: { id: string; name: string }[]
  trigger?: React.ReactNode
}

export function ConfigureRecurrenceDialog({ template, members, projects, trigger }: ConfigureRecurrenceDialogProps) {
  const [open, setOpen] = useState(false)
  const [isRecurring, setIsRecurring] = useState(template.isRecurring)
  const [frequency, setFrequency] = useState<RecurrenceFrequency | "">(template.recurrenceFrequency ?? "")
  const [customDays, setCustomDays] = useState(String(template.customIntervalDays ?? 30))
  const [startDate, setStartDate] = useState(
    template.nextDueDate
      ? new Date(template.nextDueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  )
  const [assigneeId, setAssigneeId] = useState(template.defaultAssigneeId ?? "")
  const [projectId, setProjectId] = useState(template.defaultProjectId ?? "")
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (isRecurring && !frequency) {
      toast.error("Please select a frequency")
      return
    }

    startTransition(async () => {
      const result = await configureRecurrence(template.id, {
        isRecurring,
        recurrenceFrequency: isRecurring ? (frequency as RecurrenceFrequency) : undefined,
        customIntervalDays: frequency === "CUSTOM" ? Number(customDays) : undefined,
        startDate: isRecurring ? startDate : undefined,
        defaultAssigneeId: assigneeId || undefined,
        defaultProjectId: projectId || undefined,
      })
      if (result.success) {
        toast.success(isRecurring ? "Recurring schedule configured" : "Recurring schedule disabled")
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleTogglePause() {
    startTransition(async () => {
      const result = await toggleRecurrencePause(template.id)
      if (result.success) {
        toast.success(template.isPaused ? "Schedule resumed" : "Schedule paused")
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recurring Schedule — {template.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="recurring-toggle">Enable recurring schedule</Label>
            <Switch
              id="recurring-toggle"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {isRecurring && (
            <>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}>
                  <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(RECURRENCE_FREQUENCIES).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {frequency === "CUSTOM" && (
                <div className="space-y-2">
                  <Label>Custom interval (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Start date (first due date)</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Assignee</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {template.isRecurring && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTogglePause}
                  disabled={isPending}
                >
                  {template.isPaused ? (
                    <><Play className="mr-2 h-4 w-4" />Resume Schedule</>
                  ) : (
                    <><Pause className="mr-2 h-4 w-4" />Pause Schedule</>
                  )}
                </Button>
              )}
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
