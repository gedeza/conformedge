export const APP_NAME = "ConformEdge"
export const APP_DESCRIPTION = "AI-Powered SHEQ & Compliance Management"
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

export const OBLIGATION_STATUSES = {
  PENDING:        { label: "Pending",        color: "bg-yellow-100 text-yellow-800" },
  ACTIVE:         { label: "Active",         color: "bg-green-100 text-green-800" },
  EXPIRED:        { label: "Expired",        color: "bg-red-100 text-red-800" },
  REVOKED:        { label: "Revoked",        color: "bg-gray-100 text-gray-800" },
  NOT_APPLICABLE: { label: "N/A",            color: "bg-slate-100 text-slate-800" },
} as const

export const TRAINING_STATUSES = {
  PLANNED:   { label: "Planned",   color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
  EXPIRED:   { label: "Expired",   color: "bg-red-100 text-red-800" },
  REVOKED:   { label: "Revoked",   color: "bg-gray-100 text-gray-800" },
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
  "Head", "Face", "Eye (L)", "Eye (R)", "Ear (L)", "Ear (R)", "Neck",
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
  "Amputation",
  "Bruise/Crushing",
  "Burn/Scald",
  "Concussion",
  "Cut/Open Wound",
  "Dislocation",
  "Exposure",
  "Foreign Body",
  "Fracture",
  "Heart/Circulatory Condition",
  "Infection/Disease",
  "Inhalation/Poisoning",
  "Internal Injury",
  "Nerve/System Injury",
  "Puncture Wound",
  "Respiratory",
  "Skin Disorder",
  "Sprain/Strain",
  "Electric Shock",
  "Eye Injury",
  "Hearing Loss",
  "Heat Stroke/Exhaustion",
  "Suffocation/Asphyxiation",
  "Abrasion",
  "Multiple Injuries",
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

export const VENDOR_TIERS = {
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
  MANAGEMENT_REVIEW_DUE: { label: "Management Review Due", color: "bg-violet-100 text-violet-800" },
  PERMIT_EXPIRING: { label: "Permit Expiring", color: "bg-orange-100 text-orange-800" },
  INVESTIGATION_OVERDUE: { label: "Investigation Overdue", color: "bg-red-100 text-red-800" },
  STATUTORY_DEADLINE: { label: "Statutory Deadline", color: "bg-red-200 text-red-900" },
  CALIBRATION_DUE: { label: "Calibration Due", color: "bg-cyan-100 text-cyan-800" },
  CALIBRATION_OVERDUE: { label: "Calibration Overdue", color: "bg-red-100 text-red-800" },
  MAINTENANCE_DUE: { label: "Maintenance Due", color: "bg-teal-100 text-teal-800" },
  EQUIPMENT_QUARANTINED: { label: "Equipment Quarantined", color: "bg-red-100 text-red-800" },
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

export const EQUIPMENT_STATUSES = {
  ACTIVE:         { label: "Active",         color: "bg-green-100 text-green-800" },
  INACTIVE:       { label: "Inactive",       color: "bg-gray-100 text-gray-600" },
  UNDER_REPAIR:   { label: "Under Repair",   color: "bg-orange-100 text-orange-800" },
  DECOMMISSIONED: { label: "Decommissioned", color: "bg-gray-100 text-gray-800" },
  QUARANTINED:    { label: "Quarantined",    color: "bg-red-100 text-red-800" },
} as const

export const EQUIPMENT_CATEGORIES = [
  "Lifting Accessories",
  "Lifting Machines",
  "NDT Equipment",
  "Drilling Equipment",
  "Safety Equipment",
  "Measurement Instruments",
  "Vehicles",
  "PPE",
  "Fire Equipment",
  "Electrical Equipment",
  "General",
] as const

export const CALIBRATION_RESULTS = {
  PASS:        { label: "Pass",        color: "bg-green-100 text-green-800" },
  FAIL:        { label: "Fail",        color: "bg-red-100 text-red-800" },
  CONDITIONAL: { label: "Conditional", color: "bg-yellow-100 text-yellow-800" },
} as const

export const MAINTENANCE_STATUSES = {
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  COMPLETE:  { label: "Complete",  color: "bg-green-100 text-green-800" },
  POSTPONED: { label: "Postponed", color: "bg-yellow-100 text-yellow-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
} as const

export const MAINTENANCE_TYPES = [
  "Routine",
  "Preventive",
  "Corrective",
  "Overhaul",
] as const

export const REPAIR_PRIORITIES = {
  LOW:       { label: "Low",       color: "bg-green-100 text-green-800" },
  MEDIUM:    { label: "Medium",    color: "bg-yellow-100 text-yellow-800" },
  HIGH:      { label: "High",      color: "bg-orange-100 text-orange-800" },
  EMERGENCY: { label: "Emergency", color: "bg-red-100 text-red-800" },
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
  VENDOR: { label: "Vendor", color: "bg-orange-100 text-orange-800" },
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

/**
 * Industry-specific standard importance weights for gap analysis scoring.
 * Default weight is 1.0. Higher = more important for that industry.
 * These multiply the per-standard coverage to produce a weighted overall score.
 */
export const INDUSTRY_STANDARD_WEIGHTS: Record<string, Record<string, number>> = {
  "General Building": { ISO9001: 1.2, ISO45001: 1.5, ISO14001: 1.0 },
  "Civil Engineering": { ISO9001: 1.2, ISO45001: 1.5, ISO14001: 1.3, ECSA: 1.5 },
  "Electrical Engineering": { ISO9001: 1.2, ISO45001: 1.5, ECSA: 1.5 },
  "Mechanical Engineering": { ISO9001: 1.2, ISO45001: 1.3, ECSA: 1.5 },
  "Electrical Contracting": { ISO9001: 1.2, ISO45001: 1.5 },
  "Plumbing & Pipefitting": { ISO9001: 1.0, ISO45001: 1.3 },
  "Road Construction": { ISO9001: 1.2, ISO45001: 1.5, ISO14001: 1.3 },
  "Water & Sanitation": { ISO9001: 1.0, ISO45001: 1.3, ISO14001: 1.5 },
  "Mining & Resources": { ISO45001: 2.0, DMRE_MHSA: 2.0, ISO14001: 1.5, ISO9001: 1.0 },
  "Energy & Power": { ISO45001: 1.5, ISO14001: 1.5, ISO9001: 1.2 },
  "Manufacturing": { ISO9001: 1.5, ISO45001: 1.3, ISO14001: 1.3, POPIA: 1.2 },
  "Telecommunications": { ISO27001: 1.5, ISO9001: 1.2, POPIA: 1.5 },
  "Environmental Services": { ISO14001: 2.0, ISO9001: 1.0, ISO45001: 1.2 },
  "Project Management": { ISO9001: 1.3, SACPCMP: 1.5, ISO45001: 1.2 },
  "Consulting Engineering": { ECSA: 1.5, ISO9001: 1.3, ISO45001: 1.2 },
  "Facilities Management": { ISO45001: 1.3, ISO9001: 1.2, ISO14001: 1.2 },
  "IT Services": { ISO27001: 2.0, POPIA: 1.5, ISO9001: 1.2 },
  "Healthcare": { ISO45001: 1.5, POPIA: 1.5, ISO9001: 1.3 },
  "Logistics & Transport": { ISO39001: 2.0, ISO45001: 1.3, ISO9001: 1.2, ISO14001: 1.0 },
  "Other": {},
} as const

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
] as const

export const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB

/** Derive safe file extension from validated MIME type (not user-supplied filename) */
export const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
}

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

/**
 * v2.0 Partner Pricing — Flat per-client model (no volume discounts)
 * Per-client fees by subscription tier (not client "size"):
 *   Essentials: R1,499/mo | Professional: R1,999/mo | Business: R2,999/mo
 */
export const PARTNER_CLIENT_FEES = {
  ESSENTIALS:    { label: "Essentials",    feeCents: 149900 },  // R1,499/mo
  PROFESSIONAL:  { label: "Professional",  feeCents: 199900 },  // R1,999/mo
  BUSINESS:      { label: "Business",      feeCents: 299900 },  // R2,999/mo
} as const

/** Legacy alias — maps old size keys to new tier-based fees */
export const PARTNER_CLIENT_SIZES = {
  SMALL:  { label: "Essentials",    description: "Essentials tier", defaultFeeCents: 149900 },
  MEDIUM: { label: "Professional",  description: "Professional tier", defaultFeeCents: 199900 },
  LARGE:  { label: "Business",      description: "Business tier", defaultFeeCents: 299900 },
} as const

/** Partner seat fee: R999/mo per consultant seat (minimum 5 seats) */
export const PARTNER_SEAT_FEE_CENTS = 99900  // R999/mo
export const PARTNER_MIN_SEATS = 5

/** Once-off setup fees in cents */
export const PARTNER_SETUP_FEES = {
  CONSULTING:  2500000,  // R25,000
  WHITE_LABEL: 2500000,  // R25,000+
  REFERRAL:    0,
} as const

/** Monthly base = seats × seat fee (no flat base fee in v2.0) */
export const PARTNER_BASE_FEES = {
  CONSULTING:  PARTNER_MIN_SEATS * PARTNER_SEAT_FEE_CENTS,  // 5 × R999 = R4,995/mo
  WHITE_LABEL: PARTNER_MIN_SEATS * PARTNER_SEAT_FEE_CENTS,  // 5 × R999 = R4,995/mo
  REFERRAL: 0,
} as const

/** Referral commission — 10% of Year 1 subscription */
export const REFERRAL_COMMISSION_PERCENT = 10
export const REFERRAL_COMMISSION_MONTHS = 12

/** v2.0 removed volume discounts — flat pricing at all scales */
export const PARTNER_VOLUME_DISCOUNTS = [] as const

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
  vatNumber: process.env.COMPANY_VAT_NUMBER ?? "4110288877",
  regNumber: process.env.COMPANY_REG_NUMBER ?? "TBD",
  address: process.env.COMPANY_ADDRESS ?? "South Africa",
  email: process.env.COMPANY_EMAIL ?? "nhlanhla@isutech.co.za",
  phone: process.env.COMPANY_PHONE ?? "WhatsApp: +27 68 127 6710",
} as const

// Terms version statuses
export const TERMS_VERSION_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-800" },
  SUPERSEDED: { label: "Superseded", color: "bg-yellow-100 text-yellow-800" },
} as const
