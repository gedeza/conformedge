import { subDays, startOfYear } from "date-fns"

export interface DateRangeParams {
  from?: Date
  to?: Date
}

export type DatePreset = "7d" | "30d" | "90d" | "ytd" | "all"

export function parseDateRange(preset?: string, from?: string, to?: string): DateRangeParams {
  const now = new Date()

  if (from || to) {
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    }
  }

  switch (preset) {
    case "7d":
      return { from: subDays(now, 7), to: now }
    case "30d":
      return { from: subDays(now, 30), to: now }
    case "90d":
      return { from: subDays(now, 90), to: now }
    case "ytd":
      return { from: startOfYear(now), to: now }
    case "all":
    default:
      return {}
  }
}
