"use client"

import { format } from "date-fns"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Measurement {
  id: string
  value: number
  notes: string | null
  measuredAt: Date
  recordedBy: { firstName: string; lastName: string }
}

interface MeasurementTrendChartProps {
  measurements: Measurement[]
  targetValue: number
  unit: string | null
}

export function MeasurementTrendChart({ measurements, targetValue, unit }: MeasurementTrendChartProps) {
  if (measurements.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader><CardTitle>Trend</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No measurements recorded yet. Add your first measurement to see the trend chart.
          </p>
        </CardContent>
      </Card>
    )
  }

  const data = [...measurements]
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
    .map((m) => ({
      date: format(new Date(m.measuredAt), "MMM d"),
      value: m.value,
      fullDate: format(new Date(m.measuredAt), "PPP"),
      notes: m.notes,
      recordedBy: `${m.recordedBy.firstName} ${m.recordedBy.lastName}`,
    }))

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader><CardTitle>Measurement Trend</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis
              label={unit ? { value: unit, angle: -90, position: "insideLeft", className: "text-xs fill-muted-foreground" } : undefined}
              className="text-xs"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const d = payload[0].payload
                return (
                  <div className="rounded-md border bg-popover p-2 text-sm shadow-md">
                    <p className="font-medium">{d.fullDate}</p>
                    <p className="text-muted-foreground">Value: <strong>{d.value}</strong>{unit ? ` ${unit}` : ""}</p>
                    {d.notes && <p className="text-xs text-muted-foreground mt-1">{d.notes}</p>}
                    <p className="text-xs text-muted-foreground">By: {d.recordedBy}</p>
                  </div>
                )
              }}
            />
            <ReferenceLine
              y={targetValue}
              stroke="hsl(var(--destructive))"
              strokeDasharray="5 5"
              label={{ value: `Target: ${targetValue}`, position: "right", className: "text-xs fill-destructive" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
