"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FishboneDiagramProps {
  rootCause: string
  category?: string
  whys?: Array<{ question: string; answer: string }>
  containmentAction?: string
}

const CATEGORIES = [
  { key: "human", label: "Human", color: "#3b82f6", lightBg: "#eff6ff" },
  { key: "machine", label: "Machine", color: "#f97316", lightBg: "#fff7ed" },
  { key: "material", label: "Material", color: "#22c55e", lightBg: "#f0fdf4" },
  { key: "method", label: "Method", color: "#a855f7", lightBg: "#faf5ff" },
  { key: "environment", label: "Environment", color: "#14b8a6", lightBg: "#f0fdfa" },
  { key: "measurement", label: "Measurement", color: "#f59e0b", lightBg: "#fffbeb" },
] as const

// Layout constants
const SVG_WIDTH = 900
const SVG_HEIGHT = 420
const SPINE_Y = SVG_HEIGHT / 2
const SPINE_LEFT = 80
const SPINE_RIGHT = SVG_WIDTH - 30
const HEAD_WIDTH = 160
const HEAD_X = SPINE_RIGHT - HEAD_WIDTH
const BONE_SPACING = (HEAD_X - SPINE_LEFT) / 3
const BONE_LENGTH = 120

export function FishboneDiagram({
  rootCause,
  category,
  whys,
  containmentAction,
}: FishboneDiagramProps) {
  const topCategories = CATEGORIES.slice(0, 3) // Human, Machine, Material
  const bottomCategories = CATEGORIES.slice(3)  // Method, Environment, Measurement

  const filledWhys = whys?.filter((w) => w.answer) ?? []

  function getBoneX(index: number) {
    return SPINE_LEFT + BONE_SPACING * (index + 0.5)
  }

  function renderBone(
    cat: (typeof CATEGORIES)[number],
    index: number,
    isTop: boolean,
  ) {
    const x = getBoneX(index)
    const endY = isTop ? SPINE_Y - BONE_LENGTH : SPINE_Y + BONE_LENGTH
    const isActive = category === cat.key
    const strokeWidth = isActive ? 3 : 1.5
    const opacity = category && !isActive ? 0.35 : 1

    // Sub-bones (small ribs along the main bone)
    const ribCount = 3
    const ribs = []
    for (let r = 1; r <= ribCount; r++) {
      const frac = r / (ribCount + 1)
      const ribX = x + (isTop ? -1 : -1) * 20 * frac
      const ribBaseX = x + (SPINE_LEFT - x) * 0.15 * frac
      const ribBaseY = SPINE_Y + (endY - SPINE_Y) * frac
      const ribEndX = ribBaseX - 30
      const ribEndY = ribBaseY + (isTop ? -12 : 12)
      ribs.push(
        <line
          key={`rib-${cat.key}-${r}`}
          x1={ribBaseX + (x - ribBaseX) * 0.1}
          y1={ribBaseY}
          x2={ribEndX}
          y2={ribEndY}
          stroke={cat.color}
          strokeWidth={isActive ? 2 : 1}
          opacity={opacity * 0.5}
        />,
      )
    }

    // If active and has whys, render them along the bone
    const whyLabels: React.ReactNode[] = []
    if (isActive && filledWhys.length > 0) {
      filledWhys.forEach((w, i) => {
        const frac = (i + 1) / (filledWhys.length + 1)
        const ly = SPINE_Y + (endY - SPINE_Y) * frac
        const lx = x + 8
        const maxChars = 28
        const text =
          w.answer.length > maxChars
            ? w.answer.slice(0, maxChars) + "..."
            : w.answer
        whyLabels.push(
          <g key={`why-${i}`}>
            <circle cx={x} cy={ly} r={3} fill={cat.color} />
            <text
              x={lx}
              y={ly + 4}
              fontSize={9}
              fill={cat.color}
              fontWeight={500}
            >
              Why {i + 1}: {text}
            </text>
          </g>,
        )
      })
    }

    return (
      <g key={cat.key} opacity={opacity}>
        {/* Main bone line */}
        <line
          x1={x}
          y1={SPINE_Y}
          x2={x}
          y2={endY}
          stroke={cat.color}
          strokeWidth={strokeWidth}
        />
        {/* Ribs */}
        {ribs}
        {/* Category label */}
        <rect
          x={x - 44}
          y={isTop ? endY - 28 : endY + 6}
          width={88}
          height={22}
          rx={4}
          fill={isActive ? cat.color : cat.lightBg}
          stroke={cat.color}
          strokeWidth={isActive ? 0 : 1}
        />
        <text
          x={x}
          y={isTop ? endY - 13 : endY + 21}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill={isActive ? "#fff" : cat.color}
        >
          {cat.label}
        </text>
        {/* Active indicator */}
        {isActive && (
          <circle
            cx={x}
            cy={SPINE_Y}
            r={5}
            fill={cat.color}
            stroke="#fff"
            strokeWidth={2}
          />
        )}
        {/* Why labels along the bone */}
        {whyLabels}
      </g>
    )
  }

  // Truncate root cause for the head box
  const headText =
    rootCause.length > 60 ? rootCause.slice(0, 57) + "..." : rootCause

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Fishbone Diagram
          <span className="text-xs font-normal text-muted-foreground">
            (Ishikawa / Cause &amp; Effect)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-auto min-w-[600px]"
            role="img"
            aria-label="Fishbone root cause analysis diagram"
          >
            {/* Spine (main horizontal arrow) */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
            </defs>
            <line
              x1={SPINE_LEFT}
              y1={SPINE_Y}
              x2={HEAD_X}
              y2={SPINE_Y}
              stroke="#64748b"
              strokeWidth={2.5}
              markerEnd="url(#arrowhead)"
            />

            {/* Top bones */}
            {topCategories.map((cat, i) => renderBone(cat, i, true))}

            {/* Bottom bones */}
            {bottomCategories.map((cat, i) => renderBone(cat, i, false))}

            {/* Fish head — root cause box */}
            <rect
              x={HEAD_X}
              y={SPINE_Y - 36}
              width={HEAD_WIDTH}
              height={72}
              rx={8}
              fill="#ef4444"
              opacity={0.9}
            />
            <text
              x={HEAD_X + HEAD_WIDTH / 2}
              y={SPINE_Y - 12}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill="#fff"
              opacity={0.85}
            >
              ROOT CAUSE
            </text>
            {/* Wrap root cause text into 2 lines max */}
            {headText.length <= 30 ? (
              <text
                x={HEAD_X + HEAD_WIDTH / 2}
                y={SPINE_Y + 8}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="#fff"
              >
                {headText}
              </text>
            ) : (
              <>
                <text
                  x={HEAD_X + HEAD_WIDTH / 2}
                  y={SPINE_Y + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill="#fff"
                >
                  {headText.slice(0, 30)}
                </text>
                <text
                  x={HEAD_X + HEAD_WIDTH / 2}
                  y={SPINE_Y + 18}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill="#fff"
                >
                  {headText.slice(30)}
                </text>
              </>
            )}

            {/* "Effect" label at the very right */}
            <text
              x={SPINE_RIGHT - 5}
              y={SPINE_Y + 52}
              textAnchor="end"
              fontSize={9}
              fill="#94a3b8"
              fontStyle="italic"
            >
              Effect
            </text>

            {/* "Causes" label at the left */}
            <text
              x={SPINE_LEFT}
              y={SPINE_Y + 52}
              textAnchor="start"
              fontSize={9}
              fill="#94a3b8"
              fontStyle="italic"
            >
              Causes
            </text>
          </svg>
        </div>

        {/* Containment action below the diagram */}
        {containmentAction && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
              Containment Action
            </p>
            <p className="text-sm">{containmentAction}</p>
          </div>
        )}

        {/* Full root cause text if truncated */}
        {rootCause.length > 60 && (
          <div className="mt-3 text-sm">
            <span className="text-muted-foreground text-xs font-medium">
              Full Root Cause:
            </span>
            <p className="mt-1">{rootCause}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
