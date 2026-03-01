"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Star } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { updateItemResponse } from "../actions"

interface FieldRendererProps {
  itemId: string
  checklistId: string
  fieldType: string
  fieldConfig: Record<string, unknown> | null
  response: Record<string, unknown> | null
}

export function FieldRenderer({ itemId, checklistId, fieldType, fieldConfig, response }: FieldRendererProps) {
  const [isPending, startTransition] = useTransition()

  function submit(value: unknown) {
    startTransition(async () => {
      const result = await updateItemResponse(itemId, checklistId, fieldType, { value })
      if (!result.success) toast.error(result.error)
    })
  }

  switch (fieldType) {
    case "BOOLEAN":
      return <BooleanField value={response?.value as boolean | undefined} onSubmit={submit} isPending={isPending} />
    case "NUMBER":
      return <NumberField value={response?.value as number | undefined} config={fieldConfig} onSubmit={submit} isPending={isPending} />
    case "RATING":
      return <RatingField value={response?.value as number | undefined} onSubmit={submit} isPending={isPending} />
    case "SELECT":
      return <SelectField value={response?.value as string | undefined} config={fieldConfig} onSubmit={submit} isPending={isPending} />
    default:
      return null
  }
}

function BooleanField({ value, onSubmit, isPending }: { value?: boolean; onSubmit: (v: boolean) => void; isPending: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={value ?? false}
        onCheckedChange={(checked) => onSubmit(checked)}
        disabled={isPending}
      />
      <Label className="text-sm text-muted-foreground">{value === true ? "Yes" : value === false ? "No" : "Not set"}</Label>
    </div>
  )
}

function NumberField({ value, config, onSubmit, isPending }: { value?: number; config: Record<string, unknown> | null; onSubmit: (v: number) => void; isPending: boolean }) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? "")
  const min = (config?.min as number) ?? undefined
  const max = (config?.max as number) ?? undefined
  const unit = (config?.unit as string) ?? ""

  function handleBlur() {
    const num = parseFloat(localValue)
    if (isNaN(num)) return
    onSubmit(num)
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Enter" && handleBlur()}
        min={min}
        max={max}
        className="w-28 h-8"
        disabled={isPending}
        placeholder={min !== undefined && max !== undefined ? `${min}–${max}` : "Value"}
      />
      {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
    </div>
  )
}

function RatingField({ value, onSubmit, isPending }: { value?: number; onSubmit: (v: number) => void; isPending: boolean }) {
  const [hover, setHover] = useState(0)
  const current = value ?? 0

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={isPending}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onSubmit(star)}
          className="p-0.5 disabled:opacity-50"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              (hover || current) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
      {current > 0 && <span className="text-sm text-muted-foreground ml-1">{current}/5</span>}
    </div>
  )
}

function SelectField({ value, config, onSubmit, isPending }: { value?: string; config: Record<string, unknown> | null; onSubmit: (v: string) => void; isPending: boolean }) {
  const options = (config?.options as string[]) ?? []

  return (
    <Select value={value ?? ""} onValueChange={(v) => onSubmit(v)} disabled={isPending}>
      <SelectTrigger className="w-40 h-8">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
