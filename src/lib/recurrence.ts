import { addWeeks, addMonths, addDays } from "date-fns"
import type { RecurrenceFrequency } from "@/types"

/**
 * Compute the next due date from the given date based on frequency.
 */
export function computeNextDueDate(
  fromDate: Date,
  frequency: RecurrenceFrequency,
  customIntervalDays?: number | null
): Date {
  switch (frequency) {
    case "WEEKLY":
      return addWeeks(fromDate, 1)
    case "MONTHLY":
      return addMonths(fromDate, 1)
    case "QUARTERLY":
      return addMonths(fromDate, 3)
    case "ANNUALLY":
      return addMonths(fromDate, 12)
    case "CUSTOM":
      return addDays(fromDate, customIntervalDays ?? 30)
  }
}
