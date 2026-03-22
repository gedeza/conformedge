"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, X as XIcon, GripVertical, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FIELD_TYPES } from "@/lib/constants"
import { updateTemplateItems } from "./actions"

interface TemplateItem {
  description: string
  clauseNumber?: string
  standardClauseId?: string
  fieldType?: string
  fieldConfig?: Record<string, unknown>
}

interface EditTemplateItemsDialogProps {
  templateId: string
  templateName: string
  items: unknown
}

export function EditTemplateItemsDialog({ templateId, templateName, items: rawItems }: EditTemplateItemsDialogProps) {
  const parsed = (Array.isArray(rawItems) ? rawItems : []) as TemplateItem[]
  const [open, setOpen] = useState(false)
  const [localItems, setLocalItems] = useState<TemplateItem[]>(parsed)
  const [isPending, startTransition] = useTransition()

  function updateItem(index: number, patch: Partial<TemplateItem>) {
    setLocalItems((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item))
  }

  function handleFieldTypeChange(index: number, ft: string) {
    const newFt = ft === "COMPLIANCE" ? undefined : ft
    let newConfig: Record<string, unknown> | undefined
    if (ft === "RATING") newConfig = { max: 5 }
    else if (ft === "NUMBER") newConfig = {}
    else if (ft === "SELECT") newConfig = { options: [] }
    updateItem(index, { fieldType: newFt, fieldConfig: newConfig })
  }

  function updateNumberConfig(index: number, key: string, value: string) {
    const item = localItems[index]
    const cfg = { ...(item.fieldConfig ?? {}) }
    if (value) cfg[key] = key === "unit" ? value : parseFloat(value)
    else delete cfg[key]
    updateItem(index, { fieldConfig: cfg })
  }

  function updateSelectOptions(index: number, options: string[]) {
    updateItem(index, { fieldConfig: { options } })
  }

  function handleSave() {
    for (const item of localItems) {
      if (item.fieldType === "SELECT") {
        const opts = (item.fieldConfig?.options as string[]) ?? []
        if (opts.length < 2) {
          toast.error(`"${item.description.slice(0, 30)}..." needs at least 2 dropdown options`)
          return
        }
      }
    }
    startTransition(async () => {
      const result = await updateTemplateItems(templateId, localItems)
      if (result.success) { toast.success("Template items updated"); setOpen(false) }
      else toast.error(result.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setLocalItems(parsed) }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit items">
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Edit Template Items
          </DialogTitle>
          <DialogDescription>{templateName} — configure field types for each checklist item.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 pr-4">
            {localItems.map((item, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3 items-start">
                      <p className="text-sm font-medium flex-1 pt-1">{item.description}</p>
                      <Select value={item.fieldType ?? "COMPLIANCE"} onValueChange={(v) => handleFieldTypeChange(i, v)}>
                        <SelectTrigger className="w-36 h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(FIELD_TYPES).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {item.fieldType === "NUMBER" && (
                      <div className="flex gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Min</Label>
                          <Input type="number" value={(item.fieldConfig?.min as number) ?? ""} onChange={(e) => updateNumberConfig(i, "min", e.target.value)} className="w-24 h-9" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Max</Label>
                          <Input type="number" value={(item.fieldConfig?.max as number) ?? ""} onChange={(e) => updateNumberConfig(i, "max", e.target.value)} className="w-24 h-9" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Unit</Label>
                          <Input value={(item.fieldConfig?.unit as string) ?? ""} onChange={(e) => updateNumberConfig(i, "unit", e.target.value)} className="w-24 h-9" />
                        </div>
                      </div>
                    )}

                    {item.fieldType === "SELECT" && (
                      <SelectOptionsEditor
                        options={(item.fieldConfig?.options as string[]) ?? []}
                        onChange={(opts) => updateSelectOptions(i, opts)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SelectOptionsEditor({ options, onChange }: { options: string[]; onChange: (opts: string[]) => void }) {
  const [newOpt, setNewOpt] = useState("")

  function add() {
    const trimmed = newOpt.trim()
    if (!trimmed || options.includes(trimmed)) return
    onChange([...options, trimmed])
    setNewOpt("")
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Dropdown Options</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <span key={opt} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
            {opt}
            <button type="button" onClick={() => onChange(options.filter((o) => o !== opt))} className="text-muted-foreground hover:text-foreground">
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newOpt} onChange={(e) => setNewOpt(e.target.value)} placeholder="New option" className="w-40 h-9" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }} />
        <Button type="button" size="sm" variant="outline" onClick={add}>Add</Button>
      </div>
    </div>
  )
}
