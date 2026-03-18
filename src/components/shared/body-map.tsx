"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// ── Body region definitions ─────────────────────
// Each region maps to a BODY_PARTS constant value
// Coordinates designed for a 200x440 viewBox

interface BodyRegion {
  id: string
  label: string
  bodyPart: string
  d: string
  view: "front" | "back"
}

// ── FRONT VIEW REGIONS ──────────────────────────

const FRONT_REGIONS: BodyRegion[] = [
  // HEAD & FACE
  { id: "head-f", label: "Head", bodyPart: "Head", view: "front",
    d: "M 100,10 C 86,10 76,18 74,30 L 74,32 C 74,32 76,18 100,18 C 124,18 126,32 126,32 L 126,30 C 124,18 114,10 100,10 Z" },
  { id: "face-f", label: "Face", bodyPart: "Face", view: "front",
    d: "M 86,28 C 86,24 92,20 100,20 C 108,20 114,24 114,28 L 114,44 C 114,52 108,58 100,58 C 92,58 86,52 86,44 Z" },
  // Eyes
  { id: "eye-l", label: "Eyes", bodyPart: "Eyes", view: "front",
    d: "M 104,32 C 106,30 110,30 112,32 C 110,34 106,34 104,32 Z" },
  { id: "eye-r", label: "Eyes", bodyPart: "Eyes", view: "front",
    d: "M 88,32 C 90,30 94,30 96,32 C 94,34 90,34 88,32 Z" },
  // Ears
  { id: "ear-l", label: "Ears", bodyPart: "Ears", view: "front",
    d: "M 114,30 C 118,28 120,32 120,36 C 120,40 118,42 114,40 Z" },
  { id: "ear-r", label: "Ears", bodyPart: "Ears", view: "front",
    d: "M 86,30 C 82,28 80,32 80,36 C 80,40 82,42 86,40 Z" },

  // NECK
  { id: "neck-f", label: "Neck", bodyPart: "Neck", view: "front",
    d: "M 93,56 L 93,68 C 96,70 104,70 107,68 L 107,56 C 104,60 96,60 93,56 Z" },

  // TORSO
  { id: "chest-f", label: "Chest", bodyPart: "Chest", view: "front",
    d: "M 68,78 C 68,74 80,70 93,68 L 107,68 C 120,70 132,74 132,78 L 132,128 L 68,128 Z" },
  { id: "abdomen-f", label: "Abdomen", bodyPart: "Abdomen", view: "front",
    d: "M 72,128 L 72,165 C 72,168 80,170 100,170 C 120,170 128,168 128,165 L 128,128 Z" },
  { id: "pelvis-f", label: "Pelvis", bodyPart: "Pelvis", view: "front",
    d: "M 74,165 C 74,168 82,172 100,172 C 118,172 126,168 126,165 L 126,185 C 120,195 110,198 100,198 C 90,198 80,195 74,185 Z" },

  // LEFT ARM (anatomical left = viewer's right)
  { id: "shoulder-l-f", label: "Shoulder (L)", bodyPart: "Shoulder (L)", view: "front",
    d: "M 132,78 C 136,76 142,76 146,80 L 148,90 C 144,86 138,84 132,84 Z" },
  { id: "upper-arm-l-f", label: "Upper Arm (L)", bodyPart: "Upper Arm (L)", view: "front",
    d: "M 134,84 C 138,84 144,86 148,90 L 150,130 L 136,128 Z" },
  { id: "elbow-l-f", label: "Elbow (L)", bodyPart: "Elbow (L)", view: "front",
    d: "M 136,128 L 150,130 L 151,144 L 137,142 Z" },
  { id: "forearm-l-f", label: "Forearm (L)", bodyPart: "Forearm (L)", view: "front",
    d: "M 137,142 L 151,144 L 154,184 L 140,182 Z" },
  { id: "wrist-l-f", label: "Wrist (L)", bodyPart: "Wrist (L)", view: "front",
    d: "M 140,182 L 154,184 L 155,192 L 141,190 Z" },
  { id: "hand-l-f", label: "Hand (L)", bodyPart: "Hand (L)", view: "front",
    d: "M 141,190 L 155,192 L 156,206 L 142,204 Z" },
  { id: "fingers-l-f", label: "Fingers (L)", bodyPart: "Fingers (L)", view: "front",
    d: "M 142,204 L 156,206 L 160,216 C 158,220 156,222 154,222 L 152,218 L 150,222 L 148,218 L 146,222 L 144,218 L 142,220 C 140,218 139,216 140,212 Z" },

  // RIGHT ARM (anatomical right = viewer's left)
  { id: "shoulder-r-f", label: "Shoulder (R)", bodyPart: "Shoulder (R)", view: "front",
    d: "M 68,78 C 64,76 58,76 54,80 L 52,90 C 56,86 62,84 68,84 Z" },
  { id: "upper-arm-r-f", label: "Upper Arm (R)", bodyPart: "Upper Arm (R)", view: "front",
    d: "M 66,84 C 62,84 56,86 52,90 L 50,130 L 64,128 Z" },
  { id: "elbow-r-f", label: "Elbow (R)", bodyPart: "Elbow (R)", view: "front",
    d: "M 64,128 L 50,130 L 49,144 L 63,142 Z" },
  { id: "forearm-r-f", label: "Forearm (R)", bodyPart: "Forearm (R)", view: "front",
    d: "M 63,142 L 49,144 L 46,184 L 60,182 Z" },
  { id: "wrist-r-f", label: "Wrist (R)", bodyPart: "Wrist (R)", view: "front",
    d: "M 60,182 L 46,184 L 45,192 L 59,190 Z" },
  { id: "hand-r-f", label: "Hand (R)", bodyPart: "Hand (R)", view: "front",
    d: "M 59,190 L 45,192 L 44,206 L 58,204 Z" },
  { id: "fingers-r-f", label: "Fingers (R)", bodyPart: "Fingers (R)", view: "front",
    d: "M 58,204 L 44,206 L 40,216 C 42,220 44,222 46,222 L 48,218 L 50,222 L 52,218 L 54,222 L 56,218 L 58,220 C 60,218 61,216 60,212 Z" },

  // LEFT LEG
  { id: "hip-l-f", label: "Hip (L)", bodyPart: "Hip (L)", view: "front",
    d: "M 102,185 C 108,192 114,196 120,196 L 120,206 L 102,206 Z" },
  { id: "thigh-l-f", label: "Thigh (L)", bodyPart: "Thigh (L)", view: "front",
    d: "M 102,206 L 120,206 C 118,230 116,254 114,268 L 104,268 C 102,254 102,230 102,206 Z" },
  { id: "knee-l-f", label: "Knee (L)", bodyPart: "Knee (L)", view: "front",
    d: "M 104,268 L 114,268 C 115,276 115,282 114,288 L 104,288 C 103,282 103,276 104,268 Z" },
  { id: "lower-leg-l-f", label: "Lower Leg (L)", bodyPart: "Lower Leg (L)", view: "front",
    d: "M 104,288 L 114,288 C 113,310 112,340 111,362 L 105,362 C 104,340 104,310 104,288 Z" },
  { id: "ankle-l-f", label: "Ankle (L)", bodyPart: "Ankle (L)", view: "front",
    d: "M 105,362 L 111,362 L 112,374 L 104,374 Z" },
  { id: "foot-l-f", label: "Foot (L)", bodyPart: "Foot (L)", view: "front",
    d: "M 104,374 L 112,374 L 116,384 C 116,390 114,392 104,392 C 100,392 100,388 102,384 Z" },
  { id: "toes-l-f", label: "Toes (L)", bodyPart: "Toes (L)", view: "front",
    d: "M 116,384 L 120,382 C 122,384 122,388 120,390 L 118,390 C 117,392 116,392 116,390 Z" },

  // RIGHT LEG
  { id: "hip-r-f", label: "Hip (R)", bodyPart: "Hip (R)", view: "front",
    d: "M 98,185 C 92,192 86,196 80,196 L 80,206 L 98,206 Z" },
  { id: "thigh-r-f", label: "Thigh (R)", bodyPart: "Thigh (R)", view: "front",
    d: "M 98,206 L 80,206 C 82,230 84,254 86,268 L 96,268 C 98,254 98,230 98,206 Z" },
  { id: "knee-r-f", label: "Knee (R)", bodyPart: "Knee (R)", view: "front",
    d: "M 96,268 L 86,268 C 85,276 85,282 86,288 L 96,288 C 97,282 97,276 96,268 Z" },
  { id: "lower-leg-r-f", label: "Lower Leg (R)", bodyPart: "Lower Leg (R)", view: "front",
    d: "M 96,288 L 86,288 C 87,310 88,340 89,362 L 95,362 C 96,340 96,310 96,288 Z" },
  { id: "ankle-r-f", label: "Ankle (R)", bodyPart: "Ankle (R)", view: "front",
    d: "M 95,362 L 89,362 L 88,374 L 96,374 Z" },
  { id: "foot-r-f", label: "Foot (R)", bodyPart: "Foot (R)", view: "front",
    d: "M 96,374 L 88,374 L 84,384 C 84,390 86,392 96,392 C 100,392 100,388 98,384 Z" },
  { id: "toes-r-f", label: "Toes (R)", bodyPart: "Toes (R)", view: "front",
    d: "M 84,384 L 80,382 C 78,384 78,388 80,390 L 82,390 C 83,392 84,392 84,390 Z" },
]

// ── BACK VIEW REGIONS ───────────────────────────

const BACK_REGIONS: BodyRegion[] = [
  // HEAD (back view — no face/eyes, ears still visible)
  { id: "head-b", label: "Head", bodyPart: "Head", view: "back",
    d: "M 100,10 C 86,10 76,18 74,30 L 74,44 C 74,52 86,58 100,58 C 114,58 126,52 126,44 L 126,30 C 124,18 114,10 100,10 Z" },
  { id: "ear-l-b", label: "Ears", bodyPart: "Ears", view: "back",
    d: "M 74,30 C 70,28 68,32 68,36 C 68,40 70,42 74,40 Z" },
  { id: "ear-r-b", label: "Ears", bodyPart: "Ears", view: "back",
    d: "M 126,30 C 130,28 132,32 132,36 C 132,40 130,42 126,40 Z" },

  // NECK
  { id: "neck-b", label: "Neck", bodyPart: "Neck", view: "back",
    d: "M 93,56 L 93,68 C 96,70 104,70 107,68 L 107,56 C 104,60 96,60 93,56 Z" },

  // BACK
  { id: "upper-back-b", label: "Upper Back", bodyPart: "Upper Back", view: "back",
    d: "M 68,78 C 68,74 80,70 93,68 L 107,68 C 120,70 132,74 132,78 L 132,128 L 68,128 Z" },
  { id: "lower-back-b", label: "Lower Back", bodyPart: "Lower Back", view: "back",
    d: "M 72,128 L 72,165 C 72,168 80,170 100,170 C 120,170 128,168 128,165 L 128,128 Z" },
  { id: "pelvis-b", label: "Pelvis", bodyPart: "Pelvis", view: "back",
    d: "M 74,165 C 74,168 82,172 100,172 C 118,172 126,168 126,165 L 126,185 C 120,195 110,198 100,198 C 90,198 80,195 74,185 Z" },

  // LEFT ARM (back view — mirrored: anatomical L = viewer's L)
  { id: "shoulder-l-b", label: "Shoulder (L)", bodyPart: "Shoulder (L)", view: "back",
    d: "M 68,78 C 64,76 58,76 54,80 L 52,90 C 56,86 62,84 68,84 Z" },
  { id: "upper-arm-l-b", label: "Upper Arm (L)", bodyPart: "Upper Arm (L)", view: "back",
    d: "M 66,84 C 62,84 56,86 52,90 L 50,130 L 64,128 Z" },
  { id: "elbow-l-b", label: "Elbow (L)", bodyPart: "Elbow (L)", view: "back",
    d: "M 64,128 L 50,130 L 49,144 L 63,142 Z" },
  { id: "forearm-l-b", label: "Forearm (L)", bodyPart: "Forearm (L)", view: "back",
    d: "M 63,142 L 49,144 L 46,184 L 60,182 Z" },
  { id: "wrist-l-b", label: "Wrist (L)", bodyPart: "Wrist (L)", view: "back",
    d: "M 60,182 L 46,184 L 45,192 L 59,190 Z" },
  { id: "hand-l-b", label: "Hand (L)", bodyPart: "Hand (L)", view: "back",
    d: "M 59,190 L 45,192 L 44,206 L 58,204 Z" },
  { id: "fingers-l-b", label: "Fingers (L)", bodyPart: "Fingers (L)", view: "back",
    d: "M 58,204 L 44,206 L 40,216 C 42,220 44,222 46,222 L 48,218 L 50,222 L 52,218 L 54,222 L 56,218 L 58,220 C 60,218 61,216 60,212 Z" },

  // RIGHT ARM (back view — mirrored)
  { id: "shoulder-r-b", label: "Shoulder (R)", bodyPart: "Shoulder (R)", view: "back",
    d: "M 132,78 C 136,76 142,76 146,80 L 148,90 C 144,86 138,84 132,84 Z" },
  { id: "upper-arm-r-b", label: "Upper Arm (R)", bodyPart: "Upper Arm (R)", view: "back",
    d: "M 134,84 C 138,84 144,86 148,90 L 150,130 L 136,128 Z" },
  { id: "elbow-r-b", label: "Elbow (R)", bodyPart: "Elbow (R)", view: "back",
    d: "M 136,128 L 150,130 L 151,144 L 137,142 Z" },
  { id: "forearm-r-b", label: "Forearm (R)", bodyPart: "Forearm (R)", view: "back",
    d: "M 137,142 L 151,144 L 154,184 L 140,182 Z" },
  { id: "wrist-r-b", label: "Wrist (R)", bodyPart: "Wrist (R)", view: "back",
    d: "M 140,182 L 154,184 L 155,192 L 141,190 Z" },
  { id: "hand-r-b", label: "Hand (R)", bodyPart: "Hand (R)", view: "back",
    d: "M 141,190 L 155,192 L 156,206 L 142,204 Z" },
  { id: "fingers-r-b", label: "Fingers (R)", bodyPart: "Fingers (R)", view: "back",
    d: "M 142,204 L 156,206 L 160,216 C 158,220 156,222 154,222 L 152,218 L 150,222 L 148,218 L 146,222 L 144,218 L 142,220 C 140,218 139,216 140,212 Z" },

  // LEFT LEG (back view — mirrored)
  { id: "hip-l-b", label: "Hip (L)", bodyPart: "Hip (L)", view: "back",
    d: "M 98,185 C 92,192 86,196 80,196 L 80,206 L 98,206 Z" },
  { id: "thigh-l-b", label: "Thigh (L)", bodyPart: "Thigh (L)", view: "back",
    d: "M 98,206 L 80,206 C 82,230 84,254 86,268 L 96,268 C 98,254 98,230 98,206 Z" },
  { id: "knee-l-b", label: "Knee (L)", bodyPart: "Knee (L)", view: "back",
    d: "M 96,268 L 86,268 C 85,276 85,282 86,288 L 96,288 C 97,282 97,276 96,268 Z" },
  { id: "lower-leg-l-b", label: "Lower Leg (L)", bodyPart: "Lower Leg (L)", view: "back",
    d: "M 96,288 L 86,288 C 87,310 88,340 89,362 L 95,362 C 96,340 96,310 96,288 Z" },
  { id: "ankle-l-b", label: "Ankle (L)", bodyPart: "Ankle (L)", view: "back",
    d: "M 95,362 L 89,362 L 88,374 L 96,374 Z" },
  { id: "foot-l-b", label: "Foot (L)", bodyPart: "Foot (L)", view: "back",
    d: "M 96,374 L 88,374 L 84,384 C 84,390 86,392 96,392 C 100,392 100,388 98,384 Z" },
  { id: "toes-l-b", label: "Toes (L)", bodyPart: "Toes (L)", view: "back",
    d: "M 84,384 L 80,382 C 78,384 78,388 80,390 L 82,390 C 83,392 84,392 84,390 Z" },

  // RIGHT LEG (back view — mirrored)
  { id: "hip-r-b", label: "Hip (R)", bodyPart: "Hip (R)", view: "back",
    d: "M 102,185 C 108,192 114,196 120,196 L 120,206 L 102,206 Z" },
  { id: "thigh-r-b", label: "Thigh (R)", bodyPart: "Thigh (R)", view: "back",
    d: "M 102,206 L 120,206 C 118,230 116,254 114,268 L 104,268 C 102,254 102,230 102,206 Z" },
  { id: "knee-r-b", label: "Knee (R)", bodyPart: "Knee (R)", view: "back",
    d: "M 104,268 L 114,268 C 115,276 115,282 114,288 L 104,288 C 103,282 103,276 104,268 Z" },
  { id: "lower-leg-r-b", label: "Lower Leg (R)", bodyPart: "Lower Leg (R)", view: "back",
    d: "M 104,288 L 114,288 C 113,310 112,340 111,362 L 105,362 C 104,340 104,310 104,288 Z" },
  { id: "ankle-r-b", label: "Ankle (R)", bodyPart: "Ankle (R)", view: "back",
    d: "M 105,362 L 111,362 L 112,374 L 104,374 Z" },
  { id: "foot-r-b", label: "Foot (R)", bodyPart: "Foot (R)", view: "back",
    d: "M 104,374 L 112,374 L 116,384 C 116,390 114,392 104,392 C 100,392 100,388 102,384 Z" },
  { id: "toes-r-b", label: "Toes (R)", bodyPart: "Toes (R)", view: "back",
    d: "M 116,384 L 120,382 C 122,384 122,388 120,390 L 118,390 C 117,392 116,392 116,390 Z" },
]

// ── Anatomical detail lines (non-interactive) ───

const FRONT_DETAILS = `
  M 90,38 C 92,40 94,41 96,40 C 98,39 100,40 100,42 C 100,44 98,46 96,46 C 94,46 92,44 90,46
  M 85,112 C 90,116 100,118 110,116 C 115,114 115,112
  M 88,98 C 92,100 96,100 100,98
  M 100,98 C 104,100 108,100 112,98
  M 100,128 L 100,168
  M 93,140 C 96,142 104,142 107,140
`

const BACK_DETAILS = `
  M 80,90 L 100,86 L 120,90
  M 82,100 C 90,96 110,96 118,100
  M 100,78 L 100,165
  M 86,110 C 90,108 94,108 100,110 C 106,108 110,108 114,110
  M 90,130 C 94,128 106,128 110,130
`

// ── Component ───────────────────────────────────

interface BodyMapProps {
  value?: string
  onChange?: (bodyPart: string) => void
  readOnly?: boolean
  className?: string
}

export function BodyMap({ value, onChange, readOnly = false, className }: BodyMapProps) {
  const [activeView, setActiveView] = useState<"front" | "back">("front")
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  const regions = activeView === "front" ? FRONT_REGIONS : BACK_REGIONS

  function handleClick(region: BodyRegion) {
    if (readOnly) return
    onChange?.(region.bodyPart)
  }

  function isSelected(region: BodyRegion) {
    return value === region.bodyPart
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* View Toggle */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setActiveView("front")}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            activeView === "front"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => setActiveView("back")}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            activeView === "back"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Back
        </button>
      </div>

      {/* Hovered / Selected Label */}
      <div className="h-5 text-xs font-medium text-center">
        {hoveredRegion ? (
          <span className="text-primary">{hoveredRegion}</span>
        ) : value ? (
          <span className="text-red-600">{value}</span>
        ) : !readOnly ? (
          <span className="text-muted-foreground">Click to select injured area</span>
        ) : null}
      </div>

      {/* SVG Body Map */}
      <svg
        viewBox="30 5 140 400"
        className="w-full max-w-[220px] h-auto"
        style={{ touchAction: "manipulation" }}
      >
        {/* Body silhouette outline */}
        <g>
          {/* Head */}
          <ellipse cx="100" cy="34" rx="26" ry="28" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Ears */}
          {activeView === "front" ? (
            <>
              <ellipse cx="79" cy="36" rx="4" ry="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.6" />
              <ellipse cx="121" cy="36" rx="4" ry="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.6" />
            </>
          ) : (
            <>
              <ellipse cx="73" cy="36" rx="4" ry="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.6" />
              <ellipse cx="127" cy="36" rx="4" ry="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.6" />
            </>
          )}
          {/* Neck */}
          <rect x="92" y="56" width="16" height="14" rx="3" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.6" />
          {/* Torso */}
          <path d="M 68,70 C 58,72 52,78 52,84 L 50,130 L 49,144 L 46,184 L 45,192 L 44,206 L 40,216 C 38,222 42,226 48,222 L 56,218 L 58,222 L 60,212 L 59,192 L 60,182 L 63,142 L 64,130 L 68,90 L 70,128 L 72,165 L 74,185 L 78,198 L 80,206 L 82,240 L 86,268 L 85,282 L 86,288 L 87,340 L 88,374 L 84,384 L 80,382 C 78,386 78,392 84,394 L 96,394 C 102,394 102,386 98,382 L 96,374 L 95,362 L 96,288 L 97,282 L 96,268 L 98,240 L 98,206 L 100,198 L 102,206 L 102,240 L 104,268 L 103,282 L 104,288 L 105,362 L 104,374 L 102,382 C 100,386 100,394 104,394 L 116,394 C 122,394 122,386 120,382 L 116,384 L 112,374 L 111,340 L 114,288 L 115,282 L 114,268 L 118,240 L 120,206 L 122,198 L 126,185 L 128,165 L 130,128 L 132,90 L 136,130 L 137,142 L 140,182 L 141,192 L 142,212 L 144,218 L 146,222 L 148,218 L 152,222 C 158,226 162,222 160,216 L 156,206 L 155,192 L 154,184 L 151,144 L 150,130 L 148,84 C 148,78 142,72 132,70 Z"
            fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" strokeLinejoin="round" />
        </g>

        {/* Anatomical detail lines */}
        <path
          d={activeView === "front" ? FRONT_DETAILS : BACK_DETAILS}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="0.4"
          strokeLinecap="round"
        />

        {/* Front view facial features */}
        {activeView === "front" && (
          <g>
            {/* Eyes */}
            <ellipse cx="92" cy="32" rx="4" ry="2.5" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            <ellipse cx="108" cy="32" rx="4" ry="2.5" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="92" cy="32" r="1.2" fill="#64748b" />
            <circle cx="108" cy="32" r="1.2" fill="#64748b" />
            {/* Nose */}
            <path d="M 100,36 L 97,42 C 98,43 102,43 103,42 L 100,36" fill="none" stroke="#94a3b8" strokeWidth="0.4" />
            {/* Mouth */}
            <path d="M 94,47 C 96,49 104,49 106,47" fill="none" stroke="#94a3b8" strokeWidth="0.4" />
            {/* Eyebrows */}
            <path d="M 87,28 C 89,27 95,27 97,28" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            <path d="M 103,28 C 105,27 111,27 113,28" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          </g>
        )}

        {/* Finger detail lines (front view) */}
        {activeView === "front" && (
          <g stroke="#cbd5e1" strokeWidth="0.3" fill="none">
            {/* Left hand fingers */}
            <line x1="154" y1="208" x2="158" y2="218" />
            <line x1="152" y1="208" x2="154" y2="220" />
            <line x1="150" y1="208" x2="150" y2="220" />
            <line x1="148" y1="208" x2="146" y2="218" />
            {/* Right hand fingers */}
            <line x1="46" y1="208" x2="42" y2="218" />
            <line x1="48" y1="208" x2="46" y2="220" />
            <line x1="50" y1="208" x2="50" y2="220" />
            <line x1="52" y1="208" x2="54" y2="218" />
          </g>
        )}

        {/* Toe detail lines */}
        <g stroke="#cbd5e1" strokeWidth="0.3" fill="none">
          {/* Left foot toes */}
          <line x1="117" y1="386" x2="119" y2="388" />
          <line x1="118" y1="384" x2="120" y2="386" />
          {/* Right foot toes */}
          <line x1="83" y1="386" x2="81" y2="388" />
          <line x1="82" y1="384" x2="80" y2="386" />
        </g>

        {/* Clickable regions */}
        {regions.map((region) => {
          const selected = isSelected(region)
          const hovered = hoveredRegion === region.label

          return (
            <path
              key={region.id}
              d={region.d}
              fill={
                selected
                  ? "rgba(220, 38, 38, 0.45)"
                  : hovered && !readOnly
                    ? "rgba(59, 130, 246, 0.2)"
                    : "transparent"
              }
              stroke={
                selected
                  ? "rgba(220, 38, 38, 0.8)"
                  : hovered && !readOnly
                    ? "rgba(59, 130, 246, 0.4)"
                    : "transparent"
              }
              strokeWidth={selected ? "1.2" : "0.8"}
              className={cn(
                "transition-all duration-150",
                !readOnly && "cursor-pointer"
              )}
              onClick={() => handleClick(region)}
              onMouseEnter={() => !readOnly && setHoveredRegion(region.label)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <title>{region.label}</title>
            </path>
          )
        })}

        {/* View label */}
        <text
          x="100"
          y="408"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="7"
          fontFamily="sans-serif"
        >
          {activeView === "front" ? "FRONT VIEW" : "BACK VIEW"}
        </text>
      </svg>
    </div>
  )
}
