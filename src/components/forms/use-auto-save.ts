"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface UseAutoSaveOptions<T> {
  data: T
  saveFn: (data: T) => Promise<{ success: boolean; error?: string }>
  delay?: number
  enabled?: boolean
  onSaveSuccess?: () => void
  onSaveError?: (error: string) => void
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus
  lastSaved: Date | null
  saveNow: () => void
}

export function useAutoSave<T>({
  data,
  saveFn,
  delay = 1500,
  enabled = true,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef(data)
  const saveFnRef = useRef(saveFn)

  useEffect(() => { dataRef.current = data }, [data])
  useEffect(() => { saveFnRef.current = saveFn }, [saveFn])

  const executeSave = useCallback(async () => {
    setSaveStatus("saving")
    try {
      const result = await saveFnRef.current(dataRef.current)
      if (result.success) {
        setSaveStatus("saved")
        setLastSaved(new Date())
        onSaveSuccess?.()
        setTimeout(() => setSaveStatus("idle"), 3000)
      } else {
        setSaveStatus("error")
        onSaveError?.(result.error ?? "Save failed")
      }
    } catch {
      setSaveStatus("error")
      onSaveError?.("Save failed")
    }
  }, [onSaveSuccess, onSaveError])

  useEffect(() => {
    if (!enabled) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(executeSave, delay)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, delay, enabled, executeSave])

  const saveNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    executeSave()
  }, [executeSave])

  return { saveStatus, lastSaved, saveNow }
}
