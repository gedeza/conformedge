"use client"

import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { bulkCreateDocuments } from "./actions"

interface FileEntry {
  file: File
  status: "pending" | "uploading" | "uploaded" | "error"
  fileUrl?: string
  fileType?: string
  fileSize?: number
  error?: string
}

interface BulkUploadButtonProps {
  projects: Array<{ id: string; name: string }>
}

export function BulkUploadButton({ projects }: BulkUploadButtonProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [projectId, setProjectId] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const uploaded = files.filter((f) => f.status === "uploaded").length
  const isUploading = files.some((f) => f.status === "uploading")
  const progress = files.length > 0 ? (uploaded / files.length) * 100 : 0

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles((prev) => [
      ...prev,
      ...selected.map((file) => ({ file, status: "pending" as const })),
    ])
    if (inputRef.current) inputRef.current.value = ""
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadAll() {
    // Upload each file to /api/upload
    const updated = [...files]

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== "pending") continue

      updated[i] = { ...updated[i], status: "uploading" }
      setFiles([...updated])

      try {
        const formData = new FormData()
        formData.append("file", updated[i].file)

        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (!res.ok) {
          const data = await res.json()
          updated[i] = { ...updated[i], status: "error", error: data.error || "Upload failed" }
        } else {
          const data = await res.json()
          updated[i] = {
            ...updated[i],
            status: "uploaded",
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            fileSize: data.fileSize,
          }
        }
      } catch {
        updated[i] = { ...updated[i], status: "error", error: "Network error" }
      }

      setFiles([...updated])
    }

    // Create document records for successfully uploaded files
    const successful = updated.filter((f) => f.status === "uploaded" && f.fileUrl)
    if (successful.length === 0) {
      toast.error("No files uploaded successfully")
      return
    }

    startTransition(async () => {
      const result = await bulkCreateDocuments(
        successful.map((f) => ({
          title: f.file.name.replace(/\.[^/.]+$/, ""),
          fileUrl: f.fileUrl!,
          fileType: f.fileType!,
          fileSize: f.fileSize!,
          projectId: projectId || undefined,
        }))
      )

      if (result.success) {
        toast.success(`${result.data!.count} document${result.data!.count > 1 ? "s" : ""} created`)
        setOpen(false)
        setFiles([])
        setProjectId("")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFiles([]); setProjectId("") } }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" asChild className="flex-1">
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Select Files
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
              </label>
            </Button>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Project (optional)" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {files.length > 0 && (
            <>
              <Progress value={progress} className="h-2" />
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                      {f.status === "pending" && <FileText className="h-4 w-4 text-muted-foreground shrink-0" />}
                      {f.status === "uploading" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />}
                      {f.status === "uploaded" && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                      {f.status === "error" && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      <span className="flex-1 truncate">{f.file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {(f.file.size / 1024).toFixed(0)} KB
                      </span>
                      {f.status === "pending" && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={uploadAll}
              disabled={files.length === 0 || isUploading || isPending || uploaded === files.length}
            >
              {isUploading ? "Uploading..." : isPending ? "Creating..." : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
