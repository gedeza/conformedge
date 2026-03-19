"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BodyMap, type BodyMapProps } from "./body-map"

// ── Dual Body Map — front + back side by side ───────────────────────────────
// Matches the AE SHEQ incident report layout with both views visible

interface BodyMapDualProps {
  /** Comma-separated body parts (e.g. "Head, Chest, Hand (L)") */
  value?: string
  /** Returns updated comma-separated string */
  onChange?: (bodyParts: string) => void
  /** Optional severity map: bodyPart → severity level */
  injurySeverity?: BodyMapProps["injurySeverity"]
  readOnly?: boolean
  className?: string
}

function parseSelectedParts(value?: string): string[] {
  if (!value) return []
  return value.split(",").map(s => s.trim()).filter(Boolean)
}

export function BodyMapDual({
  value,
  onChange,
  injurySeverity,
  readOnly = false,
  className,
}: BodyMapDualProps) {
  const selectedParts = parseSelectedParts(value)

  function handleToggle(part: string) {
    if (readOnly) return
    let updated: string[]
    if (selectedParts.includes(part)) {
      updated = selectedParts.filter(p => p !== part)
    } else {
      updated = [...selectedParts, part]
    }
    onChange?.(updated.join(", "))
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Header */}
      <div className="text-xs font-medium text-center">
        {selectedParts.length > 0 ? (
          <span className="text-red-600">
            {selectedParts.length === 1
              ? selectedParts[0]
              : `${selectedParts.length} areas selected`}
          </span>
        ) : !readOnly ? (
          <span className="text-muted-foreground">Click to select injured areas</span>
        ) : null}
      </div>

      {/* Side-by-side body maps */}
      <div className="flex gap-2 justify-center w-full">
        <BodyMap
          value={value}
          onChange={onChange}
          injurySeverity={injurySeverity}
          readOnly={readOnly}
          forcedView="front"
          className="flex-1 max-w-[180px]"
        />
        <BodyMap
          value={value}
          onChange={onChange}
          injurySeverity={injurySeverity}
          readOnly={readOnly}
          forcedView="back"
          className="flex-1 max-w-[180px]"
        />
      </div>

      {/* Selected region chips */}
      {selectedParts.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-[380px] justify-center">
          {selectedParts.map(part => {
            const severity = injurySeverity?.[part]
            return (
              <Badge
                key={part}
                variant="secondary"
                className={cn(
                  "gap-1 text-[10px] py-0 h-5",
                  !readOnly && "cursor-pointer hover:bg-destructive/10",
                  severity === "severe" && "border-red-300 bg-red-50 text-red-700",
                  severity === "moderate" && "border-orange-300 bg-orange-50 text-orange-700",
                  severity === "minor" && "border-amber-300 bg-amber-50 text-amber-700",
                )}
                onClick={() => !readOnly && handleToggle(part)}
              >
                {part}
                {!readOnly && <X className="h-2.5 w-2.5" />}
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
