/**
 * Sync engine: processes the offline queue when connectivity is restored.
 * Calls server actions for each pending mutation.
 */

import {
  getPendingSyncEntries,
  updateSyncEntry,
  removeSyncEntry,
  type SyncEntry,
} from "./db"

const MAX_RETRIES = 3

type SyncHandler = (payload: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>

/** Registry of server action handlers keyed by action name */
const handlers: Record<string, SyncHandler> = {}

/** Register a server action handler for a sync action type */
export function registerSyncHandler(action: SyncEntry["action"], handler: SyncHandler) {
  handlers[action] = handler
}

/** Process all pending sync entries. Returns count of successfully synced items. */
export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  const entries = await getPendingSyncEntries()
  let synced = 0
  let failed = 0

  for (const entry of entries) {
    const handler = handlers[entry.action]
    if (!handler) {
      // No handler registered — skip (shouldn't happen)
      failed++
      continue
    }

    try {
      await updateSyncEntry(entry.id!, { status: "syncing" })

      const result = await handler(entry.payload)

      if (result.success) {
        await removeSyncEntry(entry.id!)
        synced++
      } else {
        const retries = entry.retries + 1
        if (retries >= MAX_RETRIES) {
          await updateSyncEntry(entry.id!, {
            status: "failed",
            retries,
            error: result.error || "Max retries exceeded",
          })
          failed++
        } else {
          await updateSyncEntry(entry.id!, {
            status: "pending",
            retries,
            error: result.error,
          })
        }
      }
    } catch (err) {
      const retries = entry.retries + 1
      await updateSyncEntry(entry.id!, {
        status: retries >= MAX_RETRIES ? "failed" : "pending",
        retries,
        error: err instanceof Error ? err.message : "Network error",
      })
      if (retries >= MAX_RETRIES) failed++
    }
  }

  return { synced, failed }
}

/** Reset entries stuck in "syncing" state (e.g., from app crash) back to "pending" */
export async function resetStaleSyncEntries(): Promise<number> {
  try {
    const entries = await getPendingSyncEntriesByStatus("syncing")
    let resetCount = 0
    for (const entry of entries) {
      if (entry.id != null) {
        await updateSyncEntry(entry.id, { status: "pending" })
        resetCount++
      }
    }
    return resetCount
  } catch {
    return 0
  }
}

/** Get sync entries by status (internal helper) */
async function getPendingSyncEntriesByStatus(status: string): Promise<SyncEntry[]> {
  const db = await openDBInternal()
  const tx = db.transaction("sync-queue", "readonly")
  const index = tx.objectStore("sync-queue").index("status")
  const request = index.getAll(status)
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function openDBInternal(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("conformedge-offline", 1)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
