"use client"

import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw, Upload, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CameraCaptureProps {
  /** Called with the captured File object */
  onCapture: (file: File) => void
  /** Max image dimension (resized client-side) */
  maxDimension?: number
  /** JPEG quality (0–1) */
  quality?: number
  /** Optional CSS class */
  className?: string
  /** Label */
  label?: string
  /** Accept file upload as alternative to camera */
  allowFileUpload?: boolean
}

export function CameraCapture({
  onCapture,
  maxDimension = 1920,
  quality = 0.85,
  className,
  label = "Capture Photo",
  allowFileUpload = true,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [mode, setMode] = useState<"idle" | "camera" | "preview">("idle")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [error, setError] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async (facing: "environment" | "user" = facingMode) => {
    setError(null)
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: maxDimension }, height: { ideal: maxDimension } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMode("camera")
      setFacingMode(facing)
    } catch {
      setError("Camera access denied or unavailable. Use file upload instead.")
      setMode("idle")
    }
  }, [facingMode, maxDimension, stopCamera])

  const switchCamera = useCallback(() => {
    const next = facingMode === "environment" ? "user" : "environment"
    startCamera(next)
  }, [facingMode, startCamera])

  const resizeAndConvert = useCallback((source: HTMLVideoElement | HTMLImageElement): File | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    let sw: number, sh: number
    if (source instanceof HTMLVideoElement) {
      sw = source.videoWidth
      sh = source.videoHeight
    } else {
      sw = source.naturalWidth
      sh = source.naturalHeight
    }

    // Resize if needed
    let dw = sw
    let dh = sh
    if (sw > maxDimension || sh > maxDimension) {
      const ratio = Math.min(maxDimension / sw, maxDimension / sh)
      dw = Math.round(sw * ratio)
      dh = Math.round(sh * ratio)
    }

    canvas.width = dw
    canvas.height = dh
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(source, 0, 0, dw, dh)

    const dataUrl = canvas.toDataURL("image/jpeg", quality)
    setPreviewUrl(dataUrl)

    // Convert to File
    const byteString = atob(dataUrl.split(",")[1])
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    const blob = new Blob([ab], { type: "image/jpeg" })
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    return new File([blob], `photo-${timestamp}.jpg`, { type: "image/jpeg" })
  }, [maxDimension, quality])

  const capture = useCallback(() => {
    if (!videoRef.current) return
    const file = resizeAndConvert(videoRef.current)
    if (!file) return
    stopCamera()
    setMode("preview")
    onCapture(file)
  }, [resizeAndConvert, stopCamera, onCapture])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const img = new Image()
    img.onload = () => {
      const file = resizeAndConvert(img)
      if (file) {
        setMode("preview")
        onCapture(file)
      }
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(selected)

    // Reset input so same file can be reselected
    e.target.value = ""
  }, [resizeAndConvert, onCapture])

  const reset = useCallback(() => {
    stopCamera()
    setPreviewUrl(null)
    setError(null)
    setMode("idle")
  }, [stopCamera])

  return (
    <div className={cn("space-y-3", className)}>
      {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => startCamera()}>
            <Camera className="mr-1 h-4 w-4" />
            Open Camera
          </Button>
          {allowFileUpload && (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-1 h-4 w-4" />
                Upload Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          )}
        </div>
      )}

      {mode === "camera" && (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-md border bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[400px] object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={capture}>
              <Camera className="mr-1 h-4 w-4" />
              Capture
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={switchCamera}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Flip
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {mode === "preview" && previewUrl && (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-md border">
            <img src={previewUrl} alt="Captured photo" className="w-full max-h-[400px] object-contain" />
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                <ImageIcon className="mr-1 h-3 w-3" />
                Captured
              </span>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Retake
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
