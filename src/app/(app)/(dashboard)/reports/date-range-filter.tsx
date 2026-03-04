"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

const PRESETS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "YTD", value: "ytd" },
  { label: "All time", value: "all" },
] as const

export function DateRangeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPreset = searchParams.get("range") ?? "all"
  const customFrom = searchParams.get("from")
  const customTo = searchParams.get("to")
  const isCustom = Boolean(customFrom || customTo) && !searchParams.get("range")

  const [fromDate, setFromDate] = useState<Date | undefined>(
    customFrom ? new Date(customFrom) : undefined
  )
  const [toDate, setToDate] = useState<Date | undefined>(
    customTo ? new Date(customTo) : undefined
  )
  const [open, setOpen] = useState(false)

  function applyPreset(value: string) {
    const params = new URLSearchParams()
    if (value !== "all") params.set("range", value)
    router.push(`/reports${params.toString() ? `?${params}` : ""}`)
  }

  function applyCustomRange() {
    const params = new URLSearchParams()
    if (fromDate) params.set("from", format(fromDate, "yyyy-MM-dd"))
    if (toDate) params.set("to", format(toDate, "yyyy-MM-dd"))
    router.push(`/reports?${params}`)
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PRESETS.map((preset) => (
        <Button
          key={preset.value}
          variant={currentPreset === preset.value && !isCustom ? "default" : "outline"}
          size="sm"
          onClick={() => applyPreset(preset.value)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant={isCustom ? "default" : "outline"} size="sm">
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
            {isCustom && fromDate && toDate
              ? `${format(fromDate, "dd MMM")} – ${format(toDate, "dd MMM")}`
              : "Custom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="flex gap-4">
            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">From</p>
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </div>
            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">To</p>
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                disabled={(date) => date > new Date() || (fromDate ? date < fromDate : false)}
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button size="sm" onClick={applyCustomRange} disabled={!fromDate || !toDate}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
