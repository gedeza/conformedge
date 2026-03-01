import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Download, FileText, ClipboardCheck, AlertTriangle, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getAuditPack } from "../actions"
import { getAuthContext } from "@/lib/auth"
import { canManageOrg } from "@/lib/permissions"
import { CompileButton } from "./compile-button"
import { EmailButton } from "./email-button"
import { ShareButton } from "../../documents/[id]/share-button"

export default async function AuditPackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let pack: Awaited<ReturnType<typeof getAuditPack>>
  let role = "VIEWER"

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    pack = await getAuditPack(id)
  } catch {
    notFound()
  }

  if (!pack) notFound()

  const project = pack.project
  const docCount = project?.documents.length ?? 0
  const assessmentCount = project?.assessments.length ?? 0
  const capaCount = project?.capas.length ?? 0
  const checklistCount = project?.checklists.length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/audit-packs"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      </div>

      <PageHeader heading={pack.title} description={pack.description ?? undefined}>
        <div className="flex items-center gap-2">
          <StatusBadge type="auditPack" value={pack.status} />
          {canManageOrg(role) && (
            <ShareButton entityId={pack.id} entityTitle={pack.title} type="AUDIT_PACK" />
          )}
          {pack.status === "DRAFT" && <CompileButton auditPackId={pack.id} />}
          {(pack.status === "READY" || pack.status === "SUBMITTED" || pack.status === "ACCEPTED") && (
            <>
              <EmailButton auditPackId={pack.id} packTitle={pack.title} />
              <Button asChild>
                <a href={`/api/audit-packs/${pack.id}/pdf`} download>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </a>
              </Button>
            </>
          )}
        </div>
      </PageHeader>

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
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Project</span>
              <p className="mt-1 font-medium">
                {project ? (
                  <Link href={`/projects/${project.id}`} className="hover:underline">{project.name}</Link>
                ) : "—"}
              </p>
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
              <p className="mt-1 font-medium">{pack.generatedAt ? format(pack.generatedAt, "PPP 'at' h:mm a") : "Not yet"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
