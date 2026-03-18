export const APP_NAME = "ConformEdge"
export const APP_DESCRIPTION = "AI-Powered ISO Compliance Management"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  AUDITOR: "AUDITOR",
  VIEWER: "VIEWER",
} as const

export const RISK_LEVELS = {
  LOW: { label: "Low", color: "bg-green-100 text-green-800" },
  MEDIUM: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-800" },
  CRITICAL: { label: "Critical", color: "bg-red-100 text-red-800" },
} as const

export const PROJECT_STATUSES = {
  PLANNING: { label: "Planning", color: "bg-blue-100 text-blue-800" },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-800" },
  ON_HOLD: { label: "On Hold", color: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-800" },
  ARCHIVED: { label: "Archived", color: "bg-gray-100 text-gray-600" },
} as const

export const DOCUMENT_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  PENDING_REVIEW: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  EXPIRED: { label: "Expired", color: "bg-red-100 text-red-800" },
  ARCHIVED: { label: "Archived", color: "bg-gray-100 text-gray-600" },
} as const

export const CAPA_STATUSES = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  VERIFICATION: { label: "Verification", color: "bg-purple-100 text-purple-800" },
  CLOSED: { label: "Closed", color: "bg-green-100 text-green-800" },
  OVERDUE: { label: "Overdue", color: "bg-red-100 text-red-800" },
} as const

export const INCIDENT_STATUSES = {
  REPORTED:          { label: "Reported",          color: "bg-blue-100 text-blue-800" },
  INVESTIGATING:     { label: "Investigating",     color: "bg-yellow-100 text-yellow-800" },
  CORRECTIVE_ACTION: { label: "Corrective Action", color: "bg-orange-100 text-orange-800" },
  CLOSED:            { label: "Closed",            color: "bg-green-100 text-green-800" },
} as const

export const INCIDENT_TYPES = {
  NEAR_MISS:       { label: "Near Miss",         color: "bg-sky-100 text-sky-800" },
  FIRST_AID:       { label: "First Aid",         color: "bg-yellow-100 text-yellow-800" },
  MEDICAL:         { label: "Medical Treatment", color: "bg-orange-100 text-orange-800" },
  LOST_TIME:       { label: "Lost Time Injury",  color: "bg-red-100 text-red-800" },
  FATALITY:        { label: "Fatality",          color: "bg-red-900 text-red-100" },
  ENVIRONMENTAL:   { label: "Environmental",     color: "bg-emerald-100 text-emerald-800" },
  PROPERTY_DAMAGE: { label: "Property Damage",   color: "bg-amber-100 text-amber-800" },
} as const

export const TREATMENT_TYPES = {
  NONE:         { label: "No Treatment",      color: "bg-gray-100 text-gray-800" },
  FIRST_AID:    { label: "First Aid",         color: "bg-yellow-100 text-yellow-800" },
  MEDICAL:      { label: "Medical Treatment", color: "bg-orange-100 text-orange-800" },
  HOSPITALIZED: { label: "Hospitalized",      color: "bg-red-100 text-red-800" },
} as const

export const CONTRIBUTING_FACTORS = [
  "Inadequate training",
  "PPE failure/not worn",
  "Fatigue/overwork",
  "Equipment malfunction",
  "Poor housekeeping",
  "Inadequate supervision",
  "Communication failure",
  "Unsafe work procedure",
  "Environmental conditions",
  "Human error",
  "Substance impairment",
  "Inadequate maintenance",
  "Design/engineering deficiency",
  "Management system failure",
  "Third-party action",
] as const

export const MHSA_SECTIONS = {
  "11": { label: "Section 11 — Serious Accident",      deadline: "24 hours" },
  "23": { label: "Section 23 — Dangerous Occurrence",   deadline: "24 hours" },
  "24": { label: "Section 24 — Occupational Disease",   deadline: "14 days" },
} as const

export const BODY_PARTS = [
  "Head", "Face", "Eyes", "Ears", "Neck",
  "Shoulder (L)", "Shoulder (R)", "Upper Arm (L)", "Upper Arm (R)",
  "Elbow (L)", "Elbow (R)", "Forearm (L)", "Forearm (R)",
  "Wrist (L)", "Wrist (R)", "Hand (L)", "Hand (R)", "Fingers (L)", "Fingers (R)",
  "Chest", "Upper Back", "Lower Back", "Abdomen", "Pelvis",
  "Hip (L)", "Hip (R)", "Thigh (L)", "Thigh (R)",
  "Knee (L)", "Knee (R)", "Lower Leg (L)", "Lower Leg (R)",
  "Ankle (L)", "Ankle (R)", "Foot (L)", "Foot (R)", "Toes (L)", "Toes (R)",
  "Multiple Body Parts", "Internal Organs",
] as const

export const NATURE_OF_INJURIES = [
  "Laceration/Cut",
  "Fracture",
  "Burn (thermal)",
  "Burn (chemical)",
  "Crush injury",
  "Sprain/Strain",
  "Contusion/Bruise",
  "Amputation",
  "Electric shock",
  "Inhalation/Poisoning",
  "Foreign body",
  "Hearing loss",
  "Eye injury",
  "Dislocation",
  "Abrasion",
  "Puncture wound",
  "Heat stroke/exhaustion",
  "Suffocation/Asphyxiation",
  "Multiple injuries",
  "Other",
] as const

export const OBJECTIVE_STATUSES = {
  DRAFT:     { label: "Draft",     color: "bg-gray-100 text-gray-800" },
  ACTIVE:    { label: "Active",    color: "bg-blue-100 text-blue-800" },
  ON_TRACK:  { label: "On Track",  color: "bg-green-100 text-green-800" },
  AT_RISK:   { label: "At Risk",   color: "bg-yellow-100 text-yellow-800" },
  BEHIND:    { label: "Behind",    color: "bg-red-100 text-red-800" },
  ACHIEVED:  { label: "Achieved",  color: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
} as const

export const MEASUREMENT_FREQUENCIES = {
  WEEKLY:    { label: "Weekly",    days: 7 },
  MONTHLY:   { label: "Monthly",   days: 30 },
  QUARTERLY: { label: "Quarterly", days: 90 },
  ANNUALLY:  { label: "Annually",  days: 365 },
} as const

export const MANAGEMENT_REVIEW_STATUSES = {
  PLANNED:     { label: "Planned",     color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  COMPLETED:   { label: "Completed",   color: "bg-green-100 text-green-800" },
  CANCELLED:   { label: "Cancelled",   color: "bg-gray-100 text-gray-600" },
} as const

export const REVIEW_ACTION_STATUSES = {
  OPEN:        { label: "Open",        color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  COMPLETED:   { label: "Completed",   color: "bg-green-100 text-green-800" },
  CANCELLED:   { label: "Cancelled",   color: "bg-gray-100 text-gray-600" },
} as const

export const AGENDA_ITEM_TYPES = {
  AUDIT_RESULTS:             { label: "Audit Results" },
  CUSTOMER_FEEDBACK:         { label: "Customer Feedback" },
  PROCESS_PERFORMANCE:       { label: "Process Performance" },
  CAPA_STATUS:               { label: "CAPA Status" },
  PREVIOUS_ACTIONS:          { label: "Previous Action Items" },
  CHANGES_CONTEXT:           { label: "Changes Affecting the QMS" },
  IMPROVEMENT_OPPORTUNITIES: { label: "Improvement Opportunities" },
  RESOURCE_NEEDS:            { label: "Resource Needs" },
  RISK_OPPORTUNITIES:        { label: "Risks & Opportunities" },
  OBJECTIVES_PERFORMANCE:    { label: "Objectives Performance" },
  INCIDENT_TRENDS:           { label: "Incident Trends" },
  OTHER:                     { label: "Other" },
} as const

export const CAPA_PRIORITIES = {
  LOW: { label: "Low", color: "bg-green-100 text-green-800" },
  MEDIUM: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-800" },
  CRITICAL: { label: "Critical", color: "bg-red-100 text-red-800" },
} as const

export const CAPA_TYPES = {
  CORRECTIVE: { label: "Corrective", color: "bg-blue-100 text-blue-800" },
  PREVENTIVE: { label: "Preventive", color: "bg-purple-100 text-purple-800" },
} as const

export const CHECKLIST_STATUSES = {
  NOT_STARTED: { label: "Not Started", color: "bg-gray-100 text-gray-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
} as const

export const SUBCONTRACTOR_TIERS = {
  PLATINUM: { label: "Platinum", color: "bg-violet-100 text-violet-800" },
  GOLD: { label: "Gold", color: "bg-yellow-100 text-yellow-800" },
  SILVER: { label: "Silver", color: "bg-gray-200 text-gray-800" },
  BRONZE: { label: "Bronze", color: "bg-orange-100 text-orange-800" },
  UNRATED: { label: "Unrated", color: "bg-gray-100 text-gray-600" },
} as const

export const AUDIT_PACK_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  COMPILING: { label: "Compiling", color: "bg-yellow-100 text-yellow-800" },
  READY: { label: "Ready", color: "bg-green-100 text-green-800" },
  SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
  ACCEPTED: { label: "Accepted", color: "bg-emerald-100 text-emerald-800" },
} as const

export const NOTIFICATION_TYPES = {
  DOCUMENT_EXPIRY: { label: "Document Expiry", color: "bg-orange-100 text-orange-800" },
  CAPA_DUE: { label: "CAPA Due", color: "bg-red-100 text-red-800" },
  ASSESSMENT_SCHEDULED: { label: "Assessment Scheduled", color: "bg-blue-100 text-blue-800" },
  CERT_EXPIRY: { label: "Certificate Expiry", color: "bg-yellow-100 text-yellow-800" },
  SYSTEM: { label: "System", color: "bg-gray-100 text-gray-800" },
  APPROVAL_REQUEST: { label: "Approval Request", color: "bg-purple-100 text-purple-800" },
  CERT_UPLOAD: { label: "Certificate Upload", color: "bg-amber-100 text-amber-800" },
  CHECKLIST_DUE: { label: "Checklist Due", color: "bg-emerald-100 text-emerald-800" },
  INCIDENT_REPORTED: { label: "Incident Reported", color: "bg-red-100 text-red-800" },
  OBJECTIVE_DUE: { label: "Objective Due", color: "bg-indigo-100 text-indigo-800" },
  SUBSCRIPTION_TRIAL_ENDING: { label: "Trial Ending", color: "bg-blue-100 text-blue-800" },
  SUBSCRIPTION_PAYMENT_FAILED: { label: "Payment Failed", color: "bg-red-100 text-red-800" },
  SUBSCRIPTION_CANCELLED: { label: "Subscription Cancelled", color: "bg-gray-100 text-gray-600" },
  QUOTA_LIMIT_REACHED: { label: "Quota Reached", color: "bg-orange-100 text-orange-800" },
  QUOTA_WARNING: { label: "Quota Warning", color: "bg-yellow-100 text-yellow-800" },
  TEAM_INVITATION: { label: "Team Invitation", color: "bg-blue-100 text-blue-800" },
  PERMIT_EXPIRING: { label: "Permit Expiring", color: "bg-orange-100 text-orange-800" },
} as const

export const WORK_PERMIT_STATUSES = {
  DRAFT:            { label: "Draft",            color: "bg-gray-100 text-gray-800" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "bg-yellow-100 text-yellow-800" },
  APPROVED:         { label: "Approved",         color: "bg-blue-100 text-blue-800" },
  ACTIVE:           { label: "Active",           color: "bg-green-100 text-green-800" },
  SUSPENDED:        { label: "Suspended",        color: "bg-orange-100 text-orange-800" },
  CLOSED:           { label: "Closed",           color: "bg-gray-100 text-gray-600" },
  CANCELLED:        { label: "Cancelled",        color: "bg-red-100 text-red-800" },
  EXPIRED:          { label: "Expired",          color: "bg-red-200 text-red-900" },
} as const

export const WORK_PERMIT_TYPES = {
  HOT_WORK:           { label: "Hot Work",            color: "bg-red-100 text-red-800" },
  CONFINED_SPACE:     { label: "Confined Space",      color: "bg-purple-100 text-purple-800" },
  WORKING_AT_HEIGHTS: { label: "Working at Heights",  color: "bg-sky-100 text-sky-800" },
  ELECTRICAL:         { label: "Electrical",          color: "bg-yellow-100 text-yellow-800" },
  EXCAVATION:         { label: "Excavation",          color: "bg-amber-100 text-amber-800" },
  LIFTING:            { label: "Lifting Operations",  color: "bg-indigo-100 text-indigo-800" },
  GENERAL:            { label: "General",             color: "bg-gray-100 text-gray-800" },
} as const

export const EXTENSION_STATUSES = {
  PENDING:  { label: "Pending",  color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
} as const

export const RECURRENCE_FREQUENCIES = {
  WEEKLY: { label: "Weekly" },
  MONTHLY: { label: "Monthly" },
  QUARTERLY: { label: "Quarterly" },
  ANNUALLY: { label: "Annually" },
  CUSTOM: { label: "Custom" },
} as const

export const APPROVAL_STEP_STATUSES = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
  SKIPPED: { label: "Skipped", color: "bg-gray-100 text-gray-600" },
} as const

export const APPROVAL_REQUEST_STATUSES = {
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
} as const

export const SHARE_LINK_STATUSES = {
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-800" },
  EXPIRED: { label: "Expired", color: "bg-red-100 text-red-800" },
  REVOKED: { label: "Revoked", color: "bg-gray-100 text-gray-600" },
} as const

export const SHARE_LINK_TYPES = {
  DOCUMENT: { label: "Document", color: "bg-blue-100 text-blue-800" },
  AUDIT_PACK: { label: "Audit Pack", color: "bg-purple-100 text-purple-800" },
  PORTAL: { label: "Portal", color: "bg-emerald-100 text-emerald-800" },
  SUBCONTRACTOR: { label: "Subcontractor", color: "bg-orange-100 text-orange-800" },
} as const

export const ASSESSMENT_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
  OVERDUE: { label: "Overdue", color: "bg-red-100 text-red-800" },
} as const

export const CERTIFICATION_STATUSES = {
  PENDING_REVIEW: { label: "Pending Review", color: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
} as const

export const INDUSTRIES = [
  "General Building",
  "Civil Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Electrical Contracting",
  "Plumbing & Pipefitting",
  "Road Construction",
  "Water & Sanitation",
  "Mining & Resources",
  "Energy & Power",
  "Manufacturing",
  "Telecommunications",
  "Environmental Services",
  "Project Management",
  "Consulting Engineering",
  "Facilities Management",
  "IT Services",
  "Healthcare",
  "Logistics & Transport",
  "Other",
] as const

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/** Derive safe file extension from validated MIME type (not user-supplied filename) */
export const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
}

export const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Projects", href: "/projects", icon: "FolderKanban" },
  { title: "Documents", href: "/documents", icon: "FileText" },
  { title: "Assessments", href: "/assessments", icon: "ClipboardCheck" },
  { title: "CAPAs", href: "/capas", icon: "AlertTriangle" },
  { title: "Incidents", href: "/incidents", icon: "Siren" },
  { title: "Objectives", href: "/objectives", icon: "Target" },
  { title: "Checklists", href: "/checklists", icon: "CheckSquare" },
  { title: "Subcontractors", href: "/subcontractors", icon: "Building2" },
  { title: "Audit Packs", href: "/audit-packs", icon: "Package" },
  { title: "Audit Trail", href: "/audit-trail", icon: "ScrollText" },
  { title: "Reports", href: "/reports", icon: "BarChart3" },
  { title: "Gap Analysis", href: "/gap-analysis", icon: "SearchCheck" },
  { title: "Cross-References", href: "/cross-references", icon: "GitCompareArrows" },
] as const

export const FIELD_TYPES = {
  COMPLIANCE: { label: "Compliance", icon: "CheckSquare" },
  BOOLEAN: { label: "Yes / No", icon: "ToggleLeft" },
  NUMBER: { label: "Number", icon: "Hash" },
  RATING: { label: "Rating", icon: "Star" },
  SELECT: { label: "Dropdown", icon: "ChevronDown" },
} as const

// ─────────────────────────────────────────────
// BILLING DISPLAY CONSTANTS
// ─────────────────────────────────────────────

export const SUBSCRIPTION_STATUSES = {
  TRIALING: { label: "Trial", color: "bg-blue-100 text-blue-800" },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-800" },
  PAST_DUE: { label: "Past Due", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
  PAUSED: { label: "Paused", color: "bg-yellow-100 text-yellow-800" },
} as const

export const PLAN_TIERS = {
  STARTER: { label: "Essentials", color: "bg-gray-100 text-gray-800" },
  PROFESSIONAL: { label: "Professional", color: "bg-blue-100 text-blue-800" },
  BUSINESS: { label: "Business", color: "bg-purple-100 text-purple-800" },
  ENTERPRISE: { label: "Enterprise", color: "bg-amber-100 text-amber-800" },
} as const

export const BILLING_CYCLES = {
  MONTHLY: { label: "Monthly" },
  ANNUAL: { label: "Annual" },
} as const

export const INVOICE_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-800" },
  PAID: { label: "Paid", color: "bg-green-100 text-green-800" },
  VOID: { label: "Void", color: "bg-gray-100 text-gray-600" },
  UNCOLLECTIBLE: { label: "Uncollectible", color: "bg-red-100 text-red-800" },
} as const

export const CREDIT_TRANSACTION_TYPES = {
  PURCHASE: { label: "Purchase", color: "bg-green-100 text-green-800" },
  USAGE: { label: "Usage", color: "bg-blue-100 text-blue-800" },
  ADJUSTMENT: { label: "Adjustment", color: "bg-yellow-100 text-yellow-800" },
  REFUND: { label: "Refund", color: "bg-purple-100 text-purple-800" },
} as const

// ─────────────────────────────────────────────
// PARTNER PROGRAM CONSTANTS
// ─────────────────────────────────────────────

export const PARTNER_TIERS = {
  CONSULTING: { label: "Consulting Partner", color: "bg-blue-100 text-blue-800" },
  WHITE_LABEL: { label: "White-Label Partner", color: "bg-purple-100 text-purple-800" },
  REFERRAL: { label: "Referral Partner", color: "bg-emerald-100 text-emerald-800" },
} as const

export const PARTNER_STATUSES = {
  APPLIED: { label: "Applied", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-800" },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-800" },
  SUSPENDED: { label: "Suspended", color: "bg-orange-100 text-orange-800" },
  TERMINATED: { label: "Terminated", color: "bg-red-100 text-red-800" },
} as const

export const PARTNER_ROLES = {
  PARTNER_ADMIN: { label: "Partner Admin", description: "Full partner management + all client orgs" },
  PARTNER_MANAGER: { label: "Partner Manager", description: "View/edit assigned client orgs" },
  PARTNER_VIEWER: { label: "Partner Viewer", description: "Read-only across assigned client orgs" },
} as const

export const PARTNER_CLIENT_SIZES = {
  SMALL: { label: "Small", description: "≤5 users, ≤2 standards", defaultFeeCents: 129900 },
  MEDIUM: { label: "Medium", description: "6-15 users, 3-5 standards", defaultFeeCents: 189900 },
  LARGE: { label: "Large", description: "16+ users, all standards", defaultFeeCents: 249900 },
} as const

/** Default base platform fees in cents */
export const PARTNER_BASE_FEES = {
  CONSULTING: 899900,   // R8,999/mo
  WHITE_LABEL: 1299900,  // R12,999/mo
  REFERRAL: 0,           // No platform fee for referral partners
} as const

/** Volume discount thresholds */
export const PARTNER_VOLUME_DISCOUNTS = [
  { minClients: 20, discountPercent: 15 },
  { minClients: 10, discountPercent: 10 },
] as const

export const REFERRAL_STATUSES = {
  PENDING: { label: "Pending", color: "bg-gray-100 text-gray-800" },
  CLICKED: { label: "Clicked", color: "bg-blue-100 text-blue-800" },
  SIGNED_UP: { label: "Signed Up", color: "bg-amber-100 text-amber-800" },
  CONVERTED: { label: "Converted", color: "bg-green-100 text-green-800" },
  EXPIRED: { label: "Expired", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
} as const

export const MAPPING_TYPE_COLORS = {
  EQUIVALENT: {
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  RELATED: {
    dot: "bg-purple-500",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  SUPPORTING: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
} as const

// Payment methods
export const PAYMENT_METHOD_LABELS = {
  PAYSTACK: { label: "Card (Paystack)", color: "bg-green-100 text-green-800" },
  EFT: { label: "EFT / Bank Transfer", color: "bg-blue-100 text-blue-800" },
  INVOICE: { label: "Invoice (Net Terms)", color: "bg-purple-100 text-purple-800" },
  PREPAID: { label: "Prepaid Balance", color: "bg-amber-100 text-amber-800" },
} as const

export const PAYMENT_TERMS_OPTIONS = [
  { value: "30", label: "Net 30 days" },
  { value: "60", label: "Net 60 days" },
] as const

export const ACCOUNT_TRANSACTION_TYPES = {
  FUND: { label: "Funded", color: "bg-green-100 text-green-800" },
  DEDUCT: { label: "Deducted", color: "bg-red-100 text-red-800" },
  REFUND: { label: "Refund", color: "bg-purple-100 text-purple-800" },
  ADJUSTMENT: { label: "Adjustment", color: "bg-yellow-100 text-yellow-800" },
} as const

// ─────────────────────────────────────────────
// QUOTATION CONSTANTS
// ─────────────────────────────────────────────

export const QUOTATION_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  SENT: { label: "Sent", color: "bg-blue-100 text-blue-800" },
  ACCEPTED: { label: "Accepted", color: "bg-green-100 text-green-800" },
  DECLINED: { label: "Declined", color: "bg-red-100 text-red-800" },
  EXPIRED: { label: "Expired", color: "bg-orange-100 text-orange-800" },
  INVOICED: { label: "Invoiced", color: "bg-purple-100 text-purple-800" },
} as const

export const ISU_TECH_DETAILS = {
  companyName: process.env.COMPANY_NAME ?? "Ticamark (PTY) LTD t/a iSu Technologies",
  vatNumber: process.env.COMPANY_VAT_NUMBER ?? "TBD",
  regNumber: process.env.COMPANY_REG_NUMBER ?? "TBD",
  address: process.env.COMPANY_ADDRESS ?? "South Africa",
  email: process.env.COMPANY_EMAIL ?? "nhlanhla@isutech.co.za",
  phone: process.env.COMPANY_PHONE ?? "+27 00 000 0000",
} as const

// Terms version statuses
export const TERMS_VERSION_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-800" },
  SUPERSEDED: { label: "Superseded", color: "bg-yellow-100 text-yellow-800" },
} as const
