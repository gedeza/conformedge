import { notFound } from "next/navigation"
import Link from "next/link"
import { format, isBefore } from "date-fns"
import { ArrowLeft, CheckSquare, ExternalLink, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getCapa, getMembers } from "../actions"
import { ActionItemList } from "./action-item-list"
import { EscalateButton } from "./escalate-button"
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
  // Try to parse structured data
  let data: RootCauseData | null = null
  if (rootCauseData && typeof rootCauseData === "object") {
    const candidate = rootCauseData as RootCauseData
    if (candidate.method === "5-whys" || candidate.method === "simple") {
      data = candidate
    }
  }

  // 5-Whys structured display
  if (data?.method === "5-whys") {
    const filledWhys = data.whys.filter((w) => w.answer)
    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Root Cause Analysis</span>
          <Badge variant="secondary" className="text-[10px]">5-Whys</Badge>
          {data.category && (
            <Badge variant="outline" className="text-[10px]">
              {CATEGORY_LABELS[data.category] ?? data.category}
            </Badge>
          )}
        </div>

        {/* Why chain — vertical timeline */}
        {filledWhys.length > 0 && (
          <div className="relative ml-2 pl-4 border-l-2 border-muted space-y-3">
            {filledWhys.map((w, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[calc(1rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                <p className="text-xs font-semibold text-muted-foreground">Why {i + 1}</p>
                <p className="text-sm">{w.answer}</p>
              </div>
            ))}
            {/* Root cause at the end of the chain */}
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

        {/* Containment action */}
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

  // Simple / fallback display
  if (!rootCause) return null
  return (
    <div className="mt-4">
      <span className="text-sm text-muted-foreground">Root Cause</span>
      <p className="mt-1 text-sm">{rootCause}</p>
    </div>
  )
}

export default async function CapaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let capa: Awaited<ReturnType<typeof getCapa>>
  let members: Awaited<ReturnType<typeof getMembers>> = []

  try {
    ;[capa, members] = await Promise.all([getCapa(id), getMembers()])
  } catch {
    notFound()
  }

  if (!capa) notFound()

  const isOverdue = capa.dueDate && capa.status !== "CLOSED" && isBefore(new Date(capa.dueDate), new Date())
  const displayStatus = isOverdue ? "OVERDUE" : capa.status
  const totalActions = capa.capaActions.length
  const linkedFindings = capa.linkedItems ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/capas"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      </div>

      <PageHeader heading={capa.title} description={capa.description ?? undefined}>
        <div className="flex items-center gap-2">
          {capa.status !== "CLOSED" && <EscalateButton capaId={capa.id} currentPriority={capa.priority} />}
          <StatusBadge type="capa" value={displayStatus} />
          <StatusBadge type="priority" value={capa.priority} />
        </div>
      </PageHeader>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="actions">Actions ({totalActions})</TabsTrigger>
          <TabsTrigger value="findings">Findings ({linkedFindings.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>CAPA Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <p className="mt-1 font-medium">{capa.type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1"><StatusBadge type="capa" value={displayStatus} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority</span>
                  <div className="mt-1"><StatusBadge type="priority" value={capa.priority} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date</span>
                  <p className="mt-1 font-medium">{capa.dueDate ? format(capa.dueDate, "PPP") : "Not set"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Raised By</span>
                  <p className="mt-1 font-medium">{capa.raisedBy.firstName} {capa.raisedBy.lastName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned To</span>
                  <p className="mt-1 font-medium">
                    {capa.assignedTo ? `${capa.assignedTo.firstName} ${capa.assignedTo.lastName}` : "Unassigned"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Project</span>
                  <p className="mt-1 font-medium">
                    {capa.project ? (
                      <Link href={`/projects/${capa.project.id}`} className="hover:underline">{capa.project.name}</Link>
                    ) : "None"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Closed Date</span>
                  <p className="mt-1 font-medium">{capa.closedDate ? format(capa.closedDate, "PPP") : "—"}</p>
                </div>
              </div>
              <RootCauseDisplay
                rootCause={capa.rootCause}
                rootCauseData={capa.rootCauseData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <ActionItemList
            capaId={capa.id}
            actions={capa.capaActions}
            members={members}
          />
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Linked Checklist Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedFindings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No checklist findings linked to this CAPA.
                  <br />
                  <span className="text-xs">CAPAs can be raised from non-compliant checklist items.</span>
                </p>
              ) : (
                <div className="space-y-3">
                  {linkedFindings.map((item) => (
                    <div key={item.id} className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.description}</p>
                          {item.standardClause && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Clause {item.standardClause.clauseNumber}: {item.standardClause.title}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px]">
                              {item.checklist.standard.code}
                            </Badge>
                            <Link
                              href={`/checklists/${item.checklist.id}`}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              {item.checklist.title}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-[10px] shrink-0">
                          Non-Compliant
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>History</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Audit trail coming from the audit log.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
