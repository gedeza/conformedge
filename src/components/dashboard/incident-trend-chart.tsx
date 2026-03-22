"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { IncidentTrendRow } from "@/app/(app)/(dashboard)/reports/actions"

const INCIDENT_TYPE_CHART_COLORS: Record<string, { color: string; label: string }> = {
  nearMiss:       { color: "hsl(200, 70%, 55%)",  label: "Near Miss" },
  firstAid:       { color: "hsl(45, 85%, 50%)",   label: "First Aid" },
  medical:        { color: "hsl(30, 80%, 50%)",   label: "Medical Treatment" },
  lostTime:       { color: "hsl(0, 65%, 50%)",    label: "Lost Time Injury" },
  fatality:       { color: "hsl(0, 70%, 30%)",    label: "Fatality" },
  environmental:  { color: "hsl(160, 60%, 40%)",  label: "Environmental" },
  propertyDamage: { color: "hsl(40, 75%, 50%)",   label: "Property Damage" },
}

interface IncidentTrendChartProps {
  data: IncidentTrendRow[]
}

export function IncidentTrendChart({ data }: IncidentTrendChartProps) {
  const hasData = data.some((d) => d.total > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Incident Trend</CardTitle>
          <CardDescription>Monthly incidents by type (last 12 months)</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
          No incident data to display yet
        </CardContent>
      </Card>
    )
  }

  const typeKeys = Object.keys(INCIDENT_TYPE_CHART_COLORS)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Incident Trend</CardTitle>
        <CardDescription>Monthly incidents by type (last 12 months)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 90%)" />
            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Legend fontSize={12} />
            {typeKeys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={INCIDENT_TYPE_CHART_COLORS[key].label}
                stroke={INCIDENT_TYPE_CHART_COLORS[key].color}
                fill={INCIDENT_TYPE_CHART_COLORS[key].color}
                fillOpacity={0.15}
                strokeWidth={2}
                stackId="1"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
