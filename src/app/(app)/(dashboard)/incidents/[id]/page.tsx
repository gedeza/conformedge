import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Shield, AlertTriangle, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getAuthContext } from "@/lib/auth"
import { TREATMENT_TYPES, MHSA_SECTIONS } from "@/lib/constants"
import { BodyMapDual } from "@/components/shared/body-map-dual"
import { getIncident, getCapaOptions } from "../actions"
import { IncidentActionsPanel } from "./incident-actions-panel"
import { StatutoryFormButton } from "./statutory-form-button"
import { EvidenceGallery } from "./evidence-gallery"
import { WitnessList } from "./witness-list"
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
          <StatutoryFormButton incidentId={incident.id} incidentType={incident.incidentType} />
          <StatusBadge type="incident" value={incident.status} />
          <StatusBadge type="incidentType" value={incident.incidentType} />
          <StatusBadge type="risk" value={incident.severity} />
        </div>
      </PageHeader>

      {/* Reporting deadline / MHSA banner */}
      {incident.isReportable && incident.reportingDeadline && new Date(incident.reportingDeadline) > new Date() && (
        <div className="rounded-md border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-orange-700 dark:text-orange-300">Reportable Incident</span>
            {" — "}
            Statutory reporting deadline: <span className="font-medium">{format(incident.reportingDeadline, "PPP")}</span>
            {incident.mhsaSection && (
              <span className="ml-1">
                ({MHSA_SECTIONS[incident.mhsaSection as keyof typeof MHSA_SECTIONS]?.label ?? `Section ${incident.mhsaSection}`})
              </span>
            )}
          </div>
        </div>
      )}

      {incident.isReportable && incident.reportingDeadline && new Date(incident.reportingDeadline) <= new Date() && !incident.statutoryReportedAt && (
        <div className="rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            OVERDUE: Statutory reporting deadline was {format(incident.reportingDeadline, "PPP")}. Report immediately.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader><CardTitle>Incident Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
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
                  <p className="mt-1 font-medium">
                    {format(incident.incidentDate, "PPP")}
                    {incident.incidentTime && (
                      <span className="ml-1 text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-0.5" />{incident.incidentTime}
                      </span>
                    )}
                  </p>
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

          {/* Personnel Involved */}
          {(incident.victimOccupation || incident.victimStaffNo || incident.victimDepartment || incident.victimIdNumber || incident.victimNationality || incident.victimContractor || incident.immediateSupervisor) && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Particular of Personnel Involved</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  {incident.victimOccupation && (
                    <div>
                      <span className="text-muted-foreground">Occupation</span>
                      <p className="mt-1 font-medium">{incident.victimOccupation}</p>
                    </div>
                  )}
                  {incident.victimStaffNo && (
                    <div>
                      <span className="text-muted-foreground">Staff / Employee No</span>
                      <p className="mt-1 font-medium">{incident.victimStaffNo}</p>
                    </div>
                  )}
                  {incident.victimDepartment && (
                    <div>
                      <span className="text-muted-foreground">Department</span>
                      <p className="mt-1 font-medium">{incident.victimDepartment}</p>
                    </div>
                  )}
                  {incident.victimIdNumber && (
                    <div>
                      <span className="text-muted-foreground">ID / Passport No</span>
                      <p className="mt-1 font-medium">{incident.victimIdNumber}</p>
                    </div>
                  )}
                  {incident.victimNationality && (
                    <div>
                      <span className="text-muted-foreground">Nationality</span>
                      <p className="mt-1 font-medium">{incident.victimNationality}</p>
                    </div>
                  )}
                  {incident.victimContractor && (
                    <div>
                      <span className="text-muted-foreground">Contractor</span>
                      <p className="mt-1 font-medium">{incident.victimContractor}</p>
                    </div>
                  )}
                  {incident.immediateSupervisor && (
                    <div>
                      <span className="text-muted-foreground">Immediate Supervisor</span>
                      <p className="mt-1 font-medium">{incident.immediateSupervisor}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consequence & Impact */}
          {(incident.estimatedCost != null || incident.spillVolume != null || incident.nonInjuriousType || (incident.impactAreas && Array.isArray(incident.impactAreas) && (incident.impactAreas as string[]).length > 0)) && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Consequence &amp; Impact</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  {incident.estimatedCost != null && (
                    <div>
                      <span className="text-muted-foreground">Actual Cost</span>
                      <p className="mt-1 font-medium">R {Number(incident.estimatedCost).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                  {incident.spillVolume != null && (
                    <div>
                      <span className="text-muted-foreground">Spill Volume</span>
                      <p className="mt-1 font-medium">{Number(incident.spillVolume)} m&sup3;</p>
                    </div>
                  )}
                  {incident.nonInjuriousType && (
                    <div>
                      <span className="text-muted-foreground">Non-Injurious Type</span>
                      <p className="mt-1 font-medium">{incident.nonInjuriousType}</p>
                    </div>
                  )}
                  {incident.impactAreas && Array.isArray(incident.impactAreas) && (incident.impactAreas as string[]).length > 0 && (
                    <div className="sm:col-span-3">
                      <span className="text-muted-foreground">Impact Areas</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(incident.impactAreas as string[]).map((area: string) => (
                          <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Outcome of Injured Person */}
          {incident.returnedToWork != null && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Outcome of Injured Person</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Returned to Work</span>
                    <p className="mt-1 font-medium">
                      {incident.returnedToWork ? "Yes" : "No — not yet returned"}
                    </p>
                  </div>
                  {incident.returnedToWork && incident.returnedToWorkDate && (
                    <div>
                      <span className="text-muted-foreground">Date Returned</span>
                      <p className="mt-1 font-medium">{format(incident.returnedToWorkDate, "PPP")}</p>
                    </div>
                  )}
                  {!incident.returnedToWork && (
                    <div className="flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 p-2 text-xs text-amber-800 dark:text-amber-200">
                      Inform Safety &amp; Health Officer
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Injury Details */}
          {(incident.bodyPartInjured || incident.natureOfInjury || incident.treatmentType || incident.lostDays != null) && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Injury Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
                  {/* Body Map — dual read-only visual */}
                  {incident.bodyPartInjured && (
                    <div className="flex justify-center">
                      <BodyMapDual
                        value={incident.bodyPartInjured}
                        readOnly
                      />
                    </div>
                  )}

                  {/* Text details */}
                  <div className="grid grid-cols-1 gap-4 text-sm content-start">
                    {incident.natureOfInjury && (
                      <div>
                        <span className="text-muted-foreground">Nature of Injury</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {incident.natureOfInjury.split(",").map((injury: string) => injury.trim()).filter(Boolean).map((injury: string) => (
                            <Badge key={injury} variant="outline" className="bg-orange-50 text-orange-800 border-orange-200 text-xs">
                              {injury}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {incident.treatmentType && (
                      <div>
                        <span className="text-muted-foreground">Treatment Obtained</span>
                        <p className="mt-1 font-medium">
                          {TREATMENT_TYPES[incident.treatmentType as keyof typeof TREATMENT_TYPES]?.label ?? incident.treatmentType}
                        </p>
                      </div>
                    )}
                    {incident.lostDays != null && (
                      <div>
                        <span className="text-muted-foreground">Work Days Lost</span>
                        <p className="mt-1 font-medium">{incident.lostDays} {incident.lostDays === 1 ? "day" : "days"}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contributing Factors */}
          {incident.contributingFactors && Array.isArray(incident.contributingFactors) && (incident.contributingFactors as string[]).length > 0 && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Contributing Factors</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(incident.contributingFactors as string[]).map((factor) => (
                    <Badge key={factor} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regulatory Reporting */}
          {(incident.isReportable || incident.mhsaSection || incident.statutoryRefNumber) && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Regulatory Reporting</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Reportable</span>
                    <p className="mt-1 font-medium">{incident.isReportable ? "Yes" : "No"}</p>
                  </div>
                  {incident.mhsaSection && (
                    <div>
                      <span className="text-muted-foreground">MHSA Section</span>
                      <p className="mt-1 font-medium">
                        {MHSA_SECTIONS[incident.mhsaSection as keyof typeof MHSA_SECTIONS]?.label ?? `Section ${incident.mhsaSection}`}
                      </p>
                    </div>
                  )}
                  {incident.reportingDeadline && (
                    <div>
                      <span className="text-muted-foreground">Reporting Deadline</span>
                      <p className="mt-1 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(incident.reportingDeadline, "PPP")}
                      </p>
                    </div>
                  )}
                  {incident.statutoryReportedAt && (
                    <div>
                      <span className="text-muted-foreground">Reported to Regulator</span>
                      <p className="mt-1 font-medium">{format(incident.statutoryReportedAt, "PPP")}</p>
                    </div>
                  )}
                  {incident.statutoryRefNumber && (
                    <div>
                      <span className="text-muted-foreground">Reference Number</span>
                      <p className="mt-1 font-medium">{incident.statutoryRefNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Gallery */}
          <EvidenceGallery
            incidentId={incident.id}
            evidence={(incident as Record<string, unknown>).evidence as [] ?? []}
            role={role}
          />

          {/* Witness Statements */}
          <WitnessList
            incidentId={incident.id}
            witnesses={(incident as Record<string, unknown>).witnessRecords as [] ?? []}
            legacyWitnesses={incident.witnesses}
            role={role}
          />

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
