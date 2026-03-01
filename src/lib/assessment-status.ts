/**
 * Pure utility for deriving assessment status from existing fields.
 * No DB imports — safe for both server and client.
 */

export type AssessmentDerivedStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE"

interface AssessmentStatusInput {
  completedDate: Date | null
  scheduledDate: Date | null
  /** Number of answers already recorded */
  answerCount: number
}

/**
 * Derives assessment status from existing fields.
 * Priority: COMPLETED > IN_PROGRESS > OVERDUE > SCHEDULED > DRAFT
 */
export function getAssessmentStatus(input: AssessmentStatusInput): AssessmentDerivedStatus {
  if (input.completedDate) return "COMPLETED"
  if (input.answerCount > 0) return "IN_PROGRESS"
  if (input.scheduledDate && new Date(input.scheduledDate) < new Date()) return "OVERDUE"
  if (input.scheduledDate) return "SCHEDULED"
  return "DRAFT"
}
