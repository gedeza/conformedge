"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { LtifrData } from "@/app/(app)/(dashboard)/reports/actions"

function getLtifrColor(value: number | null): string {
  if (value === null) return "text-muted-foreground"
  if (value >= 1) return "text-red-600"
  if (value >= 0.5) return "text-amber-600"
  return "text-green-600"
}

function getLtifrBg(value: number | null): string {
  if (value === null) return "bg-muted"
  if (value >= 1) return "bg-red-500/10"
  if (value >= 0.5) return "bg-amber-500/10"
  return "bg-green-500/10"
}

function getLtifrLabel(value: number | null): string {
  if (value === null) return "N/A"
  if (value >= 1) return "High"
  if (value >= 0.5) return "Moderate"
  return "Good"
}

interface LtifrChartProps {
  data: LtifrData
}

export function LtifrChart({ data }: LtifrChartProps) {
  const { monthly, rolling12MonthLtifr, monthlyHoursWorked } = data

  if (!monthlyHoursWorked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">LTIFR (Lost Time Injury Frequency Rate)</CardTitle>
          <CardDescription>Configure &ldquo;Monthly Hours Worked&rdquo; in Settings to enable LTIFR calculation</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
          Set monthly hours worked in Organization Settings to calculate LTIFR
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPI Card */}
      <Card className={`border-border/50 ${getLtifrBg(rolling12MonthLtifr)}`}>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rolling 12-Month LTIFR</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              (LTI count x 1,000,000) / hours worked
            </p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${getLtifrColor(rolling12MonthLtifr)}`}>
              {rolling12MonthLtifr !== null ? rolling12MonthLtifr.toFixed(2) : "—"}
            </p>
            <p className={`text-xs font-medium ${getLtifrColor(rolling12MonthLtifr)}`}>
              {getLtifrLabel(rolling12MonthLtifr)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LTIFR Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">LTIFR Trend</CardTitle>
          <CardDescription>
            Monthly Lost Time Injury Frequency Rate (per 1,000,000 hours worked)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 90%)" />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => [typeof value === "number" ? value.toFixed(2) : "—", "LTIFR"]}
              />
              {/* Reference lines for thresholds */}
              <ReferenceLine y={1} stroke="hsl(0, 65%, 50%)" strokeDasharray="3 3" label={{ value: "High (1.0)", fontSize: 10, fill: "hsl(0, 65%, 50%)" }} />
              <ReferenceLine y={0.5} stroke="hsl(45, 85%, 50%)" strokeDasharray="3 3" label={{ value: "Moderate (0.5)", fontSize: 10, fill: "hsl(45, 85%, 50%)" }} />
              <Line
                type="monotone"
                dataKey="ltifr"
                name="LTIFR"
                stroke="hsl(215, 70%, 45%)"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(215, 70%, 45%)" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
