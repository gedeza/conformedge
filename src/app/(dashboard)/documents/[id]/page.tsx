import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getDocument, getStandardsWithClauses, getDocumentVersions, getDocumentAuditHistory } from "../actions"
import { getAuthContext } from "@/lib/auth"
import { canEdit } from "@/lib/permissions"
import { isExtractable } from "@/lib/ai/extract-text"
import { ClauseTagForm } from "../clause-tag-form"
import { RemoveTagButton } from "./remove-tag-button"
import { ClassifyButton } from "./classify-button"
import { VerifyButton } from "./verify-button"
import { VersionHistory } from "./version-history"

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let doc: Awaited<ReturnType<typeof getDocument>>
  let standards: Awaited<ReturnType<typeof getStandardsWithClauses>> = []
  let versions: Awaited<ReturnType<typeof getDocumentVersions>> = []
  let auditEvents: Awaited<ReturnType<typeof getDocumentAuditHistory>> = []
  let role = "VIEWER"

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    ;[doc, standards, versions, auditEvents] = await Promise.all([
      getDocument(id),
      getStandardsWithClauses(),
      getDocumentVersions(id),
      getDocumentAuditHistory(id),
    ])
  } catch {
    notFound()
  }

  if (!doc) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader heading={doc.title} description={doc.description ?? undefined}>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">v{doc.version}</Badge>
          <StatusBadge type="document" value={doc.status} />
          {doc.fileUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={doc.fileUrl} download>
                <Download className="mr-2 h-4 w-4" /> Download
              </a>
            </Button>
          )}
        </div>
      </PageHeader>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="classifications">Classifications ({doc.classifications.length})</TabsTrigger>
          <TabsTrigger value="history">History ({versions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1"><StatusBadge type="document" value={doc.status} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Version</span>
                  <p className="mt-1 font-medium">v{doc.version}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded By</span>
                  <p className="mt-1 font-medium">{doc.uploadedBy.firstName} {doc.uploadedBy.lastName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">File Type</span>
                  <p className="mt-1 font-medium">{doc.fileType ?? "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">File Size</span>
                  <p className="mt-1 font-medium">
                    {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Project</span>
                  <p className="mt-1 font-medium">
                    {doc.project ? (
                      <Link href={`/projects/${doc.project.id}`} className="hover:underline">
                        {doc.project.name}
                      </Link>
                    ) : "None"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires</span>
                  <p className="mt-1 font-medium">
                    {doc.expiresAt ? format(doc.expiresAt, "PPP") : "No expiry"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="mt-1 font-medium">{format(doc.createdAt, "PPP")}</p>
                </div>
                {doc.parentDocument && (
                  <div>
                    <span className="text-muted-foreground">Previous Version</span>
                    <p className="mt-1 font-medium">
                      <Link href={`/documents/${doc.parentDocument.id}`} className="hover:underline">
                        v{doc.parentDocument.version} — {doc.parentDocument.title}
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ISO Clause Classifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit(role) && (
                <ClassifyButton
                  documentId={doc.id}
                  fileType={doc.fileType}
                  isExtractable={isExtractable(doc.fileType)}
                />
              )}
              <ClauseTagForm documentId={doc.id} standards={standards} />
              {doc.classifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classifications yet. Use AI analysis or add a clause tag above.</p>
              ) : (
                <div className="space-y-2">
                  {doc.classifications.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge>{c.standardClause.standard.code}</Badge>
                          <span className="font-medium">
                            {c.standardClause.clauseNumber} — {c.standardClause.title}
                          </span>
                          {c.isVerified ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">AI</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {(c.confidence * 100).toFixed(0)}%
                          </span>
                          {c.isVerified && c.verifiedBy && (
                            <span className="text-xs text-muted-foreground">
                              by {c.verifiedBy.firstName} {c.verifiedBy.lastName}
                            </span>
                          )}
                        </div>
                        {c.standardClause.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {c.standardClause.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        {!c.isVerified && canEdit(role) && (
                          <VerifyButton documentId={doc.id} classificationId={c.id} />
                        )}
                        <RemoveTagButton documentId={doc.id} classificationId={c.id} />
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
            <CardHeader>
              <CardTitle>Document History</CardTitle>
            </CardHeader>
            <CardContent>
              <VersionHistory
                documentId={doc.id}
                currentVersion={doc.version}
                versions={versions}
                auditEvents={auditEvents}
                role={role}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
