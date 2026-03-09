import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getAuthContext } from "@/lib/auth"
import { getPermit, getMembers } from "../actions"
import { PermitActionsPanel } from "./permit-actions-panel"

export default async function PermitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let permit: Awaited<ReturnType<typeof getPermit>>
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let role = "VIEWER"

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    ;[permit, members] = await Promise.all([
      getPermit(id),
      getMembers(),
    ])
    if (!permit) notFound()
  } catch {
    notFound()
  }

  if (!permit) notFound()

  const checkedCount = permit.checklistItems.filter((i) => i.isChecked).length
  const totalChecklist = permit.checklistItems.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/permits"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      </div>

      <PageHeader heading={permit.title} description={permit.permitNumber ?? undefined}>
        <div className="flex items-center gap-2">
          <StatusBadge type="permit" value={permit.status} />
          <StatusBadge type="permitType" value={permit.permitType} />
          <StatusBadge type="risk" value={permit.riskLevel} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Permit Details */}
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader><CardTitle>Permit Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Permit Number</span>
                  <p className="mt-1 font-medium font-mono">{permit.permitNumber ?? "Pending"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location</span>
                  <p className="mt-1 font-medium">{permit.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Valid From</span>
                  <p className="mt-1 font-medium">{format(permit.validFrom, "PPP")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Valid To</span>
                  <p className="mt-1 font-medium">{format(permit.validTo, "PPP")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Requested By</span>
                  <p className="mt-1 font-medium">
                    {permit.requestedBy ? `${permit.requestedBy.firstName} ${permit.requestedBy.lastName}` : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Issued By</span>
                  <p className="mt-1 font-medium">
                    {permit.issuedBy ? `${permit.issuedBy.firstName} ${permit.issuedBy.lastName}` : "Pending approval"}
                  </p>
                </div>
                {permit.approvedAt && (
                  <div>
                    <span className="text-muted-foreground">Approved</span>
                    <p className="mt-1 font-medium">{format(permit.approvedAt, "PPP")}</p>
                  </div>
                )}
                {permit.activatedAt && (
                  <div>
                    <span className="text-muted-foreground">Activated</span>
                    <p className="mt-1 font-medium">{format(permit.activatedAt, "PPP")}</p>
                  </div>
                )}
                {permit.closedAt && (
                  <div>
                    <span className="text-muted-foreground">Closed</span>
                    <p className="mt-1 font-medium">{format(permit.closedAt, "PPP")}</p>
                  </div>
                )}
                {permit.project && (
                  <div>
                    <span className="text-muted-foreground">Project</span>
                    <p className="mt-1 font-medium">
                      <Link href={`/projects/${permit.project.id}`} className="hover:underline">{permit.project.name}</Link>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader><CardTitle>Description of Work</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{permit.description}</p>
            </CardContent>
          </Card>

          {/* Hazards & Controls */}
          {(permit.hazardsIdentified || permit.precautions || permit.ppeRequirements) && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Hazards & Controls</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {permit.hazardsIdentified && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Hazards Identified</span>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{permit.hazardsIdentified}</p>
                  </div>
                )}
                {permit.precautions && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Precautions / Controls</span>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{permit.precautions}</p>
                  </div>
                )}
                {permit.ppeRequirements && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">PPE Requirements</span>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{permit.ppeRequirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Emergency Procedures */}
          {permit.emergencyProcedures && (
            <Card className="border-border/50 transition-all hover:shadow-md border-amber-200 bg-amber-50/30">
              <CardHeader><CardTitle>Emergency Procedures</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{permit.emergencyProcedures}</p>
              </CardContent>
            </Card>
          )}

          {/* Safety Checklist */}
          {totalChecklist > 0 && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Safety Checklist</CardTitle>
                  <Badge variant="outline">{checkedCount}/{totalChecklist} completed</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {permit.checklistItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 py-1.5">
                      {item.isChecked ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className={`text-sm ${item.isChecked ? "line-through text-muted-foreground" : ""}`}>
                          {item.description}
                        </span>
                        {item.isChecked && item.checkedBy && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {item.checkedBy.firstName} {item.checkedBy.lastName}
                            {item.checkedAt && ` - ${format(item.checkedAt, "PPp")}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extensions History */}
          {permit.extensions.length > 0 && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Extension History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {permit.extensions.map((ext) => (
                    <div key={ext.id} className="border rounded-md p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Extend to {format(ext.newValidTo, "PPP")}
                        </span>
                        <StatusBadge type="extension" value={ext.status} />
                      </div>
                      <p className="text-muted-foreground">{ext.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Requested by {ext.requestedBy.firstName} {ext.requestedBy.lastName}</span>
                        <span>{format(ext.createdAt, "PPp")}</span>
                      </div>
                      {ext.reviewedBy && (
                        <p className="text-xs text-muted-foreground">
                          Reviewed by {ext.reviewedBy.firstName} {ext.reviewedBy.lastName}
                          {ext.reviewNotes && `: ${ext.reviewNotes}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Closure Notes */}
          {permit.closureNotes && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Closure / Suspension Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{permit.closureNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <PermitActionsPanel
            permitId={permit.id}
            currentStatus={permit.status}
            validTo={permit.validTo}
            checklistItems={permit.checklistItems.map((i) => ({
              id: i.id,
              description: i.description,
              isChecked: i.isChecked,
            }))}
            pendingExtension={permit.extensions.find((e) => e.status === "PENDING") ?? null}
            members={members}
            role={role}
          />
        </div>
      </div>
    </div>
  )
}
