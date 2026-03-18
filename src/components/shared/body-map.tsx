"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// ── Body region definitions ─────────────────────────────────────────────────
// viewBox: "30 5 140 400" — body centered at x=100
// Anatomical convention: "Left" = patient's left (viewer's right in front view)

interface BodyRegion {
  id: string
  label: string
  bodyPart: string
  d: string
  view: "front" | "back"
}

// ── FRONT VIEW REGIONS ──────────────────────────────────────────────────────

const FRONT_REGIONS: BodyRegion[] = [
  // HEAD & FACE
  { id: "head-f", label: "Head", bodyPart: "Head", view: "front",
    d: "M 100,8 C 87,8 77,13 75,22 L 74,30 C 76,22 86,14 100,14 C 114,14 124,22 126,30 L 125,22 C 123,13 113,8 100,8 Z" },
  { id: "face-f", label: "Face", bodyPart: "Face", view: "front",
    d: "M 84,26 C 84,20 91,14 100,14 C 109,14 116,20 116,26 L 116,46 C 116,54 109,60 100,60 C 91,60 84,54 84,46 Z" },

  // EYES — separate L/R
  { id: "eye-l-f", label: "Eye (L)", bodyPart: "Eye (L)", view: "front",
    d: "M 103,29 C 105,27 111,27 113,30 C 111,34 105,34 103,31 Z" },
  { id: "eye-r-f", label: "Eye (R)", bodyPart: "Eye (R)", view: "front",
    d: "M 87,30 C 89,27 95,27 97,29 C 95,34 89,34 87,31 Z" },

  // EARS — separate L/R
  { id: "ear-l-f", label: "Ear (L)", bodyPart: "Ear (L)", view: "front",
    d: "M 116,28 C 120,26 123,29 123,34 C 123,39 121,43 118,44 C 117,44.5 116,44 116,43 L 116,28 Z" },
  { id: "ear-r-f", label: "Ear (R)", bodyPart: "Ear (R)", view: "front",
    d: "M 84,28 C 80,26 77,29 77,34 C 77,39 79,43 82,44 C 83,44.5 84,44 84,43 L 84,28 Z" },

  // NECK
  { id: "neck-f", label: "Neck", bodyPart: "Neck", view: "front",
    d: "M 93,58 C 91,60 90,64 90,68 L 90,72 C 93,74 107,74 110,72 L 110,68 C 110,64 109,60 107,58 C 104,62 96,62 93,58 Z" },

  // TORSO
  { id: "chest-f", label: "Chest", bodyPart: "Chest", view: "front",
    d: "M 70,80 C 62,78 58,82 57,88 L 64,128 L 136,128 L 143,88 C 142,82 138,78 130,80 C 124,74 114,72 110,72 L 90,72 C 86,72 76,74 70,80 Z" },
  { id: "abdomen-f", label: "Abdomen", bodyPart: "Abdomen", view: "front",
    d: "M 64,128 L 72,168 C 80,172 90,174 100,174 C 110,174 120,172 128,168 L 136,128 Z" },
  { id: "pelvis-f", label: "Pelvis", bodyPart: "Pelvis", view: "front",
    d: "M 72,168 C 72,172 74,178 78,182 C 84,188 90,192 100,194 C 110,192 116,188 122,182 C 126,178 128,172 128,168 C 120,172 110,174 100,174 C 90,174 80,172 72,168 Z" },

  // LEFT ARM (anatomical L = viewer's right)
  { id: "shoulder-l-f", label: "Shoulder (L)", bodyPart: "Shoulder (L)", view: "front",
    d: "M 130,80 C 136,76 144,76 148,82 L 150,92 C 146,86 140,84 136,84 L 136,128 L 143,88 C 142,82 138,78 130,80 Z" },
  { id: "upper-arm-l-f", label: "Upper Arm (L)", bodyPart: "Upper Arm (L)", view: "front",
    d: "M 136,84 C 140,84 146,86 150,92 L 152,132 C 148,128 144,126 140,126 L 136,128 Z" },
  { id: "elbow-l-f", label: "Elbow (L)", bodyPart: "Elbow (L)", view: "front",
    d: "M 140,126 C 144,126 148,128 152,132 L 153,146 C 149,142 145,140 141,140 Z" },
  { id: "forearm-l-f", label: "Forearm (L)", bodyPart: "Forearm (L)", view: "front",
    d: "M 141,140 C 145,140 149,142 153,146 L 156,186 C 152,184 148,183 144,183 Z" },
  { id: "wrist-l-f", label: "Wrist (L)", bodyPart: "Wrist (L)", view: "front",
    d: "M 144,183 C 148,183 152,184 156,186 L 157,196 C 153,194 149,193 145,193 Z" },
  { id: "hand-l-f", label: "Hand (L)", bodyPart: "Hand (L)", view: "front",
    d: "M 145,193 C 149,193 153,194 157,196 L 159,210 C 155,208 151,207 147,207 Z" },
  { id: "fingers-l-f", label: "Fingers (L)", bodyPart: "Fingers (L)", view: "front",
    d: "M 147,207 C 151,207 155,208 159,210 L 162,218 C 160,223 157,224 155,222 L 153,218 L 151,222 C 149,224 147,222 147,218 L 145,222 C 143,224 141,222 141,218 L 139,220 C 137,221 136,219 137,215 Z" },

  // RIGHT ARM (anatomical R = viewer's left)
  { id: "shoulder-r-f", label: "Shoulder (R)", bodyPart: "Shoulder (R)", view: "front",
    d: "M 70,80 C 64,76 56,76 52,82 L 50,92 C 54,86 60,84 64,84 L 64,128 L 57,88 C 58,82 62,78 70,80 Z" },
  { id: "upper-arm-r-f", label: "Upper Arm (R)", bodyPart: "Upper Arm (R)", view: "front",
    d: "M 64,84 C 60,84 54,86 50,92 L 48,132 C 52,128 56,126 60,126 L 64,128 Z" },
  { id: "elbow-r-f", label: "Elbow (R)", bodyPart: "Elbow (R)", view: "front",
    d: "M 60,126 C 56,126 52,128 48,132 L 47,146 C 51,142 55,140 59,140 Z" },
  { id: "forearm-r-f", label: "Forearm (R)", bodyPart: "Forearm (R)", view: "front",
    d: "M 59,140 C 55,140 51,142 47,146 L 44,186 C 48,184 52,183 56,183 Z" },
  { id: "wrist-r-f", label: "Wrist (R)", bodyPart: "Wrist (R)", view: "front",
    d: "M 56,183 C 52,183 48,184 44,186 L 43,196 C 47,194 51,193 55,193 Z" },
  { id: "hand-r-f", label: "Hand (R)", bodyPart: "Hand (R)", view: "front",
    d: "M 55,193 C 51,193 47,194 43,196 L 41,210 C 45,208 49,207 53,207 Z" },
  { id: "fingers-r-f", label: "Fingers (R)", bodyPart: "Fingers (R)", view: "front",
    d: "M 53,207 C 49,207 45,208 41,210 L 38,218 C 40,223 43,224 45,222 L 47,218 L 49,222 C 51,224 53,222 53,218 L 55,222 C 57,224 59,222 59,218 L 61,220 C 63,221 64,219 63,215 Z" },

  // LEFT LEG
  { id: "hip-l-f", label: "Hip (L)", bodyPart: "Hip (L)", view: "front",
    d: "M 100,194 C 107,194 116,194 122,190 L 124,200 C 120,204 114,206 106,206 L 102,206 Z" },
  { id: "thigh-l-f", label: "Thigh (L)", bodyPart: "Thigh (L)", view: "front",
    d: "M 102,206 L 106,206 C 114,206 120,204 124,200 C 122,224 120,248 118,268 L 108,268 C 106,248 104,224 102,206 Z" },
  { id: "knee-l-f", label: "Knee (L)", bodyPart: "Knee (L)", view: "front",
    d: "M 108,268 L 118,268 C 119,276 119,284 118,290 L 108,290 C 107,284 107,276 108,268 Z" },
  { id: "lower-leg-l-f", label: "Lower Leg (L)", bodyPart: "Lower Leg (L)", view: "front",
    d: "M 108,290 L 118,290 C 117,314 116,342 115,364 L 107,364 C 107,342 107,314 108,290 Z" },
  { id: "ankle-l-f", label: "Ankle (L)", bodyPart: "Ankle (L)", view: "front",
    d: "M 107,364 L 115,364 C 116,374 116,378 115,382 L 107,382 C 106,378 106,374 107,364 Z" },
  { id: "foot-l-f", label: "Foot (L)", bodyPart: "Foot (L)", view: "front",
    d: "M 107,382 L 115,382 C 117,386 120,388 122,390 L 122,394 C 118,396 110,396 107,394 C 106,391 106,386 107,382 Z" },
  { id: "toes-l-f", label: "Toes (L)", bodyPart: "Toes (L)", view: "front",
    d: "M 122,390 L 127,388 C 129,390 129,394 127,396 L 125,396 L 123,392 L 122,394 Z" },

  // RIGHT LEG
  { id: "hip-r-f", label: "Hip (R)", bodyPart: "Hip (R)", view: "front",
    d: "M 100,194 C 93,194 84,194 78,190 L 76,200 C 80,204 86,206 94,206 L 98,206 Z" },
  { id: "thigh-r-f", label: "Thigh (R)", bodyPart: "Thigh (R)", view: "front",
    d: "M 98,206 L 94,206 C 86,206 80,204 76,200 C 78,224 80,248 82,268 L 92,268 C 94,248 96,224 98,206 Z" },
  { id: "knee-r-f", label: "Knee (R)", bodyPart: "Knee (R)", view: "front",
    d: "M 92,268 L 82,268 C 81,276 81,284 82,290 L 92,290 C 93,284 93,276 92,268 Z" },
  { id: "lower-leg-r-f", label: "Lower Leg (R)", bodyPart: "Lower Leg (R)", view: "front",
    d: "M 92,290 L 82,290 C 83,314 84,342 85,364 L 93,364 C 93,342 92,314 92,290 Z" },
  { id: "ankle-r-f", label: "Ankle (R)", bodyPart: "Ankle (R)", view: "front",
    d: "M 93,364 L 85,364 C 84,374 84,378 85,382 L 93,382 C 94,378 94,374 93,364 Z" },
  { id: "foot-r-f", label: "Foot (R)", bodyPart: "Foot (R)", view: "front",
    d: "M 93,382 L 85,382 C 83,386 80,388 78,390 L 78,394 C 82,396 90,396 93,394 C 94,391 94,386 93,382 Z" },
  { id: "toes-r-f", label: "Toes (R)", bodyPart: "Toes (R)", view: "front",
    d: "M 78,390 L 73,388 C 71,390 71,394 73,396 L 75,396 L 77,392 L 78,394 Z" },
]

// ── BACK VIEW REGIONS ───────────────────────────────────────────────────────

const BACK_REGIONS: BodyRegion[] = [
  // HEAD (back — no face/eyes)
  { id: "head-b", label: "Head", bodyPart: "Head", view: "back",
    d: "M 100,8 C 87,8 76,14 75,24 L 74,44 C 74,54 86,62 100,62 C 114,62 126,54 126,44 L 125,24 C 124,14 113,8 100,8 Z" },

  // EARS — back view (anatomical L = viewer's L)
  { id: "ear-l-b", label: "Ear (L)", bodyPart: "Ear (L)", view: "back",
    d: "M 75,28 C 71,26 68,29 68,34 C 68,39 70,43 73,44 C 74,44.5 75,44 75,43 L 75,28 Z" },
  { id: "ear-r-b", label: "Ear (R)", bodyPart: "Ear (R)", view: "back",
    d: "M 125,28 C 129,26 132,29 132,34 C 132,39 130,43 127,44 C 126,44.5 125,44 125,43 L 125,28 Z" },

  // NECK
  { id: "neck-b", label: "Neck", bodyPart: "Neck", view: "back",
    d: "M 93,58 C 91,60 90,64 90,68 L 90,72 C 93,74 107,74 110,72 L 110,68 C 110,64 109,60 107,58 C 104,62 96,62 93,58 Z" },

  // BACK
  { id: "upper-back-b", label: "Upper Back", bodyPart: "Upper Back", view: "back",
    d: "M 70,80 C 62,78 58,82 57,88 L 64,128 L 136,128 L 143,88 C 142,82 138,78 130,80 C 124,74 114,72 110,72 L 90,72 C 86,72 76,74 70,80 Z" },
  { id: "lower-back-b", label: "Lower Back", bodyPart: "Lower Back", view: "back",
    d: "M 64,128 L 72,168 C 80,172 90,174 100,174 C 110,174 120,172 128,168 L 136,128 Z" },
  { id: "pelvis-b", label: "Pelvis", bodyPart: "Pelvis", view: "back",
    d: "M 72,168 C 70,174 72,180 76,186 C 82,192 90,196 100,197 C 110,196 118,192 124,186 C 128,180 130,174 128,168 C 120,172 110,174 100,174 C 90,174 80,172 72,168 Z" },

  // LEFT ARM (back: L = viewer's L)
  { id: "shoulder-l-b", label: "Shoulder (L)", bodyPart: "Shoulder (L)", view: "back",
    d: "M 70,80 C 64,76 56,76 52,82 L 50,92 C 54,86 60,84 64,84 L 64,128 L 57,88 C 58,82 62,78 70,80 Z" },
  { id: "upper-arm-l-b", label: "Upper Arm (L)", bodyPart: "Upper Arm (L)", view: "back",
    d: "M 64,84 C 60,84 54,86 50,92 L 48,132 C 52,128 56,126 60,126 L 64,128 Z" },
  { id: "elbow-l-b", label: "Elbow (L)", bodyPart: "Elbow (L)", view: "back",
    d: "M 60,126 C 56,126 52,128 48,132 L 47,146 C 51,142 55,140 59,140 Z" },
  { id: "forearm-l-b", label: "Forearm (L)", bodyPart: "Forearm (L)", view: "back",
    d: "M 59,140 C 55,140 51,142 47,146 L 44,186 C 48,184 52,183 56,183 Z" },
  { id: "wrist-l-b", label: "Wrist (L)", bodyPart: "Wrist (L)", view: "back",
    d: "M 56,183 C 52,183 48,184 44,186 L 43,196 C 47,194 51,193 55,193 Z" },
  { id: "hand-l-b", label: "Hand (L)", bodyPart: "Hand (L)", view: "back",
    d: "M 55,193 C 51,193 47,194 43,196 L 41,210 C 45,208 49,207 53,207 Z" },
  { id: "fingers-l-b", label: "Fingers (L)", bodyPart: "Fingers (L)", view: "back",
    d: "M 53,207 C 49,207 45,208 41,210 L 38,218 C 40,223 43,224 45,222 L 47,218 L 49,222 C 51,224 53,222 53,218 L 55,222 C 57,224 59,222 59,218 L 61,220 C 63,221 64,219 63,215 Z" },

  // RIGHT ARM (back: R = viewer's R)
  { id: "shoulder-r-b", label: "Shoulder (R)", bodyPart: "Shoulder (R)", view: "back",
    d: "M 130,80 C 136,76 144,76 148,82 L 150,92 C 146,86 140,84 136,84 L 136,128 L 143,88 C 142,82 138,78 130,80 Z" },
  { id: "upper-arm-r-b", label: "Upper Arm (R)", bodyPart: "Upper Arm (R)", view: "back",
    d: "M 136,84 C 140,84 146,86 150,92 L 152,132 C 148,128 144,126 140,126 L 136,128 Z" },
  { id: "elbow-r-b", label: "Elbow (R)", bodyPart: "Elbow (R)", view: "back",
    d: "M 140,126 C 144,126 148,128 152,132 L 153,146 C 149,142 145,140 141,140 Z" },
  { id: "forearm-r-b", label: "Forearm (R)", bodyPart: "Forearm (R)", view: "back",
    d: "M 141,140 C 145,140 149,142 153,146 L 156,186 C 152,184 148,183 144,183 Z" },
  { id: "wrist-r-b", label: "Wrist (R)", bodyPart: "Wrist (R)", view: "back",
    d: "M 144,183 C 148,183 152,184 156,186 L 157,196 C 153,194 149,193 145,193 Z" },
  { id: "hand-r-b", label: "Hand (R)", bodyPart: "Hand (R)", view: "back",
    d: "M 145,193 C 149,193 153,194 157,196 L 159,210 C 155,208 151,207 147,207 Z" },
  { id: "fingers-r-b", label: "Fingers (R)", bodyPart: "Fingers (R)", view: "back",
    d: "M 147,207 C 151,207 155,208 159,210 L 162,218 C 160,223 157,224 155,222 L 153,218 L 151,222 C 149,224 147,222 147,218 L 145,222 C 143,224 141,222 141,218 L 139,220 C 137,221 136,219 137,215 Z" },

  // LEFT LEG (back: L = viewer's L)
  { id: "hip-l-b", label: "Hip (L)", bodyPart: "Hip (L)", view: "back",
    d: "M 100,197 C 93,197 84,196 78,190 L 76,200 C 80,204 86,206 94,206 L 98,206 Z" },
  { id: "thigh-l-b", label: "Thigh (L)", bodyPart: "Thigh (L)", view: "back",
    d: "M 98,206 L 94,206 C 86,206 80,204 76,200 C 78,224 80,248 82,268 L 92,268 C 94,248 96,224 98,206 Z" },
  { id: "knee-l-b", label: "Knee (L)", bodyPart: "Knee (L)", view: "back",
    d: "M 92,268 L 82,268 C 81,276 81,284 82,290 L 92,290 C 93,284 93,276 92,268 Z" },
  { id: "lower-leg-l-b", label: "Lower Leg (L)", bodyPart: "Lower Leg (L)", view: "back",
    d: "M 92,290 L 82,290 C 83,314 84,342 85,364 L 93,364 C 93,342 92,314 92,290 Z" },
  { id: "ankle-l-b", label: "Ankle (L)", bodyPart: "Ankle (L)", view: "back",
    d: "M 93,364 L 85,364 C 84,374 84,378 85,382 L 93,382 C 94,378 94,374 93,364 Z" },
  { id: "foot-l-b", label: "Foot (L)", bodyPart: "Foot (L)", view: "back",
    d: "M 93,382 L 85,382 C 82,386 79,390 77,392 L 77,396 C 82,400 90,400 93,398 Z" },
  { id: "toes-l-b", label: "Toes (L)", bodyPart: "Toes (L)", view: "back",
    d: "M 77,392 C 74,392 71,392 69,394 C 68,396 69,399 71,400 L 75,398 L 77,396 Z" },

  // RIGHT LEG (back: R = viewer's R)
  { id: "hip-r-b", label: "Hip (R)", bodyPart: "Hip (R)", view: "back",
    d: "M 100,197 C 107,197 116,196 122,190 L 124,200 C 120,204 114,206 106,206 L 102,206 Z" },
  { id: "thigh-r-b", label: "Thigh (R)", bodyPart: "Thigh (R)", view: "back",
    d: "M 102,206 L 106,206 C 114,206 120,204 124,200 C 122,224 120,248 118,268 L 108,268 C 106,248 104,224 102,206 Z" },
  { id: "knee-r-b", label: "Knee (R)", bodyPart: "Knee (R)", view: "back",
    d: "M 108,268 L 118,268 C 119,276 119,284 118,290 L 108,290 C 107,284 107,276 108,268 Z" },
  { id: "lower-leg-r-b", label: "Lower Leg (R)", bodyPart: "Lower Leg (R)", view: "back",
    d: "M 108,290 L 118,290 C 117,314 116,342 115,364 L 107,364 C 107,342 107,314 108,290 Z" },
  { id: "ankle-r-b", label: "Ankle (R)", bodyPart: "Ankle (R)", view: "back",
    d: "M 107,364 L 115,364 C 116,374 116,378 115,382 L 107,382 C 106,378 106,374 107,364 Z" },
  { id: "foot-r-b", label: "Foot (R)", bodyPart: "Foot (R)", view: "back",
    d: "M 107,382 L 115,382 C 118,386 121,390 123,392 L 123,396 C 118,400 110,400 107,398 Z" },
  { id: "toes-r-b", label: "Toes (R)", bodyPart: "Toes (R)", view: "back",
    d: "M 123,392 C 126,392 129,392 131,394 C 132,396 131,399 129,400 L 125,398 L 123,396 Z" },
]

// ── Anatomical detail lines ─────────────────────────────────────────────────

const FRONT_DETAILS_MAJOR = `
  M 90,72 C 84,72 76,74 70,80
  M 110,72 C 116,72 124,74 130,80
  M 80,82 C 84,86 90,90 100,90 C 110,90 116,86 120,82
  M 86,90 C 88,94 92,96 100,96 C 108,96 112,94 114,90
  M 100,90 L 100,174
  M 88,102 C 90,106 96,108 100,106 C 104,108 110,106 112,102
  M 86,116 C 88,120 94,122 100,120 C 106,122 112,120 114,116
  M 88,130 C 90,134 96,136 100,134 C 104,136 110,134 112,130
  M 90,144 C 92,148 96,150 100,148 C 104,150 108,148 110,144
  M 92,158 C 94,160 97,162 100,160 C 103,162 106,160 108,158
  M 86,96 L 84,102 L 82,116 L 82,130
  M 114,96 L 116,102 L 118,116 L 118,130
  M 80,168 C 82,172 90,176 100,176 C 110,176 118,172 120,168
  M 62,82 C 60,86 59,96 60,108 C 60,118 62,124 64,128
  M 138,82 C 140,86 141,96 140,108 C 140,118 138,124 136,128
  M 96,214 C 94,218 92,240 90,268
  M 104,214 C 106,218 108,240 110,268
  M 86,278 C 86,282 88,286 90,288 C 92,290 94,290 96,288
  M 114,278 C 114,282 112,286 110,288 C 108,290 106,290 104,288
  M 88,296 C 88,314 88,330 88,350
  M 112,296 C 112,314 112,330 112,350
`

const FRONT_DETAILS_MINOR = `
  M 92,88 C 91,90 90,94 91,98
  M 108,88 C 109,90 110,94 109,98
  M 90,164 C 91,168 94,170 100,170 C 106,170 109,168 110,164
  M 56,150 C 54,160 52,172 52,184
  M 144,150 C 146,160 148,172 148,184
  M 92,268 C 91,272 90,276 90,278
  M 108,268 C 109,272 110,276 110,278
`

const BACK_DETAILS_MAJOR = `
  M 100,62 L 100,174
  M 80,80 C 84,76 92,74 100,74 C 108,74 116,76 120,80
  M 76,90 C 80,92 90,94 100,94 C 110,94 120,92 124,90
  M 84,80 C 82,84 80,92 80,100 C 80,110 82,120 84,128
  M 116,80 C 118,84 120,92 120,100 C 120,110 118,120 116,128
  M 88,80 C 86,84 82,94 82,108 C 82,120 84,126 86,128
  M 112,80 C 114,84 118,94 118,108 C 118,120 116,126 114,128
  M 90,130 C 88,136 86,144 86,152 C 86,160 88,166 90,170
  M 110,130 C 112,136 114,144 114,152 C 114,160 112,166 110,170
  M 82,170 C 84,174 90,178 100,180 C 110,178 116,174 118,170
  M 96,210 C 95,224 93,248 92,268
  M 104,210 C 105,224 107,248 108,268
  M 87,294 C 86,308 85,328 85,348
  M 113,294 C 114,308 115,328 115,348
  M 86,300 C 88,308 90,320 90,340
  M 114,300 C 112,308 110,320 110,340
`

const BACK_DETAILS_MINOR = `
  M 100,62 C 98,66 96,70 96,74
  M 100,62 C 102,66 104,70 104,74
  M 80,100 C 78,108 78,116 80,126
  M 120,100 C 122,108 122,116 120,126
  M 82,164 C 84,168 88,172 100,174 C 112,172 116,168 118,164
`

// ── Facial features sub-component ───────────────────────────────────────────

function FacialFeatures() {
  return (
    <g>
      {/* Eyebrows */}
      <path d="M 87,28 C 89,26 93,26 96,27" fill="none" stroke="#8B6340" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M 104,27 C 107,26 111,26 113,28" fill="none" stroke="#8B6340" strokeWidth="0.7" strokeLinecap="round" />

      {/* Right eye (viewer's right = anatomical L) */}
      <path d="M 87,31 C 89,28.5 93,28 96,29 C 98,29.5 99,31 98,32.5 C 96,34 93,34.5 90,33.5 C 88,33 87,32 87,31 Z"
        fill="white" stroke="#94a3b8" strokeWidth="0.4" />
      <circle cx="92.5" cy="31.5" r="1.8" fill="#4a3520" />
      <circle cx="92.5" cy="31.5" r="1.1" fill="#1a0a00" />
      <circle cx="93.2" cy="30.8" r="0.4" fill="white" />

      {/* Left eye (viewer's left = anatomical R) */}
      <path d="M 101,29 C 103,28 107,28 110,29 C 112,30 113,31 112,32.5 C 110,34.5 106,35 103,33.5 C 101,33 100,32 101,31 Z"
        fill="white" stroke="#94a3b8" strokeWidth="0.4" />
      <circle cx="106.5" cy="31.5" r="1.8" fill="#4a3520" />
      <circle cx="106.5" cy="31.5" r="1.1" fill="#1a0a00" />
      <circle cx="107.2" cy="30.8" r="0.4" fill="white" />

      {/* Nose */}
      <path d="M 100,35 L 100,41" fill="none" stroke="#b08060" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M 96,43.5 C 97,44.5 99,45 100,45 C 101,45 103,44.5 104,43.5"
        fill="none" stroke="#b08060" strokeWidth="0.4" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M 95,48.5 C 97,47 99,47.5 100,48 C 101,47.5 103,47 105,48.5"
        fill="none" stroke="#c07060" strokeWidth="0.55" strokeLinecap="round" />
      <path d="M 96,49.5 C 98,50.5 102,50.5 104,49.5"
        fill="#e0907a" fillOpacity="0.3" stroke="#c07060" strokeWidth="0.45" strokeLinecap="round" />

      {/* Jaw */}
      <path d="M 84,44 C 84,50 86,56 92,58" fill="none" stroke="#c4a88a" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M 116,44 C 116,50 114,56 108,58" fill="none" stroke="#c4a88a" strokeWidth="0.4" strokeLinecap="round" />
    </g>
  )
}

// ── Ear shapes ──────────────────────────────────────────────────────────────

function FrontEars() {
  return (
    <g>
      {/* Right ear (viewer's right = anatomical L) */}
      <path d="M 84,28 C 80,26 77,29 77,34 C 77,39 79,43 82,44 C 83,44.5 84,44 84,43"
        fill="#f5e6d8" stroke="#c4956a" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M 84,32 C 82,32 81,34 81,36 C 81,38 82,40 84,41"
        fill="none" stroke="#c4a88a" strokeWidth="0.4" strokeLinecap="round" />

      {/* Left ear (viewer's left = anatomical R) */}
      <path d="M 116,28 C 120,26 123,29 123,34 C 123,39 121,43 118,44 C 117,44.5 116,44 116,43"
        fill="#f5e6d8" stroke="#c4956a" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M 116,32 C 118,32 119,34 119,36 C 119,38 118,40 116,41"
        fill="none" stroke="#c4a88a" strokeWidth="0.4" strokeLinecap="round" />
    </g>
  )
}

function BackEars() {
  return (
    <g>
      {/* Left ear (viewer's left = anatomical L) */}
      <path d="M 75,28 C 71,26 68,29 68,34 C 68,39 70,43 73,44 C 74,44.5 75,44 75,43"
        fill="#f5e6d8" stroke="#c4956a" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M 75,32 C 73,32 72,34 72,36 C 72,38 73,40 75,41"
        fill="none" stroke="#c4a88a" strokeWidth="0.4" strokeLinecap="round" />

      {/* Right ear (viewer's right = anatomical R) */}
      <path d="M 125,28 C 129,26 132,29 132,34 C 132,39 130,43 127,44 C 126,44.5 125,44 125,43"
        fill="#f5e6d8" stroke="#c4956a" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M 125,32 C 127,32 128,34 128,36 C 128,38 127,40 125,41"
        fill="none" stroke="#c4a88a" strokeWidth="0.4" strokeLinecap="round" />
    </g>
  )
}

// ── Finger/toe detail lines ─────────────────────────────────────────────────

function FingerLines({ view }: { view: "front" | "back" }) {
  if (view === "front") {
    return (
      <g stroke="#c4a88a" strokeWidth="0.35" fill="none" strokeLinecap="round">
        {/* L hand fingers (viewer right) */}
        <line x1="156" y1="210" x2="160" y2="220" />
        <line x1="153" y1="210" x2="155" y2="222" />
        <line x1="150" y1="210" x2="150" y2="222" />
        <line x1="147" y1="210" x2="145" y2="220" />
        {/* R hand fingers (viewer left) */}
        <line x1="44" y1="210" x2="40" y2="220" />
        <line x1="47" y1="210" x2="45" y2="222" />
        <line x1="50" y1="210" x2="50" y2="222" />
        <line x1="53" y1="210" x2="55" y2="220" />
      </g>
    )
  }
  return (
    <g stroke="#c4a88a" strokeWidth="0.35" fill="none" strokeLinecap="round">
      {/* L hand back (viewer left) */}
      <line x1="44" y1="210" x2="40" y2="220" />
      <line x1="47" y1="210" x2="45" y2="222" />
      <line x1="50" y1="210" x2="50" y2="222" />
      <line x1="53" y1="210" x2="55" y2="220" />
      {/* R hand back (viewer right) */}
      <line x1="156" y1="210" x2="160" y2="220" />
      <line x1="153" y1="210" x2="155" y2="222" />
      <line x1="150" y1="210" x2="150" y2="222" />
      <line x1="147" y1="210" x2="145" y2="220" />
    </g>
  )
}

function ToeLines({ view }: { view: "front" | "back" }) {
  if (view === "front") {
    return (
      <g stroke="#c4a88a" strokeWidth="0.35" fill="none" strokeLinecap="round">
        <line x1="120" y1="386" x2="123" y2="392" />
        <line x1="123" y1="384" x2="126" y2="390" />
        <line x1="80" y1="386" x2="77" y2="392" />
        <line x1="77" y1="384" x2="74" y2="390" />
      </g>
    )
  }
  return (
    <g stroke="#c4a88a" strokeWidth="0.35" fill="none" strokeLinecap="round">
      <line x1="90" y1="370" x2="90" y2="382" />
      <line x1="110" y1="370" x2="110" y2="382" />
    </g>
  )
}

// ── Body outline ────────────────────────────────────────────────────────────

const BODY_OUTLINE = `
  M 100,8 C 86,8 76,14 74,26 L 74,36 C 74,52 86,62 100,62 C 114,62 126,52 126,36 L 126,26 C 124,14 114,8 100,8 Z
  M 90,62 C 88,64 88,68 90,72 C 86,72 76,74 70,80 C 62,78 56,76 52,82 C 48,88 48,100 48,132 L 47,146 L 44,186 L 43,196 L 41,210 L 38,218 C 36,224 40,226 45,222 L 47,218 L 49,222 L 51,218 L 53,222 L 55,218 L 57,220 C 60,222 63,220 63,215 L 59,207 L 57,196 L 56,183 L 59,140 L 60,126 L 64,84 C 60,84 54,86 50,92 L 48,132
  M 110,62 C 112,64 112,68 110,72 C 114,72 124,74 130,80 C 138,78 144,76 148,82 C 152,88 152,100 152,132 L 153,146 L 156,186 L 157,196 L 159,210 L 162,218 C 164,224 160,226 155,222 L 153,218 L 151,222 L 149,218 L 147,222 L 145,218 L 143,220 C 140,222 137,220 137,215 L 141,207 L 143,196 L 144,183 L 141,140 L 140,126 L 136,84 C 140,84 146,86 150,92 L 152,132
  M 72,168 C 70,174 72,182 78,190 L 76,200 C 80,204 88,208 98,208 L 98,206 C 96,224 94,248 92,268 C 81,268 81,276 82,290 L 92,290 C 92,314 92,342 93,364 L 85,364 C 84,374 84,378 85,382 L 78,390 C 76,392 73,388 73,394 C 73,398 78,400 85,400 L 93,398 C 94,392 94,382 93,382 L 93,364 L 85,364
  M 128,168 C 130,174 128,182 122,190 L 124,200 C 120,204 112,208 102,208 L 102,206 C 104,224 106,248 108,268 C 119,268 119,276 118,290 L 108,290 C 108,314 108,342 107,364 L 115,364 C 116,374 116,378 115,382 L 122,390 C 124,392 127,388 127,394 C 127,398 122,400 115,400 L 107,398 C 106,392 106,382 107,382 L 107,364 L 115,364
`

// ── Main component ──────────────────────────────────────────────────────────

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

      {/* Label */}
      <div className="h-5 text-xs font-medium text-center">
        {hoveredRegion ? (
          <span className="text-primary">{hoveredRegion}</span>
        ) : value ? (
          <span className="text-red-600">{value}</span>
        ) : !readOnly ? (
          <span className="text-muted-foreground">Click to select injured area</span>
        ) : null}
      </div>

      {/* SVG */}
      <svg
        viewBox="30 5 140 400"
        className="w-full max-w-[220px] h-auto"
        style={{ touchAction: "manipulation" }}
      >
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e8c9a8" />
            <stop offset="30%" stopColor="#f5e0c8" />
            <stop offset="50%" stopColor="#f8e8d4" />
            <stop offset="70%" stopColor="#f5e0c8" />
            <stop offset="100%" stopColor="#e8c9a8" />
          </linearGradient>
        </defs>

        {/* Body silhouette */}
        <path
          d={BODY_OUTLINE}
          fill="url(#skinGrad)"
          stroke="#c4956a"
          strokeWidth="0.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Major anatomical lines */}
        <path
          d={activeView === "front" ? FRONT_DETAILS_MAJOR : BACK_DETAILS_MAJOR}
          fill="none"
          stroke="#c4956a"
          strokeWidth="0.45"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Minor detail lines */}
        <path
          d={activeView === "front" ? FRONT_DETAILS_MINOR : BACK_DETAILS_MINOR}
          fill="none"
          stroke="#c4a88a"
          strokeWidth="0.3"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Ears */}
        {activeView === "front" ? <FrontEars /> : <BackEars />}

        {/* Face (front only) */}
        {activeView === "front" && <FacialFeatures />}

        {/* Finger/toe lines */}
        <FingerLines view={activeView} />
        <ToeLines view={activeView} />

        {/* Interactive regions */}
        {regions.map((region) => {
          const selected = isSelected(region)
          const hovered = hoveredRegion === region.label

          return (
            <path
              key={region.id}
              d={region.d}
              fill={
                selected
                  ? "rgba(220, 38, 38, 0.40)"
                  : hovered && !readOnly
                    ? "rgba(59, 130, 246, 0.18)"
                    : "transparent"
              }
              stroke={
                selected
                  ? "rgba(220, 38, 38, 0.75)"
                  : hovered && !readOnly
                    ? "rgba(59, 130, 246, 0.40)"
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
          letterSpacing="1"
        >
          {activeView === "front" ? "FRONT VIEW" : "BACK VIEW"}
        </text>
      </svg>
    </div>
  )
}
