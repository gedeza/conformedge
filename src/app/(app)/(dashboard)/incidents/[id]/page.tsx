import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getAuthContext } from "@/lib/auth"
import { getIncident, getCapaOptions } from "../actions"
import { IncidentActionsPanel } from "./incident-actions-panel"
import type { RootCauseData } from "@/types"

const CATEGORY_LABELS: Record<string, string> = {
  human: "Human",
  machine: "Machine",
  material: "Material",
  method: "Method",
  environment: "Environment",
  measurement: "Measurement",
}

function RootCauseDisplay({
  rootCause,
  rootCauseData,
}: {
  rootCause: string | null
  rootCauseData: unknown
}) {
  let data: RootCauseData | null = null
  if (rootCauseData && typeof rootCauseData === "object") {
    const candidate = rootCauseData as RootCauseData
    if (candidate.method === "5-whys" || candidate.method === "simple") {
      data = candidate
    }
  }

  if (data?.method === "5-whys") {
    const filledWhys = data.whys.filter((w) => w.answer)
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Root Cause Analysis</span>
          <Badge variant="secondary" className="text-[10px]">5-Whys</Badge>
          {data.category && (
            <Badge variant="outline" className="text-[10px]">
              {CATEGORY_LABELS[data.category] ?? data.category}
            </Badge>
          )}
        </div>

        {filledWhys.length > 0 && (
          <div className="relative ml-2 pl-4 border-l-2 border-muted space-y-3">
            {filledWhys.map((w, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[calc(1rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                <p className="text-xs font-semibold text-muted-foreground">Why {i + 1}</p>
                <p className="text-sm">{w.answer}</p>
              </div>
            ))}
            <div className="relative">
              <div className="absolute -left-[calc(1rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-destructive" />
              <p className="text-xs font-semibold text-destructive">Root Cause</p>
              <p className="text-sm font-medium">{data.rootCause}</p>
            </div>
          </div>
        )}

        {filledWhys.length === 0 && data.rootCause && (
          <p className="text-sm">{data.rootCause}</p>
        )}

        {data.containmentAction && (
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Containment Action</span>
            </div>
            <p className="text-sm">{data.containmentAction}</p>
          </div>
        )}
      </div>
    )
  }

  if (!rootCause) return null
  return (
    <div>
      <span className="text-sm text-muted-foreground">Root Cause</span>
      <p className="mt-1 text-sm">{rootCause}</p>
    </div>
  )
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let incident: Awaited<ReturnType<typeof getIncident>>
  let capaOptions: Awaited<ReturnType<typeof getCapaOptions>> = []
  let role = "VIEWER"

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    ;[incident, capaOptions] = await Promise.all([
      getIncident(id),
      getCapaOptions(),
    ])

    if (!incident) notFound()
  } catch {
    notFound()
  }

  if (!incident) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/incidents"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      </div>

      <PageHeader heading={incident.title} description={incident.description ?? undefined}>
        <div className="flex items-center gap-2">
          <StatusBadge type="incident" value={incident.status} />
          <StatusBadge type="incidentType" value={incident.incidentType} />
          <StatusBadge type="risk" value={incident.severity} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader><CardTitle>Incident Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <div className="mt-1"><StatusBadge type="incidentType" value={incident.incidentType} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Severity</span>
                  <div className="mt-1"><StatusBadge type="risk" value={incident.severity} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Date of Incident</span>
                  <p className="mt-1 font-medium">{format(incident.incidentDate, "PPP")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1"><StatusBadge type="incident" value={incident.status} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Location</span>
                  <p className="mt-1 font-medium">{incident.location || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Injured Party</span>
                  <p className="mt-1 font-medium">{incident.injuredParty || "None"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reported By</span>
                  <p className="mt-1 font-medium">
                    {incident.reportedBy ? `${incident.reportedBy.firstName} ${incident.reportedBy.lastName}` : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Investigator</span>
                  <p className="mt-1 font-medium">
                    {incident.investigator ? `${incident.investigator.firstName} ${incident.investigator.lastName}` : "Unassigned"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Investigation Due</span>
                  <p className="mt-1 font-medium">
                    {incident.investigationDue ? format(incident.investigationDue, "PPP") : "Not set"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Project</span>
                  <p className="mt-1 font-medium">
                    {incident.project ? (
                      <Link href={`/projects/${incident.project.id}`} className="hover:underline">{incident.project.name}</Link>
                    ) : "None"}
                  </p>
                </div>
                {incident.closedDate && (
                  <div>
                    <span className="text-muted-foreground">Closed Date</span>
                    <p className="mt-1 font-medium">{format(incident.closedDate, "PPP")}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Reported</span>
                  <p className="mt-1 font-medium">{format(incident.createdAt, "PPP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Witnesses */}
          {incident.witnesses && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Witnesses</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{incident.witnesses}</p>
              </CardContent>
            </Card>
          )}

          {/* Immediate Action */}
          {incident.immediateAction && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Immediate Action Taken</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{incident.immediateAction}</p>
              </CardContent>
            </Card>
          )}

          {/* Root Cause */}
          {(incident.rootCause || incident.rootCauseData) && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Root Cause Analysis</CardTitle></CardHeader>
              <CardContent>
                <RootCauseDisplay
                  rootCause={incident.rootCause}
                  rootCauseData={incident.rootCauseData}
                />
              </CardContent>
            </Card>
          )}

          {/* Linked CAPA (read-only display) */}
          {incident.capa && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Linked CAPA</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/capas/${incident.capa.id}`} className="text-sm font-medium hover:underline">
                      {incident.capa.title}
                    </Link>
                    <div className="mt-1">
                      <StatusBadge type="capa" value={incident.capa.status} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — workflow actions */}
        <div>
          <IncidentActionsPanel
            incidentId={incident.id}
            currentStatus={incident.status}
            linkedCapa={incident.capa}
            capaOptions={capaOptions}
            role={role}
          />
        </div>
      </div>
    </div>
  )
}
