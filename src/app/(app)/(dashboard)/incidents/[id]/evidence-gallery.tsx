"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload, X, FileText, Image as ImageIcon, Loader2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CameraCapture } from "@/components/shared/camera-capture"
import { canEdit, canDelete } from "@/lib/permissions"
import { addEvidence, removeEvidence } from "../actions"

interface EvidenceItem {
  id: string
  fileKey: string
  fileName: string
  fileType: string
  fileSize: number
  caption: string | null
  uploadedBy: { id: string; firstName: string; lastName: string } | null
  createdAt: Date
}

interface EvidenceGalleryProps {
  incidentId: string
  evidence: EvidenceItem[]
  role: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageType(fileType: string): boolean {
  return fileType.startsWith("image/")
}

export function EvidenceGallery({ incidentId, evidence, role }: EvidenceGalleryProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        // Upload file to R2
        const formData = new FormData()
        formData.append("file", file)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })

        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          toast.error(err.error || `Failed to upload ${file.name}`)
          continue
        }

        const { fileUrl, fileType, fileSize, fileName } = await uploadRes.json()

        // Link to incident
        const result = await addEvidence(incidentId, fileUrl, fileName, fileType, fileSize)
        if (result.success) {
          toast.success(`${fileName} uploaded`)
        } else {
          toast.error(result.error)
        }
      }
      router.refresh()
    } catch {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const result = await removeEvidence(deleteId)
      if (result.success) {
        toast.success("Evidence removed")
        setDeleteId(null)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Evidence & Photos</CardTitle>
        {canEdit(role) && (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" />Upload</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCamera(!showCamera)}
              disabled={isUploading}
              className="gap-1"
            >
              <Camera className="h-4 w-4" />
              {showCamera ? "Hide Camera" : "Take Photo"}
            </Button>
          </div>
        )}
      </CardHeader>
      {showCamera && canEdit(role) && (
        <CardContent className="pt-0 pb-3">
          <CameraCapture
            label="Capture evidence photo"
            onCapture={async (file) => {
              setIsUploading(true)
              try {
                const formData = new FormData()
                formData.append("file", file)
                const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
                if (!uploadRes.ok) {
                  toast.error("Failed to upload photo")
                  return
                }
                const { fileUrl, fileType, fileSize, fileName } = await uploadRes.json()
                const result = await addEvidence(incidentId, fileUrl, fileName, fileType, fileSize)
                if (result.success) {
                  toast.success("Photo uploaded")
                  router.refresh()
                } else {
                  toast.error(result.error)
                }
              } catch {
                toast.error("Upload failed")
              } finally {
                setIsUploading(false)
                setShowCamera(false)
              }
            }}
          />
        </CardContent>
      )}
      <CardContent>
        {evidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">No evidence files uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="relative group rounded-md border bg-muted/30 p-2 space-y-1"
              >
                {canDelete(role) && (
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-0.5"
                  >
                    <X className="h-3.5 w-3.5 text-destructive" />
                  </button>
                )}
                <a
                  href={`/api/download/${item.fileKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-center justify-center h-20 rounded bg-muted overflow-hidden">
                    {isImageType(item.fileType) ? (
                      <img
                        src={`/api/download/${item.fileKey}`}
                        alt={item.fileName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground/60" />
                    )}
                  </div>
                </a>
                <p className="text-[10px] font-medium truncate" title={item.fileName}>
                  {item.fileName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatFileSize(item.fileSize)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove Evidence"
        description="Remove this file from the incident? The file will remain in storage."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </Card>
  )
}
