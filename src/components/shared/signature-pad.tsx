"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Eraser, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SignaturePadProps {
  /** Called with base64 PNG data URL when user confirms signature */
  onSave: (dataUrl: string) => void
  /** Width of the canvas (CSS pixels) */
  width?: number
  /** Height of the canvas (CSS pixels) */
  height?: number
  /** Line color */
  penColor?: string
  /** Line width */
  penWidth?: number
  /** Optional CSS class for the container */
  className?: string
  /** Label text above the pad */
  label?: string
}

export function SignaturePad({
  onSave,
  width = 400,
  height = 200,
  penColor = "#000000",
  penWidth = 2,
  className,
  label = "Sign below",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Scale canvas for retina displays
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = penColor
    ctx.lineWidth = penWidth
  }, [width, height, penColor, penWidth])

  const getPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const scaleX = width / rect.width
      const scaleY = height / rect.height

      if ("touches" in e) {
        const touch = e.touches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    },
    [width, height]
  )

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const ctx = canvasRef.current?.getContext("2d")
      if (!ctx) return
      const { x, y } = getPosition(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
      setHasSignature(true)
    },
    [getPosition]
  )

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return
      e.preventDefault()
      const ctx = canvasRef.current?.getContext("2d")
      if (!ctx) return
      const { x, y } = getPosition(e)
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    [isDrawing, getPosition]
  )

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }, [])

  const save = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return
    onSave(canvas.toDataURL("image/png"))
  }, [hasSignature, onSave])

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      )}
      <div className="rounded-md border border-input bg-white">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", maxWidth: width, height, touchAction: "none" }}
          className="cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          <Eraser className="mr-1 h-4 w-4" />
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={!hasSignature}
        >
          <Check className="mr-1 h-4 w-4" />
          Confirm Signature
        </Button>
      </div>
    </div>
  )
}
