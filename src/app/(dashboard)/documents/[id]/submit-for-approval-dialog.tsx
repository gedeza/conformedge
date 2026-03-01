"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Send, Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { submitForApproval } from "../approval-actions"

interface StepInput {
  stepOrder: number
  role: string
  label: string
}

interface Template {
  id: string
  name: string
  steps: unknown
  isDefault: boolean
}

interface OrgMember {
  id: string
  name: string
  role: string
}

interface StepFormRow {
  stepOrder: number
  label: string
  requiredRole: string
  assignedToId: string
}

const ROLE_OPTIONS = [
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
  { value: "OWNER", label: "Owner" },
] as const

const ROLE_LEVEL: Record<string, number> = {
  VIEWER: 0,
  AUDITOR: 1,
  MANAGER: 2,
  ADMIN: 3,
  OWNER: 4,
}

interface Props {
  documentId: string
  templates: Template[]
  members: OrgMember[]
}

export function SubmitForApprovalDialog({ documentId, templates, members }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(
    templates.find((t) => t.isDefault)?.id
  )
  const [steps, setSteps] = useState<StepFormRow[]>(() => initSteps())

  function initSteps(): StepFormRow[] {
    const defaultTemplate = templates.find((t) => t.isDefault) ?? templates[0]
    if (defaultTemplate) {
      const parsed = defaultTemplate.steps as StepInput[]
      return parsed.map((s) => ({
        stepOrder: s.stepOrder,
        label: s.label,
        requiredRole: s.role,
        assignedToId: "",
      }))
    }
    return [{ stepOrder: 1, label: "Manager Review", requiredRole: "MANAGER", assignedToId: "" }]
  }

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId)
    if (templateId === "custom") {
      setSteps([{ stepOrder: 1, label: "Review", requiredRole: "MANAGER", assignedToId: "" }])
      return
    }
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      const parsed = template.steps as StepInput[]
      setSteps(
        parsed.map((s) => ({
          stepOrder: s.stepOrder,
          label: s.label,
          requiredRole: s.role,
          assignedToId: "",
        }))
      )
    }
  }

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { stepOrder: prev.length + 1, label: "", requiredRole: "ADMIN", assignedToId: "" },
    ])
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepOrder: i + 1 })))
  }

  function updateStep(index: number, field: keyof StepFormRow, value: string | number) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  function getEligibleMembers(requiredRole: string) {
    const minLevel = ROLE_LEVEL[requiredRole] ?? 0
    return members.filter((m) => (ROLE_LEVEL[m.role] ?? 0) >= minLevel)
  }

  function handleSubmit() {
    if (steps.some((s) => !s.label.trim())) {
      toast.error("All steps must have a label")
      return
    }
    if (steps.some((s) => !s.assignedToId)) {
      toast.error("All steps must have an assigned reviewer")
      return
    }

    startTransition(async () => {
      const result = await submitForApproval({
        documentId,
        templateId: selectedTemplateId === "custom" ? undefined : selectedTemplateId,
        steps: steps.map((s) => ({
          stepOrder: s.stepOrder,
          label: s.label,
          requiredRole: s.requiredRole,
          assignedToId: s.assignedToId,
        })),
      })

      if (result.success) {
        toast.success("Document submitted for approval")
        setDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Send className="mr-2 h-4 w-4" />
          Submit for Approval
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit for Approval</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Workflow Template</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}{t.isDefault ? " (Default)" : ""}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Steps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Approval Steps</Label>
            <p className="text-xs text-muted-foreground">
              Assign a reviewer for each step. Reviews proceed sequentially.
            </p>
            <div className="space-y-2">
              {steps.map((step, i) => {
                const eligible = getEligibleMembers(step.requiredRole)
                return (
                  <div key={i} className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">
                        {i + 1}.
                      </span>
                      <Input
                        value={step.label}
                        onChange={(e) => updateStep(i, "label", e.target.value)}
                        placeholder="Step label"
                        className="flex-1"
                      />
                      <Select
                        value={step.requiredRole}
                        onValueChange={(v) => {
                          updateStep(i, "requiredRole", v)
                          updateStep(i, "assignedToId", "")
                        }}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {steps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(i)}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <Select
                        value={step.assignedToId}
                        onValueChange={(v) => updateStep(i, "assignedToId", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {eligible.length === 0 ? (
                            <SelectItem value="__none" disabled>
                              No members with required role
                            </SelectItem>
                          ) : (
                            eligible.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name} ({m.role})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )
              })}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              <Plus className="mr-2 h-4 w-4" /> Add Step
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
