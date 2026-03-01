"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Plus, X as XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FIELD_TYPES } from "@/lib/constants"
import { addChecklistItem } from "../actions"

export function AddItemForm({ checklistId }: { checklistId: string }) {
  const [showInput, setShowInput] = useState(false)
  const [description, setDescription] = useState("")
  const [fieldType, setFieldType] = useState<string>("COMPLIANCE")
  const [min, setMin] = useState("")
  const [max, setMax] = useState("")
  const [unit, setUnit] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [newOption, setNewOption] = useState("")
  const [isPending, startTransition] = useTransition()

  function reset() {
    setDescription("")
    setFieldType("COMPLIANCE")
    setMin("")
    setMax("")
    setUnit("")
    setOptions([])
    setNewOption("")
    setShowInput(false)
  }

  function buildConfig(): Record<string, unknown> | null {
    if (fieldType === "NUMBER") {
      const cfg: Record<string, unknown> = {}
      if (min) cfg.min = parseFloat(min)
      if (max) cfg.max = parseFloat(max)
      if (unit.trim()) cfg.unit = unit.trim()
      return Object.keys(cfg).length > 0 ? cfg : null
    }
    if (fieldType === "RATING") return { max: 5 }
    if (fieldType === "SELECT") {
      return options.length > 0 ? { options } : null
    }
    return null
  }

  function handleAdd() {
    if (!description.trim()) return
    if (fieldType === "SELECT" && options.length < 2) {
      toast.error("Dropdown needs at least 2 options")
      return
    }

    const ft = fieldType === "COMPLIANCE" ? null : fieldType
    const config = buildConfig()

    startTransition(async () => {
      const result = await addChecklistItem(checklistId, description, undefined, ft, config)
      if (result.success) {
        toast.success("Item added")
        reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  function addOption() {
    const trimmed = newOption.trim()
    if (!trimmed || options.includes(trimmed)) return
    setOptions([...options, trimmed])
    setNewOption("")
  }

  if (!showInput) {
    return (
      <Button size="sm" variant="outline" onClick={() => setShowInput(true)}>
        <Plus className="mr-1 h-4 w-4" /> Add Item
      </Button>
    )
  }

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex gap-2">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Item description"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && fieldType === "COMPLIANCE" && handleAdd()}
        />
        <Select value={fieldType} onValueChange={setFieldType}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FIELD_TYPES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {fieldType === "NUMBER" && (
        <div className="flex gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Min</Label>
            <Input type="number" value={min} onChange={(e) => setMin(e.target.value)} className="w-20 h-8" placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max</Label>
            <Input type="number" value={max} onChange={(e) => setMax(e.target.value)} className="w-20 h-8" placeholder="100" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Unit</Label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} className="w-20 h-8" placeholder="mm" />
          </div>
        </div>
      )}

      {fieldType === "SELECT" && (
        <div className="space-y-2">
          <Label className="text-xs">Options</Label>
          <div className="flex flex-wrap gap-1">
            {options.map((opt) => (
              <span key={opt} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {opt}
                <button type="button" onClick={() => setOptions(options.filter((o) => o !== opt))} className="text-muted-foreground hover:text-foreground">
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add option..."
              className="w-40 h-8"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption() } }}
            />
            <Button type="button" size="sm" variant="outline" onClick={addOption}>Add</Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" onClick={handleAdd} disabled={isPending}>
          {isPending ? "Adding..." : "Add Item"}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>Cancel</Button>
      </div>
    </div>
  )
}
