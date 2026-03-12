import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FileText,
  AlertTriangle,
  Siren,
  Users,
  ClipboardCheck,
  Target,
  ShieldCheck,
  Building2,
  ArrowLeft,
  ScrollText,
} from "lucide-react"
import { getPartnerContext } from "@/lib/partner-auth"
import { getClientOrgDetail } from "../../actions"
import {
  PARTNER_CLIENT_SIZES,
  DOCUMENT_STATUSES,
  CAPA_STATUSES,
  CAPA_PRIORITIES,
  INCIDENT_STATUSES,
  INCIDENT_TYPES,
} from "@/lib/constants"
import { DisconnectClientButton } from "./disconnect-client-button"

interface Props {
  params: Promise<{ orgId: string }>
}

export default async function ClientOrgDetailPage({ params }: Props) {
  const { orgId } = await params
  const ctx = await getPartnerContext()
  if (!ctx) redirect("/dashboard")

  const data = await getClientOrgDetail(orgId)
  if (!data) notFound()

  const { organization: org, partnerLink, recentDocs, openCapas, openIncidents, recentAudit } = data
  const sizeConfig = PARTNER_CLIENT_SIZES[partnerLink.clientSize as keyof typeof PARTNER_CLIENT_SIZES]
  const feeCents = partnerLink.customFeeCents ?? sizeConfig?.defaultFeeCents ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/partner/clients" className="hover:text-foreground">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          Client Organizations
        </Link>
      </div>

      <PageHeader
        heading={org.name}
        description={`${org.industry ?? "No industry"} — ${sizeConfig?.label ?? partnerLink.clientSize} client`}
      >
        {ctx.partnerRole === "PARTNER_ADMIN" && (
          <DisconnectClientButton organizationId={orgId} orgName={org.name} />
        )}
      </PageHeader>

      {/* Partner Relationship Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Building2 className="h-4 w-4" />
            <span>Managed by <strong>{ctx.partnerName}</strong></span>
            <Badge variant="outline" className="border-blue-300">
              {sizeConfig?.label}
            </Badge>
          </div>
          <div className="text-sm font-medium text-blue-800">
            R{(feeCents / 100).toLocaleString("en-ZA")}/mo
            {partnerLink.customFeeCents ? " (custom)" : ""}
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label="Team Members" value={org.members.length} />
        <MetricCard icon={FileText} label="Documents" value={org._count.documents} />
        <MetricCard icon={ClipboardCheck} label="Assessments" value={org._count.assessments} />
        <MetricCard icon={AlertTriangle} label="CAPAs" value={org._count.capas} />
        <MetricCard icon={Siren} label="Incidents" value={org._count.incidents} />
        <MetricCard icon={Target} label="Objectives" value={org._count.objectives} />
        <MetricCard icon={ShieldCheck} label="Work Permits" value={org._count.workPermits} />
        <MetricCard icon={Building2} label="Subcontractors" value={org._count.subcontractors} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {org.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {m.user.imageUrl && <AvatarImage src={m.user.imageUrl} />}
                    <AvatarFallback className="text-xs">
                      {m.user.firstName[0]}{m.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{m.user.firstName} {m.user.lastName}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{m.role}</Badge>
                </div>
              ))}
              {org.members.length === 0 && (
                <p className="text-sm text-muted-foreground">No active members</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocs.map((doc) => {
                const statusConfig = DOCUMENT_STATUSES[doc.status as keyof typeof DOCUMENT_STATUSES]
                return (
                  <div key={doc.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(doc.createdAt, "dd MMM yyyy")}
                      </p>
                    </div>
                    {statusConfig && (
                      <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                    )}
                  </div>
                )
              })}
              {recentDocs.length === 0 && (
                <p className="text-sm text-muted-foreground">No documents yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Open CAPAs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open CAPAs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openCapas.map((capa) => {
                const statusConfig = CAPA_STATUSES[capa.status as keyof typeof CAPA_STATUSES]
                const priorityConfig = CAPA_PRIORITIES[capa.priority as keyof typeof CAPA_PRIORITIES]
                return (
                  <div key={capa.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{capa.title}</p>
                      {capa.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due {format(capa.dueDate, "dd MMM yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {priorityConfig && (
                        <Badge className={priorityConfig.color} variant="outline">{priorityConfig.label}</Badge>
                      )}
                      {statusConfig && (
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
              {openCapas.length === 0 && (
                <p className="text-sm text-muted-foreground">No open CAPAs</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Open Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openIncidents.map((incident) => {
                const statusConfig = INCIDENT_STATUSES[incident.status as keyof typeof INCIDENT_STATUSES]
                const typeConfig = INCIDENT_TYPES[incident.incidentType as keyof typeof INCIDENT_TYPES]
                return (
                  <div key={incident.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(incident.incidentDate, "dd MMM yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {typeConfig && (
                        <Badge className={typeConfig.color} variant="outline">{typeConfig.label}</Badge>
                      )}
                      {statusConfig && (
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
              {openIncidents.length === 0 && (
                <p className="text-sm text-muted-foreground">No open incidents</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScrollText className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAudit.map((event) => (
              <div key={event.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <span className="font-medium">
                    {event.user ? `${event.user.firstName} ${event.user.lastName}` : "System"}
                  </span>{" "}
                  <span className="text-muted-foreground">{event.action.toLowerCase().replace(/_/g, " ")}</span>{" "}
                  <span>{event.entityType}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {format(event.createdAt, "dd MMM HH:mm")}
                </span>
              </div>
            ))}
            {recentAudit.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
