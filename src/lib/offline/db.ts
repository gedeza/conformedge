/**
 * IndexedDB wrapper for offline checklist data capture.
 * Stores pending mutations and checklist snapshots for offline-first usage.
 */

const DB_NAME = "conformedge-offline"
const DB_VERSION = 1

const STORES = {
  /** Pending mutations to sync when online */
  syncQueue: "sync-queue",
  /** Cached checklist data for offline viewing */
  checklists: "checklists",
} as const

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        const store = db.createObjectStore(STORES.syncQueue, {
          keyPath: "id",
          autoIncrement: true,
        })
        store.createIndex("status", "status", { unique: false })
        store.createIndex("createdAt", "createdAt", { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.checklists)) {
        db.createObjectStore(STORES.checklists, { keyPath: "id" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ---------- Sync Queue ----------

export interface SyncEntry {
  id?: number
  action: "toggleCompliance" | "updateItemResponse" | "updateItemEvidence"
  payload: Record<string, unknown>
  status: "pending" | "syncing" | "failed"
  retries: number
  createdAt: string
  error?: string
}

export async function addToSyncQueue(entry: Omit<SyncEntry, "id" | "status" | "retries" | "createdAt">): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORES.syncQueue, "readwrite")
  tx.objectStore(STORES.syncQueue).add({
    ...entry,
    status: "pending",
    retries: 0,
    createdAt: new Date().toISOString(),
  })
  await txComplete(tx)
}

export async function getPendingSyncEntries(): Promise<SyncEntry[]> {
  const db = await openDB()
  const tx = db.transaction(STORES.syncQueue, "readonly")
  const index = tx.objectStore(STORES.syncQueue).index("status")
  const request = index.getAll("pending")
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function updateSyncEntry(id: number, updates: Partial<SyncEntry>): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORES.syncQueue, "readwrite")
  const store = tx.objectStore(STORES.syncQueue)
  const existing = await getRecord<SyncEntry>(store, id)
  if (existing) {
    store.put({ ...existing, ...updates })
  }
  await txComplete(tx)
}

export async function removeSyncEntry(id: number): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORES.syncQueue, "readwrite")
  tx.objectStore(STORES.syncQueue).delete(id)
  await txComplete(tx)
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await openDB()
  const tx = db.transaction(STORES.syncQueue, "readonly")
  const index = tx.objectStore(STORES.syncQueue).index("status")
  const request = index.count("pending")
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ---------- Checklist Cache ----------

export interface CachedChecklist {
  id: string
  data: unknown
  cachedAt: string
}

export async function cacheChecklist(id: string, data: unknown): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORES.checklists, "readwrite")
  tx.objectStore(STORES.checklists).put({
    id,
    data,
    cachedAt: new Date().toISOString(),
  })
  await txComplete(tx)
}

export async function getCachedChecklist(id: string): Promise<CachedChecklist | undefined> {
  const db = await openDB()
  const tx = db.transaction(STORES.checklists, "readonly")
  return getRecord<CachedChecklist>(tx.objectStore(STORES.checklists), id)
}

// ---------- Helpers ----------

function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function getRecord<T>(store: IDBObjectStore, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
