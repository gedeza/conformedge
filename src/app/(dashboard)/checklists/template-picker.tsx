"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { BookTemplate, Trash2, RefreshCw, Settings2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RECURRENCE_FREQUENCIES } from "@/lib/constants"
import { createChecklistFromTemplate, deleteTemplate } from "./actions"
import { ConfigureRecurrenceDialog } from "./configure-recurrence-dialog"
import { EditTemplateItemsDialog } from "./edit-template-items-dialog"
import { canCreate, canDelete, canEdit } from "@/lib/permissions"
import { FIELD_TYPES } from "@/lib/constants"
import type { RecurrenceFrequency } from "@/types"

interface Template {
  id: string
  name: string
  description: string | null
  items: unknown
  isRecurring: boolean
  isPaused: boolean
  recurrenceFrequency: RecurrenceFrequency | null
  customIntervalDays: number | null
  nextDueDate: Date | string | null
  defaultAssigneeId: string | null
  defaultProjectId: string | null
  standard: { id: string; code: string; name: string }
  createdBy: { id: string; firstName: string; lastName: string }
  _count: { generatedChecklists: number }
}

interface TemplatePickerProps {
  templates: Template[]
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
  role: string
}

export function TemplatePicker({ templates, projects, members, role }: TemplatePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [title, setTitle] = useState("")
  const [projectId, setProjectId] = useState("")
  const [assignedToId, setAssignedToId] = useState("")
  const [isPending, startTransition] = useTransition()

  if (!canCreate(role) || templates.length === 0) return null

  function selectTemplate(template: Template) {
    setSelectedTemplate(template)
    setTitle(`${template.standard.code} — ${template.name}`)
  }

  function handleCreate() {
    if (!selectedTemplate || !title.trim()) {
      toast.error("Please select a template and provide a title")
      return
    }

    startTransition(async () => {
      const result = await createChecklistFromTemplate(selectedTemplate.id, {
        title: title.trim(),
        standardId: selectedTemplate.standard.id,
        projectId: projectId || undefined,
        assignedToId: assignedToId || undefined,
      })
      if (result.success) {
        toast.success("Checklist created from template")
        setOpen(false)
        setSelectedTemplate(null)
        setTitle("")
        setProjectId("")
        setAssignedToId("")
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(templateId: string) {
    startTransition(async () => {
      const result = await deleteTemplate(templateId)
      if (result.success) {
        toast.success("Template deleted")
        if (selectedTemplate?.id === templateId) setSelectedTemplate(null)
      } else {
        toast.error(result.error)
      }
    })
  }

  const itemCount = (template: Template) => {
    const items = template.items as unknown[]
    return Array.isArray(items) ? items.length : 0
  }

  const fieldTypeSummary = (template: Template) => {
    const items = template.items as Array<{ fieldType?: string }>
    if (!Array.isArray(items)) return ""
    const counts: Record<string, number> = {}
    for (const item of items) {
      if (item.fieldType && item.fieldType !== "COMPLIANCE") {
        const label = FIELD_TYPES[item.fieldType as keyof typeof FIELD_TYPES]?.label ?? item.fieldType
        counts[label] = (counts[label] ?? 0) + 1
      }
    }
    const parts = Object.entries(counts).map(([label, n]) => `${n} ${label.toLowerCase()}`)
    return parts.length > 0 ? ` (${parts.join(", ")})` : ""
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelectedTemplate(null); setTitle("") } }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookTemplate className="mr-2 h-4 w-4" />
          From Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create from Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="space-y-1 p-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between rounded-md p-2 cursor-pointer transition-colors ${
                    selectedTemplate?.id === t.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                  }`}
                  onClick={() => selectTemplate(t)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{t.name}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">{t.standard.code}</Badge>
                      {t.isRecurring && (
                        <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
                          <RefreshCw className="h-2.5 w-2.5" />
                          {t.recurrenceFrequency ? RECURRENCE_FREQUENCIES[t.recurrenceFrequency]?.label : "Recurring"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {itemCount(t)} items{fieldTypeSummary(t)} &middot; by {t.createdBy.firstName} {t.createdBy.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {canEdit(role) && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <EditTemplateItemsDialog templateId={t.id} templateName={t.name} items={t.items} />
                      </div>
                    )}
                    {canEdit(role) && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <ConfigureRecurrenceDialog
                          template={t}
                          members={members}
                          projects={projects}
                        />
                      </div>
                    )}
                    {canDelete(role) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id) }}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedTemplate && (
            <>
              <div className="space-y-2">
                <Label>Checklist Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Select value={assignedToId} onValueChange={setAssignedToId}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!selectedTemplate || !title.trim() || isPending}>
              {isPending ? "Creating..." : "Create Checklist"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
