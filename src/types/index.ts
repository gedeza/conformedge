export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "AUDITOR" | "VIEWER"
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"
export type DocumentStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "EXPIRED" | "ARCHIVED"
export type CAPAType = "CORRECTIVE" | "PREVENTIVE"
export type CAPAStatus = "OPEN" | "IN_PROGRESS" | "VERIFICATION" | "CLOSED" | "OVERDUE"

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
