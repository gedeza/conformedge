import {
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  Building2,
  Package,
  Brain,
  BarChart3,
  Shield,
  type LucideIcon,
} from "lucide-react"

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Standards", href: "#standards" },
  { label: "Pricing", href: "#pricing" },
] as const

export const ISO_STANDARDS = [
  { code: "ISO 9001", name: "Quality", clauses: 31 },
  { code: "ISO 14001", name: "Environmental", clauses: 30 },
  { code: "ISO 45001", name: "OH&S", clauses: 29 },
  { code: "ISO 27001", name: "Information Security", clauses: 26 },
  { code: "ISO 19011", name: "Auditing", clauses: 25 },
  { code: "ISO 31000", name: "Risk Management", clauses: 24 },
  { code: "ISO 44001", name: "Collaborative Business", clauses: 22 },
  { code: "DMRE/MHSA", name: "Mine Health & Safety", clauses: 33 },
  { code: "POPIA", name: "Data Protection", clauses: 40 },
  { code: "ECSA", name: "Engineering Council", clauses: 28 },
  { code: "SACPCMP", name: "Construction Management", clauses: 25 },
] as const

export const PAIN_POINTS = [
  {
    title: "Scattered Documentation",
    description: "Compliance docs live in emails, shared drives, and filing cabinets. Finding the right version takes hours.",
    stat: "60%",
    statLabel: "of audit time spent searching for documents",
  },
  {
    title: "Audit Surprises",
    description: "You only discover gaps when the auditor arrives. By then it's too late to fix anything.",
    stat: "3x",
    statLabel: "more non-conformances without proactive tracking",
  },
  {
    title: "Expired Certifications",
    description: "Vendor and subcontractor certs slip through the cracks. One expired certificate can halt an entire project.",
    stat: "R2M+",
    statLabel: "average cost of project delays from compliance failures",
  },
] as const

export const PROCESS_STEPS = [
  {
    step: 1,
    title: "Upload & Classify",
    description: "Upload any document — AI instantly maps it to the correct ISO standard and clause with confidence scoring.",
  },
  {
    step: 2,
    title: "Track & Monitor",
    description: "Real-time dashboards show compliance gaps, expiring documents, and overdue actions across all standards.",
  },
  {
    step: 3,
    title: "Generate & Submit",
    description: "Compile audit-ready evidence packs in one click. Share with auditors via secure client portal links.",
  },
] as const

export type FeatureItem = {
  title: string
  description: string
  icon: LucideIcon
  span?: number
}

export const FEATURES: FeatureItem[] = [
  {
    title: "AI Document Classification",
    description: "Upload any document and AI instantly maps it to the correct ISO standard and clause — with confidence scoring you can verify.",
    icon: Brain,
    span: 2,
  },
  {
    title: "Gap Assessments",
    description: "Identify what's missing or at risk across any ISO standard your organisation follows.",
    icon: ClipboardCheck,
  },
  {
    title: "CAPA Management",
    description: "Track issues from discovery to resolution with root cause analysis and automatic escalation.",
    icon: AlertTriangle,
  },
  {
    title: "Compliance Checklists",
    description: "Ready-made and custom checklists with recurring schedules and 5 field types.",
    icon: CheckSquare,
  },
  {
    title: "Subcontractor Management",
    description: "Monitor certifications, BEE levels, safety ratings, and get alerts before certificates expire.",
    icon: Building2,
  },
  {
    title: "Audit Pack Generation",
    description: "Compile all required evidence into a professional PDF audit pack with one click.",
    icon: Package,
  },
  {
    title: "Document Management",
    description: "Version control, approval workflows, and expiry tracking for all compliance documents.",
    icon: FileText,
  },
  {
    title: "Reports & Analytics",
    description: "Compliance trends, risk heatmaps, and exportable reports for management review.",
    icon: BarChart3,
  },
] as const

export const FEATURE_DETAILS = [
  {
    title: "AI-Powered Document Intelligence",
    subtitle: "Powered by ConformEdge AI",
    description: "Upload any document — PDF, Word, Excel, or scanned image — and our AI engine instantly classifies it against the correct ISO standard and clause. Get confidence scores, gap insights, and cross-standard coverage analysis in seconds.",
    bullets: [
      "Automatic ISO clause mapping with confidence scoring",
      "OCR support for scanned documents and images",
      "Cross-standard gap detection and coverage analysis",
      "Bulk classification for large document libraries",
    ],
    imageAlt: "Document classification dashboard",
  },
  {
    title: "Integrated Management System",
    subtitle: "Multi-Standard Compliance",
    description: "Manage ISO 9001, 14001, 45001, 27001, DMRE/MHSA, POPIA, ECSA, SACPCMP, and more from a single dashboard. Our IMS engine identifies equivalent requirements across standards, so one document can satisfy multiple clauses.",
    bullets: [
      "Cross-standard requirement mapping",
      "Shared compliance evidence across standards",
      "Unified gap analysis and readiness scoring",
      "Integration scoring to measure IMS maturity",
    ],
    imageAlt: "IMS dashboard with cross-standard mapping",
  },
] as const

export const METRICS = [
  { value: 11, suffix: "", label: "Compliance Frameworks", prefix: "" },
  { value: 395, suffix: "+", label: "Sub-Clauses Tracked", prefix: "" },
  { value: 85, suffix: "%", label: "Faster Audit Prep", prefix: "" },
  { value: 34, suffix: "", label: "Integrated Modules", prefix: "" },
] as const

// Billing constants
export const ANNUAL_DISCOUNT_MONTHS = 10 // pay 10 months for 12 = ~17% off

export type PricingTier = {
  name: string
  monthlyPrice: number | null // null = Enterprise "Custom"
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Essentials",
    monthlyPrice: 2299,
    description: "For small businesses getting started with ISO compliance.",
    features: [
      "Up to 5 users (+R149/user)",
      "2 compliance frameworks",
      "1,000 documents",
      "50 AI classifications/month",
      "Assessments & checklists",
      "CAPAs & gap analysis",
      "Calendar & scheduling",
      "Email support (48h SLA)",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    monthlyPrice: 4499,
    description: "For growing companies managing multiple standards.",
    features: [
      "Up to 10 users (+R149/user)",
      "5 compliance frameworks",
      "Unlimited documents",
      "200 AI classifications/month",
      "IMS cross-standard mapping",
      "Incident management",
      "Objectives & KPI tracking",
      "Work permits (3 types)",
      "Audit packs & approval workflows",
      "Client portal sharing",
      "Report export (CSV/PDF)",
      "Priority support (24h SLA)",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Business",
    monthlyPrice: 8499,
    description: "For multi-site firms with SA regulatory compliance needs.",
    features: [
      "Up to 25 users (+R199/user)",
      "All 11 frameworks (incl. DMRE, POPIA, ECSA & SACPCMP)",
      "500 AI classifications/month",
      "SA statutory forms (W.Cl.2, SAPS 277)",
      "Work permits (all 7 types)",
      "Subcontractor compliance portal",
      "Advanced reports & analytics",
      "API access",
      "Dedicated support (8h SLA)",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    description: "For large organisations needing full control and scale.",
    features: [
      "Unlimited users",
      "Unlimited AI classifications",
      "SSO & advanced security",
      "Full API access (read/write)",
      "Custom integrations",
      "Dedicated account manager",
      "4h response SLA",
      "On-site training",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export type AiCreditPack = {
  credits: number
  price: number
  perCredit: number
  popular?: boolean
}

export const AI_CREDIT_PACKS: AiCreditPack[] = [
  { credits: 100, price: 25, perCredit: 0.25 },
  { credits: 500, price: 99, perCredit: 0.198, popular: true },
  { credits: 1000, price: 179, perCredit: 0.179 },
]

export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Standards", href: "#standards" },
    { label: "Security", href: "#" },
  ],
  company: [
    { label: "About ISU Tech", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
} as const
