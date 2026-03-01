"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, Star, Pencil, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  createWorkflowTemplate,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
  setDefaultWorkflowTemplate,
  type WorkflowTemplate,
  type WorkflowTemplateFormValues,
} from "./workflow-template-actions"

interface StepInput {
  stepOrder: number
  role: "MANAGER" | "ADMIN" | "OWNER"
  label: string
}

const ROLE_OPTIONS = [
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
  { value: "OWNER", label: "Owner" },
] as const

interface Props {
  templates: WorkflowTemplate[]
  canManage: boolean
}

export function WorkflowTemplates({ templates, canManage }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [steps, setSteps] = useState<StepInput[]>([
    { stepOrder: 1, role: "MANAGER", label: "Manager Review" },
  ])

  function resetForm() {
    setName("")
    setDescription("")
    setIsDefault(false)
    setSteps([{ stepOrder: 1, role: "MANAGER", label: "Manager Review" }])
    setEditingTemplate(null)
  }

  function openNew() {
    resetForm()
    setDialogOpen(true)
  }

  function openEdit(t: WorkflowTemplate) {
    setEditingTemplate(t)
    setName(t.name)
    setDescription(t.description ?? "")
    setIsDefault(t.isDefault)
    const parsed = t.steps as StepInput[]
    setSteps(parsed.length > 0 ? parsed : [{ stepOrder: 1, role: "MANAGER", label: "Manager Review" }])
    setDialogOpen(true)
  }

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { stepOrder: prev.length + 1, role: "ADMIN", label: "" },
    ])
  }

  function removeStep(index: number) {
    setSteps((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.map((s, i) => ({ ...s, stepOrder: i + 1 }))
    })
  }

  function updateStep(index: number, field: keyof StepInput, value: string | number) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    if (steps.some((s) => !s.label.trim())) {
      toast.error("All steps must have a label")
      return
    }

    const values: WorkflowTemplateFormValues = {
      name: name.trim(),
      description: description.trim() || undefined,
      isDefault,
      steps,
    }

    startTransition(async () => {
      const result = editingTemplate
        ? await updateWorkflowTemplate(editingTemplate.id, values)
        : await createWorkflowTemplate(values)

      if (result.success) {
        toast.success(editingTemplate ? "Template updated" : "Template created")
        setDialogOpen(false)
        resetForm()
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteWorkflowTemplate(id)
      if (result.success) {
        toast.success("Template deleted")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultWorkflowTemplate(id)
      if (result.success) {
        toast.success("Default template updated")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  if (!canManage) {
    return (
      <p className="text-sm text-muted-foreground">
        Only admins can manage approval workflow templates.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No workflow templates yet. Create one to enable document approval workflows.
        </p>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => {
            const stepsList = t.steps as StepInput[]
            return (
              <div key={t.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{t.name}</span>
                    {t.isDefault && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                        Default
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {stepsList.length} step{stepsList.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {t.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  {!t.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(t.id)}
                      disabled={isPending}
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(t)}
                    disabled={isPending}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(t.id)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
        <DialogTrigger asChild>
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Workflow Template" : "New Workflow Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard Approval"
              />
            </div>
            <div className="space-y-2">
              <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when to use this template..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Approval Steps</Label>
              <p className="text-xs text-muted-foreground">
                Define the sequential approval chain. Each step requires a reviewer with the specified minimum role.
              </p>
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border p-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                    <Input
                      value={step.label}
                      onChange={(e) => updateStep(i, "label", e.target.value)}
                      placeholder="Step label"
                      className="flex-1"
                    />
                    <Select
                      value={step.role}
                      onValueChange={(v) => updateStep(i, "role", v)}
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
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="mr-2 h-4 w-4" /> Add Step
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={isDefault} onCheckedChange={setIsDefault} />
              <Label className="font-normal">Set as default template</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Saving..." : editingTemplate ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
