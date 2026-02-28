"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// ── Shared palette ──────────────────────────
const COLORS = [
  "hsl(215, 70%, 45%)",  // blue
  "hsl(160, 60%, 40%)",  // teal
  "hsl(45, 85%, 50%)",   // amber
  "hsl(0, 65%, 50%)",    // red
  "hsl(270, 55%, 55%)",  // purple
  "hsl(190, 60%, 45%)",  // cyan
  "hsl(30, 80%, 50%)",   // orange
  "hsl(330, 55%, 50%)",  // pink
]

const STATUS_COLORS: Record<string, string> = {
  // CAPA
  OPEN: "hsl(215, 70%, 55%)",
  IN_PROGRESS: "hsl(45, 85%, 50%)",
  VERIFICATION: "hsl(270, 55%, 55%)",
  CLOSED: "hsl(145, 55%, 42%)",
  OVERDUE: "hsl(0, 65%, 50%)",
  // Document
  DRAFT: "hsl(220, 15%, 55%)",
  PENDING_REVIEW: "hsl(45, 85%, 50%)",
  APPROVED: "hsl(145, 55%, 42%)",
  EXPIRED: "hsl(0, 65%, 50%)",
  ARCHIVED: "hsl(220, 10%, 65%)",
  // Checklist
  NOT_STARTED: "hsl(220, 15%, 55%)",
  COMPLETED: "hsl(145, 55%, 42%)",
  // Priority
  LOW: "hsl(145, 55%, 42%)",
  MEDIUM: "hsl(45, 85%, 50%)",
  HIGH: "hsl(30, 80%, 50%)",
  CRITICAL: "hsl(0, 65%, 50%)",
  // Risk
  UNRATED: "hsl(220, 10%, 65%)",
  // Subcontractor tiers
  PLATINUM: "hsl(260, 50%, 55%)",
  GOLD: "hsl(45, 85%, 50%)",
  SILVER: "hsl(220, 10%, 65%)",
  BRONZE: "hsl(30, 70%, 50%)",
}

function getColor(key: string, index: number): string {
  return STATUS_COLORS[key] ?? COLORS[index % COLORS.length]
}

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Pie Chart Card ──────────────────────────

interface PieChartCardProps {
  title: string
  description?: string
  data: Array<{ name: string; value: number }>
  nameKey?: string
  valueKey?: string
}

export function PieChartCard({ title, description, data }: PieChartCardProps) {
  const formatted = data.map((d) => ({ ...d, name: formatLabel(d.name) }))
  const total = formatted.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
          Not enough data to display yet
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={formatted}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
              fontSize={11}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={getColor(entry.name, i)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Count"]} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ── Bar Chart Card ──────────────────────────

interface BarChartCardProps {
  title: string
  description?: string
  data: Array<Record<string, string | number>>
  xKey: string
  bars: Array<{ key: string; color: string; label: string }>
}

export function BarChartCard({ title, description, data, xKey, bars }: BarChartCardProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
          Not enough data to display yet
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 90%)" />
            <XAxis dataKey={xKey} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend fontSize={12} />
            {bars.map((bar) => (
              <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ── Line Chart Card ──────────────────────────

interface LineChartCardProps {
  title: string
  description?: string
  data: Array<Record<string, string | number | null>>
  xKey: string
  lines: Array<{ key: string; color: string; label: string }>
}

export function LineChartCard({ title, description, data, xKey, lines }: LineChartCardProps) {
  const hasData = data.some((d) => lines.some((l) => d[l.key] !== null && d[l.key] !== undefined))

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
          Not enough data to display yet
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 90%)" />
            <XAxis dataKey={xKey} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip />
            <Legend fontSize={12} />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ── Area Chart Card ──────────────────────────

interface AreaChartCardProps {
  title: string
  description?: string
  data: Array<Record<string, string | number>>
  xKey: string
  yKey: string
  color?: string
}

export function AreaChartCard({ title, description, data, xKey, yKey, color = "hsl(215, 70%, 45%)" }: AreaChartCardProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
          Not enough data to display yet
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 90%)" />
            <XAxis dataKey={xKey} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={color}
              fill={color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
