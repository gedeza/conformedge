import { format } from "date-fns"
import { Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { isR2Key } from "@/lib/r2-utils"
import type { getSharedDocument } from "@/lib/share-data"

type SharedDoc = NonNullable<Awaited<ReturnType<typeof getSharedDocument>>>

interface SharedDocumentViewProps {
  document: SharedDoc
  allowDownload: boolean
  token: string
}

export function SharedDocumentView({ document: doc, allowDownload, token }: SharedDocumentViewProps) {
  const downloadUrl = doc.fileUrl
    ? isR2Key(doc.fileUrl)
      ? `/api/shared/${token}/download/${doc.fileUrl}`
      : doc.fileUrl
    : null

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{doc.title}</h2>
          </div>
          {doc.description && (
            <p className="text-sm text-muted-foreground">{doc.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs">v{doc.version}</Badge>
          <StatusBadge type="document" value={doc.status} />
        </div>
      </div>

      {allowDownload && downloadUrl && (
        <Button asChild>
          <a href={downloadUrl} download>
            <Download className="mr-2 h-4 w-4" /> Download File
          </a>
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Details</CardTitle>
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
              <span className="text-muted-foreground">Project</span>
              <p className="mt-1 font-medium">{doc.project?.name ?? "None"}</p>
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

      {doc.classifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ISO Classifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {doc.classifications.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-sm rounded-md border p-2">
                  <Badge>{c.standardClause.standard.code}</Badge>
                  <span className="font-medium">
                    {c.standardClause.clauseNumber} — {c.standardClause.title}
                  </span>
                  {c.isVerified ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">AI</Badge>
                  )}
                  <span className="text-muted-foreground">
                    {(c.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {doc.approvalRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            {doc.approvalRequests.map((req) => (
              <div key={req.id} className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge type="approvalRequest" value={req.status} />
                  <span className="text-muted-foreground">
                    Submitted {format(req.createdAt, "PPP")}
                  </span>
                </div>
                <div className="space-y-1 ml-4 border-l-2 pl-4">
                  {req.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      <StatusBadge type="approvalStep" value={step.status} />
                      <span>{step.label}</span>
                      <span className="text-muted-foreground">
                        ({step.assignedTo.firstName} {step.assignedTo.lastName})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
