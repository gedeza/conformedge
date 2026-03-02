"use client"

import { Check, Loader2, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error"
  lastSaved: Date | null
  className?: string
}

export function AutoSaveIndicator({ status, lastSaved, className }: AutoSaveIndicatorProps) {
  if (status === "idle" && !lastSaved) return null

  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-green-600">
            Saved {lastSaved ? formatDistanceToNow(lastSaved, { addSuffix: true }) : ""}
          </span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-destructive">Save failed</span>
        </>
      )}
      {status === "idle" && lastSaved && (
        <span>Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
      )}
    </div>
  )
}
