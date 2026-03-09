"use client"

import Link from "next/link"
import { format } from "date-fns"
import { ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"

interface PermitSummary {
  activeCount: number
  pendingCount: number
  expiringWithin24h: number
  recentPermits: {
    id: string
    title: string
    permitNumber: string | null
    permitType: string
    status: string
    validTo: Date
    location: string
  }[]
}

export function WorkPermitsWidget({ data }: { data: PermitSummary | null }) {
  if (!data) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          <ShieldCheck className="inline-block mr-2 h-4 w-4" />
          Work Permits
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/permits">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-3">
          <div className="text-2xl font-bold">{data.activeCount}</div>
          <span className="text-sm text-muted-foreground">active</span>
          {data.pendingCount > 0 && (
            <span className="text-sm text-yellow-600">{data.pendingCount} pending approval</span>
          )}
        </div>

        {data.expiringWithin24h > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-amber-50 text-amber-800 text-sm">
            <AlertTriangle className="h-4 w-4" />
            {data.expiringWithin24h} permit{data.expiringWithin24h !== 1 ? "s" : ""} expiring within 24h
          </div>
        )}

        {data.recentPermits.length > 0 ? (
          <div className="space-y-2">
            {data.recentPermits.map((p) => (
              <Link
                key={p.id}
                href={`/permits/${p.id}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.location} - expires {format(new Date(p.validTo), "MMM d")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <StatusBadge type="permitType" value={p.permitType} className="text-[10px]" />
                  <StatusBadge type="permit" value={p.status} className="text-[10px]" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active permits</p>
        )}
      </CardContent>
    </Card>
  )
}
