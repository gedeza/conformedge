"use client"

import { useState } from "react"
import { ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SiteMetrics } from "./actions"

const SITE_TYPE_LABELS: Record<string, string> = {
  HEADQUARTERS: "HQ",
  DIVISION: "Division",
  REGIONAL_OFFICE: "Regional",
  SITE: "Site",
  PLANT: "Plant",
  DEPOT: "Depot",
  WAREHOUSE: "Warehouse",
}

type SortKey = "siteName" | "incidents" | "ltiCount" | "ltifr" | "openCapas" | "activePermits" | "equipmentCount" | "checklistCompliance" | "activeObligations"

interface SiteComparisonTableProps {
  sites: SiteMetrics[]
}

export function SiteComparisonTable({ sites }: SiteComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("siteName")
  const [sortAsc, setSortAsc] = useState(true)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === "siteName")
    }
  }

  const sorted = [...sites].sort((a, b) => {
    const va = a[sortKey] ?? 0
    const vb = b[sortKey] ?? 0
    if (typeof va === "string" && typeof vb === "string") {
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
    }
    return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number)
  })

  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    return (
      <Button variant="ghost" size="sm" className="h-7 px-1 text-xs font-medium" onClick={() => toggleSort(field)}>
        {label}
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    )
  }

  function cellColor(value: number, thresholds: { good: number; warn: number; direction: "higher" | "lower" }) {
    const { good, warn, direction } = thresholds
    if (direction === "higher") {
      if (value >= good) return "text-green-700"
      if (value >= warn) return "text-yellow-700"
      return "text-red-700"
    }
    // lower is better (e.g., incidents, LTIFR)
    if (value <= good) return "text-green-700"
    if (value <= warn) return "text-yellow-700"
    return "text-red-700"
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-sm">Site Comparison</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4"><SortHeader label="Site" field="siteName" /></th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-right py-2 px-2"><SortHeader label="Incidents" field="incidents" /></th>
              <th className="text-right py-2 px-2"><SortHeader label="LTI" field="ltiCount" /></th>
              <th className="text-right py-2 px-2"><SortHeader label="LTIFR" field="ltifr" /></th>
              <th className="text-right py-2 px-2"><SortHeader label="Open CAPAs" field="openCapas" /></th>
              <th className="text-right py-2 px-2"><SortHeader label="Permits" field="activePermits" /></th>
              <th className="text-right py-2 px-2"><SortHeader label="Equipment" field="equipmentCount" /></th>
              <th className="text-right py-2 px-2"><SortHeader label="Compliance" field="checklistCompliance" /></th>
              <th className="text-right py-2 px-2"><SortHeader label="Obligations" field="activeObligations" /></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((site) => (
              <tr key={site.siteId ?? "unassigned"} className="border-b hover:bg-muted/50">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{site.siteName}</span>
                    <span className="text-xs text-muted-foreground">{site.siteCode}</span>
                  </div>
                </td>
                <td className="py-2 px-2">
                  <Badge variant="outline" className="text-xs">{SITE_TYPE_LABELS[site.siteType] ?? site.siteType}</Badge>
                </td>
                <td className={`py-2 px-2 text-right font-medium ${cellColor(site.incidents, { good: 0, warn: 5, direction: "lower" })}`}>
                  {site.incidents}
                </td>
                <td className={`py-2 px-2 text-right font-medium ${cellColor(site.ltiCount, { good: 0, warn: 1, direction: "lower" })}`}>
                  {site.ltiCount}
                </td>
                <td className={`py-2 px-2 text-right font-medium ${site.ltifr !== null ? cellColor(site.ltifr, { good: 0.5, warn: 1.0, direction: "lower" }) : "text-muted-foreground"}`}>
                  {site.ltifr !== null ? site.ltifr.toFixed(2) : "—"}
                </td>
                <td className={`py-2 px-2 text-right font-medium ${cellColor(site.openCapas, { good: 0, warn: 3, direction: "lower" })}`}>
                  {site.openCapas}
                  {site.overdueCapas > 0 && (
                    <span className="text-red-600 text-xs ml-1">({site.overdueCapas} overdue)</span>
                  )}
                </td>
                <td className="py-2 px-2 text-right">{site.activePermits}</td>
                <td className="py-2 px-2 text-right">{site.equipmentCount}</td>
                <td className={`py-2 px-2 text-right font-medium ${cellColor(site.checklistCompliance, { good: 80, warn: 50, direction: "higher" })}`}>
                  {site.checklistCompliance > 0 ? `${site.checklistCompliance.toFixed(0)}%` : "—"}
                </td>
                <td className="py-2 px-2 text-right">
                  {site.activeObligations}
                  {site.expiringObligations > 0 && (
                    <span className="text-yellow-600 text-xs ml-1">({site.expiringObligations} expiring)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
