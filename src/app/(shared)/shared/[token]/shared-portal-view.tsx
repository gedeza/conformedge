import { format } from "date-fns"
import { FileText, ClipboardCheck, AlertTriangle, CheckSquare, HardHat } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/shared/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { getSharedPortalData } from "@/lib/share-data"

type PortalData = NonNullable<Awaited<ReturnType<typeof getSharedPortalData>>>

interface SharedPortalViewProps {
  data: PortalData
  label: string
}

export function SharedPortalView({ data, label }: SharedPortalViewProps) {
  const { config, metrics, documents, assessments, capas, checklists, subcontractors } = data

  const tabs = [
    config.documents && { id: "documents", label: "Documents", icon: FileText, count: documents.length },
    config.assessments && { id: "assessments", label: "Assessments", icon: ClipboardCheck, count: assessments.length },
    config.capas && { id: "capas", label: "CAPAs", icon: AlertTriangle, count: capas.length },
    config.checklists && { id: "checklists", label: "Checklists", icon: CheckSquare, count: checklists.length },
    config.subcontractors && { id: "subcontractors", label: "Subcontractors", icon: HardHat, count: subcontractors.length },
  ].filter(Boolean) as { id: string; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[]

  const defaultTab = tabs[0]?.id ?? "documents"

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{label}</h2>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {metrics.documentCount !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{metrics.documentCount}</div></CardContent>
          </Card>
        )}
        {metrics.avgComplianceScore !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{metrics.avgComplianceScore.toFixed(0)}%</div></CardContent>
          </Card>
        )}
        {metrics.openCapas !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open CAPAs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{metrics.openCapas}</div></CardContent>
          </Card>
        )}
        {metrics.checklistCompletion !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{metrics.checklistCompletion.toFixed(0)}%</div></CardContent>
          </Card>
        )}
      </div>

      {tabs.length > 0 && (
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label} ({tab.count})
              </TabsTrigger>
            ))}
          </TabsList>

          {config.documents && (
            <TabsContent value="documents">
              <Card>
                <CardContent className="pt-6">
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Classifications</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.title}</TableCell>
                            <TableCell><StatusBadge type="document" value={d.status} /></TableCell>
                            <TableCell>v{d.version}</TableCell>
                            <TableCell className="text-sm">{d.fileType ?? "—"}</TableCell>
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {config.assessments && (
            <TabsContent value="assessments">
              <Card>
                <CardContent className="pt-6">
                  {assessments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No assessments.</p>
                  ) : (
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
                        {assessments.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.title}</TableCell>
                            <TableCell><Badge variant="outline">{a.standard.code}</Badge></TableCell>
                            <TableCell>{a.overallScore ? `${a.overallScore.toFixed(0)}%` : "—"}</TableCell>
                            <TableCell>{a.riskLevel ? <StatusBadge type="risk" value={a.riskLevel} /> : "—"}</TableCell>
                            <TableCell className="text-sm">{a.completedDate ? format(a.completedDate, "PP") : "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {config.capas && (
            <TabsContent value="capas">
              <Card>
                <CardContent className="pt-6">
                  {capas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No CAPAs.</p>
                  ) : (
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
                        {capas.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.title}</TableCell>
                            <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                            <TableCell><StatusBadge type="capa" value={c.status} /></TableCell>
                            <TableCell><StatusBadge type="priority" value={c.priority} /></TableCell>
                            <TableCell className="text-sm">{c.dueDate ? format(c.dueDate, "PP") : "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {config.checklists && (
            <TabsContent value="checklists">
              <Card>
                <CardContent className="pt-6">
                  {checklists.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No checklists.</p>
                  ) : (
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
                        {checklists.map((cl) => (
                          <TableRow key={cl.id}>
                            <TableCell className="font-medium">{cl.title}</TableCell>
                            <TableCell><Badge variant="outline">{cl.standard.code}</Badge></TableCell>
                            <TableCell>{cl.completionPercentage.toFixed(0)}%</TableCell>
                            <TableCell><StatusBadge type="checklist" value={cl.status} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {config.subcontractors && (
            <TabsContent value="subcontractors">
              <Card>
                <CardContent className="pt-6">
                  {subcontractors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No subcontractors.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>BEE Level</TableHead>
                          <TableHead>Certifications</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subcontractors.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell><StatusBadge type="subcontractor" value={s.tier} /></TableCell>
                            <TableCell>{s.beeLevel ?? "—"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {s.certifications.map((cert, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {cert.name}
                                    {cert.expiresAt && ` (exp ${format(cert.expiresAt, "PP")})`}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  )
}
