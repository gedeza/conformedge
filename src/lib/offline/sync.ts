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
