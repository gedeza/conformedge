import { format } from "date-fns"
import { Download, Package, FileText, ClipboardCheck, AlertTriangle, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { getSharedAuditPack } from "@/lib/share-data"

type SharedPack = NonNullable<Awaited<ReturnType<typeof getSharedAuditPack>>>

interface SharedAuditPackViewProps {
  pack: SharedPack
  allowDownload: boolean
  token: string
}

export function SharedAuditPackView({ pack, allowDownload, token }: SharedAuditPackViewProps) {
  const project = pack.project
  const docCount = project?.documents.length ?? 0
  const assessmentCount = project?.assessments.length ?? 0
  const capaCount = project?.capas.length ?? 0
  const checklistCount = project?.checklists.length ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{pack.title}</h2>
          </div>
          {pack.description && (
            <p className="text-sm text-muted-foreground">{pack.description}</p>
          )}
        </div>
        <StatusBadge type="auditPack" value={pack.status} />
      </div>

      {allowDownload && (
        <Button asChild>
          <a href={`/api/shared/${token}/pdf`} download>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </a>
        </Button>
      )}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{docCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{assessmentCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAPAs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{capaCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checklists</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{checklistCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pack Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Project</span>
              <p className="mt-1 font-medium">{project?.name ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created By</span>
              <p className="mt-1 font-medium">{pack.createdBy.firstName} {pack.createdBy.lastName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="mt-1 font-medium">{format(pack.createdAt, "PPP")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Generated</span>
              <p className="mt-1 font-medium">
                {pack.generatedAt ? format(pack.generatedAt, "PPP 'at' h:mm a") : "Not yet"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {project && docCount > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Classifications</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.documents.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.title}</TableCell>
                    <TableCell><StatusBadge type="document" value={d.status} /></TableCell>
                    <TableCell>v{d.version}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {d.classifications.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {c.standardClause.standard.code} {c.standardClause.clauseNumber}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {project && assessmentCount > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Assessments</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Standard</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.assessments.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell><Badge variant="outline">{a.standard.code}</Badge></TableCell>
                    <TableCell>{a.overallScore ? `${a.overallScore.toFixed(0)}%` : "—"}</TableCell>
                    <TableCell>{a.riskLevel ? <StatusBadge type="risk" value={a.riskLevel} /> : "—"}</TableCell>
                    <TableCell className="text-sm">{a.completedDate ? format(a.completedDate, "PP") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {project && capaCount > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">CAPAs</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.capas.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                    <TableCell><StatusBadge type="capa" value={c.status} /></TableCell>
                    <TableCell><StatusBadge type="priority" value={c.priority} /></TableCell>
                    <TableCell className="text-sm">{c.dueDate ? format(c.dueDate, "PP") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {project && checklistCount > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Checklists</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Standard</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.checklists.map((cl, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{cl.title}</TableCell>
                    <TableCell><Badge variant="outline">{cl.standard.code}</Badge></TableCell>
                    <TableCell>{cl.completionPercentage.toFixed(0)}%</TableCell>
                    <TableCell><StatusBadge type="checklist" value={cl.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
