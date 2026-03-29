export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "AUDITOR" | "VIEWER"
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"
export type DocumentStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "EXPIRED" | "ARCHIVED"
export type CAPAType = "CORRECTIVE" | "PREVENTIVE"
export type CAPAStatus = "OPEN" | "IN_PROGRESS" | "VERIFICATION" | "CLOSED" | "OVERDUE"
export type CAPAPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type ChecklistStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
export type VendorTier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "UNRATED"
export type AuditPackStatus = "DRAFT" | "COMPILING" | "READY" | "SUBMITTED" | "ACCEPTED"
export type NotificationType = "DOCUMENT_EXPIRY" | "CAPA_DUE" | "ASSESSMENT_SCHEDULED" | "CERT_EXPIRY" | "SYSTEM" | "APPROVAL_REQUEST" | "CERT_UPLOAD" | "CHECKLIST_DUE" | "INCIDENT_REPORTED" | "OBJECTIVE_DUE" | "MANAGEMENT_REVIEW_DUE" | "PERMIT_EXPIRING" | "INVESTIGATION_OVERDUE" | "STATUTORY_DEADLINE" | "CALIBRATION_DUE" | "CALIBRATION_OVERDUE" | "MAINTENANCE_DUE" | "EQUIPMENT_QUARANTINED" | "SUBSCRIPTION_TRIAL_ENDING" | "SUBSCRIPTION_PAYMENT_FAILED" | "SUBSCRIPTION_CANCELLED" | "QUOTA_LIMIT_REACHED" | "QUOTA_WARNING" | "TEAM_INVITATION" | "OBLIGATION_EXPIRING" | "VENDOR_COMPLIANCE_ALERT" | "TRAINING_EXPIRING"
export type WorkPermitStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "CLOSED" | "CANCELLED" | "EXPIRED"
export type WorkPermitType = "HOT_WORK" | "CONFINED_SPACE" | "WORKING_AT_HEIGHTS" | "ELECTRICAL" | "EXCAVATION" | "LIFTING" | "GENERAL"
export type ExtensionStatus = "PENDING" | "APPROVED" | "REJECTED"
export type ManagementReviewStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type AgendaItemType = "AUDIT_RESULTS" | "CUSTOMER_FEEDBACK" | "PROCESS_PERFORMANCE" | "CAPA_STATUS" | "PREVIOUS_ACTIONS" | "CHANGES_CONTEXT" | "IMPROVEMENT_OPPORTUNITIES" | "RESOURCE_NEEDS" | "RISK_OPPORTUNITIES" | "OBJECTIVES_PERFORMANCE" | "INCIDENT_TRENDS" | "OTHER"
export type ReviewActionStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type ObjectiveStatus = "DRAFT" | "ACTIVE" | "ON_TRACK" | "AT_RISK" | "BEHIND" | "ACHIEVED" | "CANCELLED"
export type MeasurementFrequency = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY"
export type IncidentStatus = "REPORTED" | "INVESTIGATING" | "CORRECTIVE_ACTION" | "CLOSED"
export type IncidentType = "NEAR_MISS" | "FIRST_AID" | "MEDICAL" | "LOST_TIME" | "FATALITY" | "ENVIRONMENTAL" | "PROPERTY_DAMAGE"

export type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY" | "CUSTOM"
export type ApprovalStepStatus = "PENDING" | "APPROVED" | "REJECTED" | "SKIPPED"
export type ApprovalRequestStatus = "IN_PROGRESS" | "APPROVED" | "REJECTED" | "CANCELLED"
export type NotificationChannel = "IN_APP" | "EMAIL"
export type CrossReferenceType = "EQUIVALENT" | "RELATED" | "SUPPORTING"
export type ShareLinkType = "DOCUMENT" | "AUDIT_PACK" | "PORTAL" | "VENDOR"
export type CertificationStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED"
export type ShareLinkStatus = "ACTIVE" | "EXPIRED" | "REVOKED"

// Partner types
export type PartnerTier = "CONSULTING" | "WHITE_LABEL" | "REFERRAL"
export type PartnerStatus = "APPLIED" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "TERMINATED"
export type PartnerRole = "PARTNER_ADMIN" | "PARTNER_MANAGER" | "PARTNER_VIEWER"
export type PartnerClientSize = "SMALL" | "MEDIUM" | "LARGE"
export type ReferralStatus = "PENDING" | "CLICKED" | "SIGNED_UP" | "CONVERTED" | "EXPIRED" | "CANCELLED"

// Legal / Terms types
export type TermsVersionStatus = "DRAFT" | "ACTIVE" | "SUPERSEDED"

// Billing types
export type PlanTier = "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE"
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "PAUSED"
export type BillingCycle = "MONTHLY" | "ANNUAL"
export type CreditTransactionType = "PURCHASE" | "USAGE" | "ADJUSTMENT" | "REFUND"
export type InvoiceStatus = "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE"
export type PaymentMethod = "PAYSTACK" | "EFT" | "INVOICE" | "PREPAID"
export type AccountTransactionType = "FUND" | "DEDUCT" | "REFUND" | "ADJUSTMENT"

// Enterprise types
export type StandardType = "MANAGEMENT_SYSTEM" | "STATUTORY" | "PROFESSIONAL_BODY"
export type OrganizationType = "STANDALONE" | "CORPORATE" | "DIVISION" | "SITE"
export type ObligationStatus = "PENDING" | "ACTIVE" | "EXPIRED" | "REVOKED" | "NOT_APPLICABLE"

export interface BillingContext {
  subscription: {
    plan: PlanTier
    status: SubscriptionStatus
    billingCycle: BillingCycle
    currentPeriodStart: Date
    currentPeriodEnd: Date
    trialEndsAt: Date | null
    cancelAtPeriodEnd: boolean
    gracePeriodEndsAt: Date | null
  }
  creditBalance: number
  usage: {
    aiClassificationsUsed: number
    documentsCount: number
    usersCount: number
    standardsCount: number
  }
}

export interface LimitCheckResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: PlanTier
  current?: number
  limit?: number | null
}

export type FieldType = "COMPLIANCE" | "BOOLEAN" | "NUMBER" | "RATING" | "SELECT"

export interface NumberFieldConfig {
  min?: number
  max?: number
  unit?: string
}

export interface RatingFieldConfig {
  max: number
}

export interface SelectFieldConfig {
  options: string[]
}

export type FieldConfig = NumberFieldConfig | RatingFieldConfig | SelectFieldConfig

export interface BooleanResponse { value: boolean }
export interface NumberResponse { value: number }
export interface RatingResponse { value: number }
export interface SelectResponse { value: string }

export type FieldResponse = BooleanResponse | NumberResponse | RatingResponse | SelectResponse

export type TreatmentType = "NONE" | "FIRST_AID" | "MEDICAL" | "HOSPITALIZED"

export interface WitnessRecord {
  id: string
  name: string
  contactNumber: string | null
  email: string | null
  statement: string | null
  createdAt: Date
}

export interface EvidenceRecord {
  id: string
  fileKey: string
  fileName: string
  fileType: string
  fileSize: number
  caption: string | null
  uploadedBy: { id: string; firstName: string; lastName: string } | null
  createdAt: Date
}

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
