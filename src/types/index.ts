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
export type NotificationType = "DOCUMENT_EXPIRY" | "CAPA_DUE" | "ASSESSMENT_SCHEDULED" | "CERT_EXPIRY" | "SYSTEM" | "APPROVAL_REQUEST" | "CERT_UPLOAD"
export type ApprovalStepStatus = "PENDING" | "APPROVED" | "REJECTED" | "SKIPPED"
export type ApprovalRequestStatus = "IN_PROGRESS" | "APPROVED" | "REJECTED" | "CANCELLED"
export type NotificationChannel = "IN_APP" | "EMAIL"
export type CrossReferenceType = "EQUIVALENT" | "RELATED" | "SUPPORTING"
export type ShareLinkType = "DOCUMENT" | "AUDIT_PACK" | "PORTAL" | "SUBCONTRACTOR"
export type CertificationStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED"
export type ShareLinkStatus = "ACTIVE" | "EXPIRED" | "REVOKED"

export interface RootCauseWhy {
  question: string;  // "Why did X happen?"
  answer: string;    // The answer
}

export interface RootCauseData {
  method: 'simple' | '5-whys';
  category?: 'human' | 'machine' | 'material' | 'method' | 'environment' | 'measurement';
  whys: RootCauseWhy[];  // Up to 5 entries
  rootCause: string;     // Final determined root cause
  containmentAction?: string;  // Immediate containment action taken
}

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
