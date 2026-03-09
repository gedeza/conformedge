import type { ObjectiveStatus } from "@/types"

export interface StatusInput {
  currentValue: number
  targetValue: number
  dueDate: Date | null
  createdAt: Date
  status: string
}

/**
 * Derive the display status of an objective based on time-proportional progress.
 * Pure utility — no DB imports.
 */
export function deriveObjectiveStatus(input: StatusInput): ObjectiveStatus {
  const { currentValue, targetValue, dueDate, createdAt, status } = input

  if (status === "CANCELLED") return "CANCELLED"
  if (status === "DRAFT") return "DRAFT"
  if (targetValue > 0 && currentValue >= targetValue) return "ACHIEVED"
  if (!dueDate) return "ACTIVE"

  const now = new Date()
  if (now > dueDate && currentValue < targetValue) return "BEHIND"

  const totalMs = dueDate.getTime() - createdAt.getTime()
  const elapsedMs = now.getTime() - createdAt.getTime()
  const progressRatio = totalMs > 0 ? Math.min(elapsedMs / totalMs, 1) : 1
  const achievementRatio = targetValue > 0 ? currentValue / targetValue : 0

  if (achievementRatio >= progressRatio * 0.9) return "ON_TRACK"
  if (achievementRatio >= progressRatio * 0.6) return "AT_RISK"
  return "BEHIND"
}
