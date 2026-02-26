"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { Upload, Download, FileText, Clock, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadNewVersion } from "../actions"
import { canEdit } from "@/lib/permissions"

interface Version {
  id: string
  title: string
  version: number
  status: string
  fileUrl: string | null
  fileType: string | null
  fileSize: number | null
  createdAt: Date
  uploadedBy: { id: string; firstName: string; lastName: string }
  parentDocumentId: string | null
}

interface AuditEvent {
  id: string
  action: string
  metadata: unknown
  createdAt: Date
  user: { id: string; firstName: string; lastName: string; imageUrl: string | null } | null
}

interface VersionHistoryProps {
  documentId: string
  currentVersion: number
  versions: Version[]
  auditEvents: AuditEvent[]
  role: string
}

export function VersionHistory({
  documentId,
  currentVersion,
  versions,
  auditEvents,
  role,
}: VersionHistoryProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string
    fileType: string
    fileSize: number
    fileName: string
  } | null>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Upload failed")
        return
      }

      const data = await res.json()
      setUploadedFile(data)
      toast.success("File uploaded")
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function handleUploadNewVersion() {
    if (!uploadedFile) {
      toast.error("Please upload a file first")
      return
    }

    startTransition(async () => {
      const result = await uploadNewVersion(documentId, {
        fileUrl: uploadedFile.fileUrl,
        fileType: uploadedFile.fileType,
        fileSize: uploadedFile.fileSize,
      })

      if (result.success) {
        toast.success(`Version ${currentVersion + 1} created`)
        setDialogOpen(false)
        setUploadedFile(null)
        router.push(`/documents/${result.data!.id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const ACTION_LABELS: Record<string, string> = {
    CREATE: "Created",
    UPDATE: "Updated",
    STATUS_CHANGE: "Status changed",
    DELETE: "Deleted",
    TAG_CLAUSE: "Clause tagged",
    UNTAG_CLAUSE: "Clause untagged",
    NEW_VERSION: "New version uploaded",
  }

  return (
    <div className="space-y-6">
      {/* Upload New Version Button */}
      {canEdit(role) && (
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Version (v{currentVersion + 1})</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  The current version (v{currentVersion}) will be archived and a new version will be created.
                  ISO clause classifications will be carried over.
                </p>
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" asChild disabled={uploading}>
                      <label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? "Uploading..." : "Choose File"}
                        <Input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                    {uploadedFile && (
                      <span className="text-sm text-muted-foreground">{uploadedFile.fileName}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadNewVersion}
                    disabled={isPending || uploading || !uploadedFile}
                  >
                    {isPending ? "Creating..." : "Create Version"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Version Timeline */}
      {versions.length > 1 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Version History</h3>
          <div className="space-y-3">
            {versions.map((v) => {
              const isCurrent = v.id === documentId
              return (
                <div
                  key={v.id}
                  className={`flex items-center justify-between rounded-md border p-3 ${
                    isCurrent ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          v{v.version}
                        </span>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                        <StatusBadge type="document" value={v.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {v.uploadedBy.firstName} {v.uploadedBy.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(v.createdAt), "MMM d, yyyy HH:mm")}
                        </span>
                        {v.fileSize && (
                          <span>{(v.fileSize / 1024).toFixed(1)} KB</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.fileUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={v.fileUrl} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {!isCurrent && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/documents/${v.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {versions.length <= 1 && (
        <div className="text-sm text-muted-foreground">
          This is the only version of this document.
        </div>
      )}

      {/* Audit Activity */}
      {auditEvents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Activity Log</h3>
          <div className="space-y-2">
            {auditEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-sm border-l-2 border-muted pl-3 py-1">
                <div className="flex-1">
                  <span className="font-medium">
                    {ACTION_LABELS[event.action] || event.action}
                  </span>
                  {event.user && (
                    <span className="text-muted-foreground">
                      {" "}by {event.user.firstName} {event.user.lastName}
                    </span>
                  )}
                  {(() => {
                    const meta = event.metadata as Record<string, unknown> | null
                    if (meta && typeof meta === "object" && meta.from) {
                      return (
                        <span className="text-muted-foreground">
                          {" "}({String(meta.from)} → {String(meta.to)})
                        </span>
                      )
                    }
                    return null
                  })()}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(event.createdAt), "MMM d, yyyy HH:mm")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {auditEvents.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No activity recorded yet.
        </div>
      )}
    </div>
  )
}
