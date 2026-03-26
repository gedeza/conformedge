"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { addToSyncQueue, getSyncQueueCount, type SyncEntry } from "@/lib/offline/db"
import { processSyncQueue, registerSyncHandler, resetStaleSyncEntries } from "@/lib/offline/sync"

interface UseOfflineSyncOptions {
  /** Server actions to register as sync handlers */
  handlers?: Record<SyncEntry["action"], (payload: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>>
}

interface UseOfflineSyncReturn {
  /** Whether the browser is online */
  isOnline: boolean
  /** Number of pending items in the sync queue */
  pendingCount: number
  /** Whether a sync is currently in progress */
  isSyncing: boolean
  /** Queue a mutation for offline-first processing */
  queueAction: (action: SyncEntry["action"], payload: Record<string, unknown>) => Promise<void>
  /** Manually trigger sync */
  syncNow: () => Promise<void>
}

export function useOfflineSync(options?: UseOfflineSyncOptions): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  )
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const registeredRef = useRef(false)

  // Register handlers once
  useEffect(() => {
    if (registeredRef.current || !options?.handlers) return
    for (const [action, handler] of Object.entries(options.handlers)) {
      registerSyncHandler(action as SyncEntry["action"], handler)
    }
    registeredRef.current = true
  }, [options?.handlers])

  // Track online/offline status
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  // Refresh pending count
  const refreshCount = useCallback(async () => {
    try {
      const count = await getSyncQueueCount()
      setPendingCount(count)
    } catch {
      // IndexedDB unavailable
    }
  }, [])

  // Sync pending items
  const syncNow = useCallback(async () => {
    if (isSyncing || !isOnline) return
    setIsSyncing(true)
    try {
      await processSyncQueue()
    } finally {
      setIsSyncing(false)
      await refreshCount()
    }
  }, [isSyncing, isOnline, refreshCount])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncNow()
    }
  }, [isOnline, pendingCount, syncNow])

  // Reset stale entries and poll pending count on mount
  useEffect(() => {
    resetStaleSyncEntries().then(() => refreshCount())
  }, [refreshCount])

  // Queue an action
  const queueAction = useCallback(async (
    action: SyncEntry["action"],
    payload: Record<string, unknown>
  ) => {
    await addToSyncQueue({ action, payload })
    await refreshCount()

    // If online, sync immediately
    if (navigator.onLine) {
      // Small delay to batch rapid actions
      setTimeout(() => syncNow(), 500)
    }
  }, [refreshCount, syncNow])

  return { isOnline, pendingCount, isSyncing, queueAction, syncNow }
}
