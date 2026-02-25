import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getDocument, getStandardsWithClauses } from "../actions"
import { ClauseTagForm } from "../clause-tag-form"
import { RemoveTagButton } from "./remove-tag-button"

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let doc: Awaited<ReturnType<typeof getDocument>>
  let standards: Awaited<ReturnType<typeof getStandardsWithClauses>> = []

  try {
    ;[doc, standards] = await Promise.all([getDocument(id), getStandardsWithClauses()])
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
          <TabsTrigger value="history">History</TabsTrigger>
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
              <ClauseTagForm documentId={doc.id} standards={standards} />
              {doc.classifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classifications yet. Add a clause tag above.</p>
              ) : (
                <div className="space-y-2">
                  {doc.classifications.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge>{c.standardClause.standard.code}</Badge>
                        <span className="font-medium">
                          Clause {c.standardClause.clauseNumber}
                        </span>
                        {c.isVerified && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">Verified</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          Confidence: {(c.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <RemoveTagButton documentId={doc.id} classificationId={c.id} />
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
              <p className="text-sm text-muted-foreground">
                Audit trail for this document will be populated from the audit log.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
