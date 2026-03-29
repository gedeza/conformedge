import { FileDown, HardHat, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"
import { getAuthContext } from "@/lib/auth"
import { getSiteId } from "@/lib/site-context"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"

async function getSHEFileData(dbOrgId: string, siteId?: string | null) {
  const projects = await db.project.findMany({
    where: {
      organizationId: dbOrgId,
      status: { in: ["ACTIVE", "PLANNING"] },
      ...(siteId ? { siteId } : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      startDate: true,
      _count: {
        select: {
          documents: true,
          assessments: true,
          capas: true,
          checklists: true,
          incidents: true,
          workPermits: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Get obligation counts per project + org-wide
  const obligationCounts = await db.complianceObligation.groupBy({
    by: ["projectId"],
    where: { organizationId: dbOrgId },
    _count: true,
  })

  const orgWideObligations = await db.complianceObligation.count({
    where: { organizationId: dbOrgId, projectId: null },
  })

  return projects.map((p) => {
    const projectObligations = obligationCounts.find((o) => o.projectId === p.id)?._count ?? 0
    const totalObligations = projectObligations + orgWideObligations
    const totalItems = p._count.documents + p._count.assessments + p._count.capas +
      p._count.checklists + p._count.incidents + p._count.workPermits + totalObligations

    // Simple readiness score based on having data in key sections
    const sections = [
      p._count.documents > 0,      // Documents on file
      p._count.assessments > 0,    // Risk assessments
      p._count.checklists > 0,     // Inspection checklists
      totalObligations > 0,        // Obligations (s37(2), COIDA, etc.)
      p._count.incidents >= 0,     // Incident register (always true — even 0 is valid)
      p._count.workPermits >= 0,   // Permits register
    ]
    const readiness = Math.round((sections.filter(Boolean).length / sections.length) * 100)

    return {
      ...p,
      totalObligations,
      totalItems,
      readiness,
    }
  })
}

export default async function SHEFilesPage() {
  let projects: Awaited<ReturnType<typeof getSHEFileData>> = []
  let authError = false

  try {
    const { dbOrgId } = await getAuthContext()
    const siteId = await getSiteId()
    projects = await getSHEFileData(dbOrgId, siteId)
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="SHE Files" description="Safety, Health & Environment files per Construction Regulations 2014" />
        <EmptyState icon={HardHat} title="Authentication required" description="Please sign in and select an organisation." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="SHE Files" description="Generate Safety, Health & Environment files per OHS Act 85/1993 and Construction Regulations 2014">
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <HardHat className="mr-1 h-3 w-3" />
          {projects.length} Active Project{projects.length !== 1 ? "s" : ""}
        </Badge>
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No active projects"
          description="Create a project to generate a SHE file. SHE files compile data from documents, assessments, incidents, permits, obligations, and checklists."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="border-border/50 transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <ReadinessBadge readiness={project.readiness} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-bold">{project._count.documents}</p>
                    <p className="text-xs text-muted-foreground">Docs</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-bold">{project._count.incidents}</p>
                    <p className="text-xs text-muted-foreground">Incidents</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-bold">{project._count.workPermits}</p>
                    <p className="text-xs text-muted-foreground">Permits</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-bold">{project._count.assessments}</p>
                    <p className="text-xs text-muted-foreground">Assessments</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-bold">{project.totalObligations}</p>
                    <p className="text-xs text-muted-foreground">Obligations</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-bold">{project._count.checklists}</p>
                    <p className="text-xs text-muted-foreground">Checklists</p>
                  </div>
                </div>

                {project.startDate && (
                  <p className="text-xs text-muted-foreground">
                    Started: {format(project.startDate, "PP")}
                  </p>
                )}

                <Button className="w-full" asChild>
                  <a href={`/api/she-files/${project.id}/pdf`} target="_blank" rel="noopener noreferrer">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download SHE File
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm">About SHE Files</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            A SHE (Safety, Health & Environment) file is required by the Occupational Health and Safety Act 85 of 1993
            and Construction Regulations 2014 (Regulation 7). It must be maintained on-site and available for inspection.
          </p>
          <p>
            ConformEdge compiles your SHE file automatically from existing data across 17 sections including
            legal standing, Section 37(2) agreements, risk assessments, permits to work, incident register,
            sub-contractor register, environmental compliance, and safety statistics.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function ReadinessBadge({ readiness }: { readiness: number }) {
  if (readiness >= 80) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 shrink-0">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {readiness}%
      </Badge>
    )
  }
  if (readiness >= 50) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 shrink-0">
        <Clock className="mr-1 h-3 w-3" />
        {readiness}%
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 shrink-0">
      <AlertTriangle className="mr-1 h-3 w-3" />
      {readiness}%
    </Badge>
  )
}
