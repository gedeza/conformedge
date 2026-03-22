"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, AlertTriangle, CalendarCheck, Settings } from "lucide-react"

interface EquipmentWidgetProps {
  data: {
    totalActive: number
    underRepair: number
    quarantined: number
    overdueCalibrations: number
    upcomingMaintenance: number
  } | null
}

export function EquipmentWidget({ data }: EquipmentWidgetProps) {
  if (!data) return null

  const hasIssues = data.overdueCalibrations > 0 || data.quarantined > 0

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Equipment</CardTitle>
        <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500/10">
          <Wrench className="size-4 text-cyan-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold">{data.totalActive} <span className="text-sm font-normal text-muted-foreground">active</span></div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CalendarCheck className={`h-4 w-4 ${data.overdueCalibrations > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            <span className={data.overdueCalibrations > 0 ? "text-red-600 font-medium" : ""}>
              {data.overdueCalibrations} overdue cal.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>{data.upcomingMaintenance} upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className={`h-4 w-4 ${data.underRepair > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            <span>{data.underRepair} under repair</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${data.quarantined > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            <span className={data.quarantined > 0 ? "text-red-600 font-medium" : ""}>
              {data.quarantined} quarantined
            </span>
          </div>
        </div>
        <Link href="/equipment" className="text-xs text-primary hover:underline">
          View all equipment →
        </Link>
      </CardContent>
    </Card>
  )
}
