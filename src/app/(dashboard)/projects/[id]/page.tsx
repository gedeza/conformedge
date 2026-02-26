import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, FileText, ClipboardCheck, AlertTriangle, CheckSquare, Package, ShieldCheck, ListChecks, CircleAlert, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getProject, getProjectMetrics } from "../actions"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let project: Awaited<ReturnType<typeof getProject>>

  try {
    project = await getProject(id)
  } catch {
    notFound()
  }

  if (!project) notFound()

  const counts = project._count

  // Fetch compliance metrics for the overview widgets
  let metrics: Awaited<ReturnType<typeof getProjectMetrics>> | null = null
  try {
    metrics = await getProjectMetrics(id)
  } catch {
    // Metrics are non-critical; page still renders without them
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader heading={project.name} description={project.description ?? undefined}>
        <StatusBadge type="project" value={project.status} />
      </PageHeader>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.documents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.assessments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAPAs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.capas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checklists</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.checklists}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Packs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.auditPacks}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="capas">CAPAs</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {/* Compliance Metric Widgets */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Compliance Score */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {metrics.complianceScore.total === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    <div className="space-y-2">
                      <div className={`text-3xl font-bold ${
                        metrics.complianceScore.percentage > 80
                          ? "text-green-600 dark:text-green-400"
                          : metrics.complianceScore.percentage > 60
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}>
                        {metrics.complianceScore.percentage}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {metrics.complianceScore.compliant} of {metrics.complianceScore.total} items compliant
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Checklist Progress */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Checklist Progress</CardTitle>
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {metrics.checklistProgress.total === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {metrics.checklistProgress.completed} of {metrics.checklistProgress.total}
                      </div>
                      <Progress value={metrics.checklistProgress.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {metrics.checklistProgress.percentage}% completed
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Overdue CAPAs */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue CAPAs</CardTitle>
                  <CircleAlert className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">{metrics.overdueCAPAs.count}</span>
                      {metrics.overdueCAPAs.count > 0 ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge className="bg-green-600 text-white hover:bg-green-600/90">On Track</Badge>
                      )}
                    </div>
                    {metrics.overdueCAPAs.count > 0 && (
                      <Link
                        href={`/capas?projectId=${id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View overdue CAPAs
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {metrics.riskDistribution.every((r) => r.count === 0) ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {metrics.riskDistribution.map((risk) => (
                        <div key={risk.level} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${
                              risk.level === "CRITICAL"
                                ? "bg-red-600"
                                : risk.level === "HIGH"
                                  ? "bg-orange-500"
                                  : risk.level === "MEDIUM"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }`} />
                            <span className="text-muted-foreground capitalize">{risk.level.toLowerCase()}</span>
                          </div>
                          <span className="font-medium">{risk.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1">
                    <StatusBadge type="project" value={project.status} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="mt-1 font-medium">{format(project.createdAt, "PPP")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Start Date</span>
                  <p className="mt-1 font-medium">
                    {project.startDate ? format(project.startDate, "PPP") : "Not set"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date</span>
                  <p className="mt-1 font-medium">
                    {project.endDate ? format(project.endDate, "PPP") : "Not set"}
                  </p>
                </div>
              </div>
              {project.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description</span>
                  <p className="mt-1 text-sm">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {project.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents linked to this project.</p>
              ) : (
                <div className="space-y-2">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <Link href={`/documents/${doc.id}`} className="font-medium hover:underline">
                          {doc.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{doc.fileType ?? "No file"}</p>
                      </div>
                      <StatusBadge type="document" value={doc.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              {project.assessments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No assessments for this project.</p>
              ) : (
                <div className="space-y-2">
                  {project.assessments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <Link href={`/assessments/${a.id}`} className="font-medium hover:underline">
                          {a.title}
                        </Link>
                        {a.overallScore !== null && (
                          <p className="text-sm text-muted-foreground">
                            Score: {a.overallScore.toFixed(1)}%
                          </p>
                        )}
                      </div>
                      {a.riskLevel && <StatusBadge type="risk" value={a.riskLevel} />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="capas">
          <Card>
            <CardHeader>
              <CardTitle>CAPAs</CardTitle>
            </CardHeader>
            <CardContent>
              {project.capas.length === 0 ? (
                <p className="text-sm text-muted-foreground">No CAPAs for this project.</p>
              ) : (
                <div className="space-y-2">
                  {project.capas.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <Link href={`/capas/${c.id}`} className="font-medium hover:underline">
                          {c.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{c.type}</p>
                      </div>
                      <StatusBadge type="capa" value={c.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="checklists">
          <Card>
            <CardHeader>
              <CardTitle>Checklists</CardTitle>
            </CardHeader>
            <CardContent>
              {project.checklists.length === 0 ? (
                <p className="text-sm text-muted-foreground">No checklists for this project.</p>
              ) : (
                <div className="space-y-2">
                  {project.checklists.map((cl) => (
                    <div key={cl.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <Link href={`/checklists/${cl.id}`} className="font-medium hover:underline">
                          {cl.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {cl.completionPercentage.toFixed(0)}% complete
                        </p>
                      </div>
                      <StatusBadge type="checklist" value={cl.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
