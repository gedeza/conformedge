import { notFound } from "next/navigation"
import Link from "next/link"
import { format, isBefore } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getCapa, getMembers } from "../actions"
import { ActionItemList } from "./action-item-list"

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
  const completedActions = capa.capaActions.filter((a) => a.isCompleted).length
  const totalActions = capa.capaActions.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/capas"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      </div>

      <PageHeader heading={capa.title} description={capa.description ?? undefined}>
        <div className="flex items-center gap-2">
          <StatusBadge type="capa" value={displayStatus} />
          <StatusBadge type="priority" value={capa.priority} />
        </div>
      </PageHeader>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="actions">Actions ({totalActions})</TabsTrigger>
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
              {capa.rootCause && (
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">Root Cause</span>
                  <p className="mt-1 text-sm">{capa.rootCause}</p>
                </div>
              )}
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
