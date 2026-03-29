"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SiteMetrics } from "./actions"

const COLORS = [
  "hsl(215, 70%, 45%)",
  "hsl(160, 60%, 40%)",
  "hsl(45, 85%, 50%)",
  "hsl(0, 65%, 50%)",
  "hsl(270, 55%, 55%)",
  "hsl(190, 60%, 45%)",
  "hsl(30, 80%, 50%)",
  "hsl(330, 55%, 50%)",
]

const INCIDENT_TYPES = [
  { key: "NEAR_MISS", label: "Near Miss", color: "hsl(215, 70%, 55%)" },
  { key: "FIRST_AID", label: "First Aid", color: "hsl(160, 60%, 45%)" },
  { key: "MEDICAL", label: "Medical", color: "hsl(45, 85%, 50%)" },
  { key: "LOST_TIME", label: "Lost Time", color: "hsl(30, 80%, 50%)" },
  { key: "FATALITY", label: "Fatality", color: "hsl(0, 65%, 50%)" },
  { key: "ENVIRONMENTAL", label: "Environmental", color: "hsl(270, 55%, 55%)" },
  { key: "PROPERTY_DAMAGE", label: "Property Damage", color: "hsl(190, 60%, 45%)" },
]

interface CorporateChartsProps {
  sites: SiteMetrics[]
}

export function CorporateCharts({ sites }: CorporateChartsProps) {
  const filteredSites = sites.filter((s) => s.siteId !== null) // exclude Unassigned from charts

  // ── LTIFR by Site ──
  const ltifrData = filteredSites
    .filter((s) => s.ltifr !== null)
    .map((s) => ({ name: s.siteCode, ltifr: Number(s.ltifr!.toFixed(2)), siteName: s.siteName }))

  // ── Incidents by Site (stacked bar) ──
  const incidentData = filteredSites.map((s) => ({
    name: s.siteCode,
    siteName: s.siteName,
    ...Object.fromEntries(INCIDENT_TYPES.map(({ key }) => [key, s.incidentsByType[key] ?? 0])),
  }))

  // ── Compliance by Site ──
  const complianceData = filteredSites.map((s) => ({
    name: s.siteCode,
    siteName: s.siteName,
    compliance: Number(s.checklistCompliance.toFixed(1)),
  }))

  // ── Obligations by Site ──
  const obligationData = filteredSites.map((s) => ({
    name: s.siteCode,
    siteName: s.siteName,
    active: s.activeObligations,
    expiring: s.expiringObligations,
    expired: s.expiredObligations,
  }))

  if (filteredSites.length === 0) return null

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* LTIFR by Site */}
      {ltifrData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">LTIFR by Site</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ltifrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip
                  formatter={(value) => [Number(value).toFixed(2), "LTIFR"]}
                  labelFormatter={(label) => ltifrData.find((d) => d.name === label)?.siteName ?? label}
                />
                <ReferenceLine y={1.0} stroke="hsl(0, 65%, 50%)" strokeDasharray="5 5" label={{ value: "Threshold", position: "right", fontSize: 10 }} />
                <Bar dataKey="ltifr" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Incidents by Site */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm">Incidents by Site</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incidentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip labelFormatter={(label) => incidentData.find((d) => d.name === label)?.siteName ?? label} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {INCIDENT_TYPES.map(({ key, label, color }) => (
                <Bar key={key} dataKey={key} name={label} stackId="incidents" fill={color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Compliance by Site */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm">Checklist Compliance by Site</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value) => [`${Number(value)}%`, "Compliance"]}
                labelFormatter={(label) => complianceData.find((d) => d.name === label)?.siteName ?? label}
              />
              <Bar dataKey="compliance" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Obligations by Site */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm">Obligations by Site</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={obligationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip labelFormatter={(label) => obligationData.find((d) => d.name === label)?.siteName ?? label} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="active" name="Active" fill="hsl(145, 55%, 42%)" stackId="obl" />
              <Bar dataKey="expiring" name="Expiring" fill="hsl(45, 85%, 50%)" stackId="obl" />
              <Bar dataKey="expired" name="Expired" fill="hsl(0, 65%, 50%)" stackId="obl" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
