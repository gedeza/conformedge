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
} as const

export const SA_CONSTRUCTION_INDUSTRIES = [
  "General Building",
  "Civil Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Road Construction",
  "Water & Sanitation",
  "Mining & Resources",
  "Energy & Power",
  "Telecommunications",
  "Environmental Services",
  "Project Management",
  "Consulting Engineering",
  "Facilities Management",
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

export const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Projects", href: "/projects", icon: "FolderKanban" },
  { title: "Documents", href: "/documents", icon: "FileText" },
  { title: "Assessments", href: "/assessments", icon: "ClipboardCheck" },
  { title: "CAPAs", href: "/capas", icon: "AlertTriangle" },
  { title: "Checklists", href: "/checklists", icon: "CheckSquare" },
  { title: "Subcontractors", href: "/subcontractors", icon: "HardHat" },
  { title: "Audit Packs", href: "/audit-packs", icon: "Package" },
  { title: "Audit Trail", href: "/audit-trail", icon: "ScrollText" },
  { title: "Reports", href: "/reports", icon: "BarChart3" },
  { title: "Gap Analysis", href: "/gap-analysis", icon: "SearchCheck" },
] as const
