"use client"

import { useOfflineSync } from "@/hooks/use-offline-sync"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function OfflineIndicator({ className }: { className?: string }) {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync()

  if (isOnline && pendingCount === 0) return null

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isOnline
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        className
      )}
    >
      {isSyncing ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing...
        </>
      ) : isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          {pendingCount} pending
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline{pendingCount > 0 && ` (${pendingCount})`}
        </>
      )}
    </div>
  )
}
