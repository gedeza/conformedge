export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "AUDITOR" | "VIEWER"
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"
export type DocumentStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "EXPIRED" | "ARCHIVED"
export type CAPAType = "CORRECTIVE" | "PREVENTIVE"
export type CAPAStatus = "OPEN" | "IN_PROGRESS" | "VERIFICATION" | "CLOSED" | "OVERDUE"
export type CAPAPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type ChecklistStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
export type SubcontractorTier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "UNRATED"
export type AuditPackStatus = "DRAFT" | "COMPILING" | "READY" | "SUBMITTED" | "ACCEPTED"
export type NotificationType = "DOCUMENT_EXPIRY" | "CAPA_DUE" | "ASSESSMENT_SCHEDULED" | "CERT_EXPIRY" | "SYSTEM"

export interface ActionResult<T = null> {
  success: boolean
  data?: T
  error?: string
}

export interface NavItem {
  title: string
  href: string
  icon: string
  disabled?: boolean
}

export interface DashboardMetric {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: string
}
