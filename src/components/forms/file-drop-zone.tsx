"use client"

import { useRef, useState } from "react"
import { CloudUpload, FileCheck, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { MAX_FILE_SIZE } from "@/lib/constants"

interface UploadResult {
  fileUrl: string
  fileType: string
  fileSize: number
}

interface FileDropZoneProps {
  onUploadComplete: (result: UploadResult) => void
  onUploadStart?: () => void
  onUploadError?: (error: string) => void
  accept?: string
  maxSize?: number
  disabled?: boolean
  currentFileUrl?: string
}

export function FileDropZone({
  onUploadComplete,
  onUploadStart,
  onUploadError,
  accept = ".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png",
  maxSize = MAX_FILE_SIZE,
  disabled = false,
  currentFileUrl,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedName, setUploadedName] = useState<string | null>(
    currentFileUrl ? "File attached" : null
  )
  const [error, setError] = useState<string | null>(null)

  async function uploadFile(file: File) {
    if (file.size > maxSize) {
      const msg = `File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)} MB.`
      setError(msg)
      onUploadError?.(msg)
      return
    }

    setError(null)
    setUploading(true)
    onUploadStart?.()

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Upload failed")
      }

      const data: UploadResult = await res.json()
      setUploadedName(file.name)
      onUploadComplete(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      setError(msg)
      onUploadError?.(msg)
    } finally {
      setUploading(false)
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current++
    if (dragCounter.current === 1) setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current = 0
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ""
  }

  const isSuccess = !!uploadedName && !uploading && !error

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="File upload area. Click or drag and drop a file."
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={!disabled ? handleDrop : undefined}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm transition-colors cursor-pointer",
        dragging && "border-primary bg-primary/5",
        isSuccess && "border-green-500 bg-green-50 dark:bg-green-950/20",
        error && "border-destructive bg-destructive/5",
        !dragging && !isSuccess && !error && "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "pointer-events-none opacity-50 cursor-not-allowed",
        uploading && "cursor-wait"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || uploading}
      />

      {uploading ? (
        <>
          <CloudUpload className="h-8 w-8 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Uploading...</p>
          <Progress value={undefined} className="h-1.5 w-full max-w-xs" />
        </>
      ) : isSuccess ? (
        <>
          <FileCheck className="h-8 w-8 text-green-600" />
          <p className="font-medium text-green-700">{uploadedName}</p>
          <p className="text-xs text-muted-foreground">Click to replace</p>
        </>
      ) : error ? (
        <>
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-destructive text-center">{error}</p>
          <p className="text-xs text-muted-foreground">Click to try again</p>
        </>
      ) : (
        <>
          <CloudUpload className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Drop file here or click to browse</p>
          <p className="text-xs text-muted-foreground">
            PDF, Word, Excel, or images — max {Math.round(maxSize / 1024 / 1024)} MB
          </p>
        </>
      )}
    </div>
  )
}
