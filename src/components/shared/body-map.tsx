"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// ── Body region definitions ─────────────────────
// Each region maps SVG path coordinates to BODY_PARTS constant values

interface BodyRegion {
  id: string
  label: string
  bodyPart: string // matches BODY_PARTS constant
  // SVG path for the clickable area
  d: string
  // Which view this region belongs to
  view: "front" | "back"
}

const FRONT_REGIONS: BodyRegion[] = [
  // Head & Face
  { id: "head-f", label: "Head", bodyPart: "Head", view: "front", d: "M 85,8 C 75,8 67,16 65,26 L 65,36 C 65,50 73,58 85,60 L 90,60 C 102,58 110,50 110,36 L 110,26 C 108,16 100,8 90,8 Z" },
  { id: "face", label: "Face", bodyPart: "Face", view: "front", d: "M 75,28 C 75,22 80,18 87,18 L 88,18 C 95,18 100,22 100,28 L 100,42 C 100,50 95,54 88,54 L 87,54 C 80,54 75,50 75,42 Z" },
  { id: "neck-f", label: "Neck", bodyPart: "Neck", view: "front", d: "M 80,58 L 80,72 L 95,72 L 95,58 C 90,62 85,62 80,58 Z" },

  // Torso
  { id: "chest", label: "Chest", bodyPart: "Chest", view: "front", d: "M 58,74 L 58,120 L 117,120 L 117,74 L 95,72 L 80,72 Z" },
  { id: "abdomen", label: "Abdomen", bodyPart: "Abdomen", view: "front", d: "M 62,120 L 62,155 L 113,155 L 113,120 Z" },
  { id: "pelvis", label: "Pelvis", bodyPart: "Pelvis", view: "front", d: "M 65,155 L 60,175 L 75,185 L 87,188 L 100,185 L 115,175 L 110,155 Z" },

  // Left Arm (anatomical left = viewer's right)
  { id: "shoulder-l", label: "Shoulder (L)", bodyPart: "Shoulder (L)", view: "front", d: "M 117,74 L 135,78 L 138,90 L 120,88 L 117,80 Z" },
  { id: "upper-arm-l", label: "Upper Arm (L)", bodyPart: "Upper Arm (L)", view: "front", d: "M 120,88 L 138,90 L 142,130 L 125,128 Z" },
  { id: "elbow-l", label: "Elbow (L)", bodyPart: "Elbow (L)", view: "front", d: "M 125,128 L 142,130 L 144,142 L 127,140 Z" },
  { id: "forearm-l", label: "Forearm (L)", bodyPart: "Forearm (L)", view: "front", d: "M 127,140 L 144,142 L 148,178 L 132,176 Z" },
  { id: "wrist-l", label: "Wrist (L)", bodyPart: "Wrist (L)", view: "front", d: "M 132,176 L 148,178 L 150,188 L 134,186 Z" },
  { id: "hand-l", label: "Hand (L)", bodyPart: "Hand (L)", view: "front", d: "M 134,186 L 150,188 L 155,210 L 138,208 Z" },

  // Right Arm (anatomical right = viewer's left)
  { id: "shoulder-r", label: "Shoulder (R)", bodyPart: "Shoulder (R)", view: "front", d: "M 58,74 L 40,78 L 37,90 L 55,88 L 58,80 Z" },
  { id: "upper-arm-r", label: "Upper Arm (R)", bodyPart: "Upper Arm (R)", view: "front", d: "M 55,88 L 37,90 L 33,130 L 50,128 Z" },
  { id: "elbow-r", label: "Elbow (R)", bodyPart: "Elbow (R)", view: "front", d: "M 50,128 L 33,130 L 31,142 L 48,140 Z" },
  { id: "forearm-r", label: "Forearm (R)", bodyPart: "Forearm (R)", view: "front", d: "M 48,140 L 31,142 L 27,178 L 43,176 Z" },
  { id: "wrist-r", label: "Wrist (R)", bodyPart: "Wrist (R)", view: "front", d: "M 43,176 L 27,178 L 25,188 L 41,186 Z" },
  { id: "hand-r", label: "Hand (R)", bodyPart: "Hand (R)", view: "front", d: "M 41,186 L 25,188 L 20,210 L 37,208 Z" },

  // Left Leg
  { id: "hip-l", label: "Hip (L)", bodyPart: "Hip (L)", view: "front", d: "M 95,170 L 110,170 L 112,190 L 97,190 Z" },
  { id: "thigh-l", label: "Thigh (L)", bodyPart: "Thigh (L)", view: "front", d: "M 95,190 L 112,190 L 110,250 L 93,250 Z" },
  { id: "knee-l", label: "Knee (L)", bodyPart: "Knee (L)", view: "front", d: "M 93,250 L 110,250 L 109,270 L 92,270 Z" },
  { id: "lower-leg-l", label: "Lower Leg (L)", bodyPart: "Lower Leg (L)", view: "front", d: "M 92,270 L 109,270 L 107,340 L 91,340 Z" },
  { id: "ankle-l", label: "Ankle (L)", bodyPart: "Ankle (L)", view: "front", d: "M 91,340 L 107,340 L 106,355 L 90,355 Z" },
  { id: "foot-l", label: "Foot (L)", bodyPart: "Foot (L)", view: "front", d: "M 90,355 L 106,355 L 112,375 L 88,375 Z" },

  // Right Leg
  { id: "hip-r", label: "Hip (R)", bodyPart: "Hip (R)", view: "front", d: "M 65,170 L 80,170 L 78,190 L 63,190 Z" },
  { id: "thigh-r", label: "Thigh (R)", bodyPart: "Thigh (R)", view: "front", d: "M 63,190 L 78,190 L 82,250 L 65,250 Z" },
  { id: "knee-r", label: "Knee (R)", bodyPart: "Knee (R)", view: "front", d: "M 65,250 L 82,250 L 83,270 L 66,270 Z" },
  { id: "lower-leg-r", label: "Lower Leg (R)", bodyPart: "Lower Leg (R)", view: "front", d: "M 66,270 L 83,270 L 84,340 L 68,340 Z" },
  { id: "ankle-r", label: "Ankle (R)", bodyPart: "Ankle (R)", view: "front", d: "M 68,340 L 84,340 L 85,355 L 69,355 Z" },
  { id: "foot-r", label: "Foot (R)", bodyPart: "Foot (R)", view: "front", d: "M 69,355 L 85,355 L 87,375 L 63,375 Z" },
]

const BACK_REGIONS: BodyRegion[] = [
  // Head (back)
  { id: "head-b", label: "Head", bodyPart: "Head", view: "back", d: "M 85,8 C 75,8 67,16 65,26 L 65,36 C 65,50 73,58 85,60 L 90,60 C 102,58 110,50 110,36 L 110,26 C 108,16 100,8 90,8 Z" },
  { id: "neck-b", label: "Neck", bodyPart: "Neck", view: "back", d: "M 80,58 L 80,72 L 95,72 L 95,58 C 90,62 85,62 80,58 Z" },

  // Back
  { id: "upper-back", label: "Upper Back", bodyPart: "Upper Back", view: "back", d: "M 58,74 L 58,120 L 117,120 L 117,74 L 95,72 L 80,72 Z" },
  { id: "lower-back", label: "Lower Back", bodyPart: "Lower Back", view: "back", d: "M 62,120 L 62,155 L 113,155 L 113,120 Z" },
  { id: "pelvis-b", label: "Pelvis", bodyPart: "Pelvis", view: "back", d: "M 65,155 L 60,175 L 75,185 L 87,188 L 100,185 L 115,175 L 110,155 Z" },

  // Left Arm (back view — mirrored, so anatomical left is viewer's left)
  { id: "shoulder-l-b", label: "Shoulder (L)", bodyPart: "Shoulder (L)", view: "back", d: "M 58,74 L 40,78 L 37,90 L 55,88 L 58,80 Z" },
  { id: "upper-arm-l-b", label: "Upper Arm (L)", bodyPart: "Upper Arm (L)", view: "back", d: "M 55,88 L 37,90 L 33,130 L 50,128 Z" },
  { id: "elbow-l-b", label: "Elbow (L)", bodyPart: "Elbow (L)", view: "back", d: "M 50,128 L 33,130 L 31,142 L 48,140 Z" },
  { id: "forearm-l-b", label: "Forearm (L)", bodyPart: "Forearm (L)", view: "back", d: "M 48,140 L 31,142 L 27,178 L 43,176 Z" },
  { id: "wrist-l-b", label: "Wrist (L)", bodyPart: "Wrist (L)", view: "back", d: "M 43,176 L 27,178 L 25,188 L 41,186 Z" },
  { id: "hand-l-b", label: "Hand (L)", bodyPart: "Hand (L)", view: "back", d: "M 41,186 L 25,188 L 20,210 L 37,208 Z" },

  // Right Arm (back view — mirrored)
  { id: "shoulder-r-b", label: "Shoulder (R)", bodyPart: "Shoulder (R)", view: "back", d: "M 117,74 L 135,78 L 138,90 L 120,88 L 117,80 Z" },
  { id: "upper-arm-r-b", label: "Upper Arm (R)", bodyPart: "Upper Arm (R)", view: "back", d: "M 120,88 L 138,90 L 142,130 L 125,128 Z" },
  { id: "elbow-r-b", label: "Elbow (R)", bodyPart: "Elbow (R)", view: "back", d: "M 125,128 L 142,130 L 144,142 L 127,140 Z" },
  { id: "forearm-r-b", label: "Forearm (R)", bodyPart: "Forearm (R)", view: "back", d: "M 127,140 L 144,142 L 148,178 L 132,176 Z" },
  { id: "wrist-r-b", label: "Wrist (R)", bodyPart: "Wrist (R)", view: "back", d: "M 132,176 L 148,178 L 150,188 L 134,186 Z" },
  { id: "hand-r-b", label: "Hand (R)", bodyPart: "Hand (R)", view: "back", d: "M 134,186 L 150,188 L 155,210 L 138,208 Z" },

  // Left Leg (back view — mirrored)
  { id: "hip-l-b", label: "Hip (L)", bodyPart: "Hip (L)", view: "back", d: "M 65,170 L 80,170 L 78,190 L 63,190 Z" },
  { id: "thigh-l-b", label: "Thigh (L)", bodyPart: "Thigh (L)", view: "back", d: "M 63,190 L 78,190 L 82,250 L 65,250 Z" },
  { id: "knee-l-b", label: "Knee (L)", bodyPart: "Knee (L)", view: "back", d: "M 65,250 L 82,250 L 83,270 L 66,270 Z" },
  { id: "lower-leg-l-b", label: "Lower Leg (L)", bodyPart: "Lower Leg (L)", view: "back", d: "M 66,270 L 83,270 L 84,340 L 68,340 Z" },
  { id: "ankle-l-b", label: "Ankle (L)", bodyPart: "Ankle (L)", view: "back", d: "M 68,340 L 84,340 L 85,355 L 69,355 Z" },
  { id: "foot-l-b", label: "Foot (L)", bodyPart: "Foot (L)", view: "back", d: "M 69,355 L 85,355 L 87,375 L 63,375 Z" },

  // Right Leg (back view — mirrored)
  { id: "hip-r-b", label: "Hip (R)", bodyPart: "Hip (R)", view: "back", d: "M 95,170 L 110,170 L 112,190 L 97,190 Z" },
  { id: "thigh-r-b", label: "Thigh (R)", bodyPart: "Thigh (R)", view: "back", d: "M 95,190 L 112,190 L 110,250 L 93,250 Z" },
  { id: "knee-r-b", label: "Knee (R)", bodyPart: "Knee (R)", view: "back", d: "M 93,250 L 110,250 L 109,270 L 92,270 Z" },
  { id: "lower-leg-r-b", label: "Lower Leg (R)", bodyPart: "Lower Leg (R)", view: "back", d: "M 92,270 L 109,270 L 107,340 L 91,340 Z" },
  { id: "ankle-r-b", label: "Ankle (R)", bodyPart: "Ankle (R)", view: "back", d: "M 91,340 L 107,340 L 106,355 L 90,355 Z" },
  { id: "foot-r-b", label: "Foot (R)", bodyPart: "Foot (R)", view: "back", d: "M 90,355 L 106,355 L 112,375 L 88,375 Z" },
]

// ── Human body outline SVG paths ─────────────────

const BODY_OUTLINE_FRONT = `
  M 87,6 C 73,6 64,15 63,27 L 63,38 C 63,52 72,61 85,63 L 80,63 L 78,72
  L 55,75 L 38,80 L 34,92 L 30,132 L 28,145 L 24,180 L 22,192
  L 18,215 L 36,212 L 42,190 L 45,180 L 48,145 L 50,132
  L 55,92 L 58,82 L 60,120 L 60,155 L 58,175 L 62,192
  L 64,250 L 63,270 L 62,340 L 60,358 L 58,378 L 88,378
  L 90,358 L 88,340 L 87,270 L 87,260
  L 88,260 L 88,270 L 87,340 L 85,358 L 87,378 L 117,378
  L 115,358 L 113,340 L 112,270 L 111,250
  L 113,192 L 117,175 L 115,155 L 115,120 L 117,82
  L 120,92 L 125,132 L 127,145 L 130,180 L 133,190
  L 138,212 L 157,215 L 153,192 L 147,145
  L 145,132 L 141,92 L 137,80 L 120,75 L 97,72 L 95,63
  L 90,63 C 103,61 112,52 112,38 L 112,27 C 111,15 102,6 88,6 Z
`

const BODY_OUTLINE_BACK = BODY_OUTLINE_FRONT // Same silhouette for back view

// ── Component Props ─────────────────────────────

interface BodyMapProps {
  /** Currently selected body part */
  value?: string
  /** Callback when a body part is selected */
  onChange?: (bodyPart: string) => void
  /** Read-only mode (for detail pages) */
  readOnly?: boolean
  /** Additional class names */
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
        viewBox="0 0 175 385"
        className="w-full max-w-[200px] h-auto"
        style={{ touchAction: "manipulation" }}
      >
        {/* Body outline */}
        <path
          d={activeView === "front" ? BODY_OUTLINE_FRONT : BODY_OUTLINE_BACK}
          fill="#f1f5f9"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeLinejoin="round"
        />

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
                  ? "rgba(220, 38, 38, 0.5)"
                  : hovered && !readOnly
                    ? "rgba(59, 130, 246, 0.25)"
                    : "transparent"
              }
              stroke={
                selected
                  ? "rgba(220, 38, 38, 0.8)"
                  : hovered && !readOnly
                    ? "rgba(59, 130, 246, 0.5)"
                    : "transparent"
              }
              strokeWidth={selected ? "1.5" : "1"}
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
          x="87"
          y="383"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="8"
          fontFamily="sans-serif"
        >
          {activeView === "front" ? "FRONT VIEW" : "BACK VIEW"}
        </text>
      </svg>
    </div>
  )
}
