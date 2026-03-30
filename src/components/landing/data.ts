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
  Siren,
  ShieldCheck,
  Wrench,
  Target,
  ClipboardList,
  Smartphone,
  GraduationCap,
  FileCheck2,
  HardHat,
  Award,
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
  { code: "OHS Act", name: "Occupational Health & Safety", clauses: 43 },
  { code: "NEMA", name: "Environmental Management", clauses: 38 },
  { code: "NWA", name: "National Water Act", clauses: 29 },
  { code: "Carbon Tax", name: "Carbon Tax Act", clauses: 18 },
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
    description: "Vendor and vendor certs slip through the cracks. One expired certificate can halt an entire project.",
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
    title: "Vendor Management",
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
  {
    title: "Incident Management",
    description: "Full lifecycle incident tracking with COIDA W.Cl.2, SAPS 277, MHSA Section 11/23/24 statutory forms. Includes 5-Whys root cause analysis, fishbone diagrams, LTIFR calculation, and investigation sign-off workflow.",
    icon: Siren,
  },
  {
    title: "Work Permits (PTW)",
    description: "7 permit types (Hot Work, Confined Space, Heights, Electrical, Excavation, Lifting, General) with state machine workflow, extensions, and auto-expiry notifications.",
    icon: ShieldCheck,
  },
  {
    title: "Equipment & Asset Management",
    description: "Track equipment lifecycle with calibration schedules, maintenance planning, repair history, and Work Record Card templates. Automated overdue calibration alerts.",
    icon: Wrench,
  },
  {
    title: "Objectives & KPI Tracking",
    description: "Set measurable quality and safety objectives linked to ISO clauses. Track KPIs with automated measurement schedules and trend analysis.",
    icon: Target,
  },
  {
    title: "Management Reviews",
    description: "Structured management review meetings with 12-item agenda templates, action tracking, attendee management, and auto-generated meeting minutes.",
    icon: ClipboardList,
  },
  {
    title: "Mobile & Offline (PWA)",
    description: "Progressive web app with offline sync, camera integration for evidence capture, and digital signatures. Works on any device without app store downloads.",
    icon: Smartphone,
  },
  {
    title: "Training Records & Competency",
    description: "Track employee training by 16 SA statutory categories (first aid, heights, scaffolding, crane, etc.) with certificate expiry alerts, SAQA unit standards, NQF levels, and a visual competency matrix.",
    icon: GraduationCap,
  },
  {
    title: "Compliance Obligations",
    description: "Track Section 37(2) agreements, water use licences, AELs, COIDA, tax clearance, CIDB grading, and B-BBEE certificates with automated expiry alerts and vendor notifications.",
    icon: FileCheck2,
  },
  {
    title: "SHE File Generator",
    description: "Generate an 18-section Safety, Health & Environment file per OHS Act 85/1993 and Construction Regulations 2014. Compiled on-demand from your existing ConformEdge data.",
    icon: HardHat,
  },
  {
    title: "B-BBEE Scorecard",
    description: "Element-by-element B-BBEE tracking per Amended Codes of Good Practice. 5-element scorecard, EME/QSE/Generic classification, priority sub-minimum checks, and recognition % calculation.",
    icon: Award,
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
  {
    title: "Advanced Incident & Safety Management",
    subtitle: "SA Regulatory Compliance",
    description: "Complete SHEQ incident lifecycle from reporting through investigation to closure — built for SA regulatory compliance.",
    bullets: [
      "COIDA W.Cl.2 and SAPS 277 statutory PDFs pre-filled from incident data",
      "MHSA Section 11, 23, 24 forms for mine-regulated companies",
      "Interactive fishbone (Ishikawa) root cause analysis diagrams",
      "LTIFR calculation with monthly trend charts",
      "Investigation sign-off workflow for serious incidents",
      "Multiple CAPA linking per incident with junction tracking",
      "Witness statements, evidence gallery with R2 storage",
      "COIDA CSV export for annual returns",
    ],
    imageAlt: "Incident management dashboard",
  },
  {
    title: "Work Permits & Equipment Lifecycle",
    subtitle: "Operational Safety",
    description: "Manage permit-to-work processes and equipment assets from a single platform.",
    bullets: [
      "7 permit types with configurable checklists and approval workflows",
      "Equipment register with auto-generated asset numbers (EQ-001)",
      "Calibration tracking with certificate upload and overdue alerts",
      "Maintenance scheduling — routine, preventive, corrective, overhaul",
      "Repair history with supplier tracking and CAPA escalation",
      "13 pre-built Work Record Card templates for lifting equipment",
      "Equipment dashboard widget with real-time status overview",
    ],
    imageAlt: "Work permits and equipment management",
  },
  {
    title: "Partner Program & White-Label",
    subtitle: "Scale Your Practice",
    description: "Scale your ISO consulting practice with ConformEdge as your technology platform.",
    bullets: [
      "Consulting Partner: Manage multiple client organisations from one dashboard",
      "White-Label Partner: Your branding, your domain, our technology",
      "Referral Partner: Earn 10% commission on referred clients (Year 1)",
      "Flat per-client billing — transparent, predictable pricing",
      "Cross-org insights and compliance benchmarking",
      "Dedicated partner support and co-marketing opportunities",
    ],
    imageAlt: "Partner program dashboard",
  },
] as const

export const METRICS = [
  { value: 15, suffix: "", label: "Compliance Frameworks", prefix: "" },
  { value: 534, suffix: "+", label: "Sub-Clauses Tracked", prefix: "" },
  { value: 85, suffix: "%", label: "Faster Audit Prep", prefix: "" },
  { value: 40, suffix: "+", label: "Integrated Modules", prefix: "" },
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
    description: "For small businesses getting started with SHEQ compliance.",
    features: [
      "3 users included (+R399/additional user)",
      "2 compliance frameworks",
      "1,000 documents",
      "50 AI classifications/month",
      "Assessments & checklists",
      "CAPAs & gap analysis",
      "Basic incident reporting",
      "Calendar & scheduling",
      "Email support (48h SLA)",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    monthlyPrice: 5499,
    description: "For safety-conscious companies managing compliance and incidents.",
    features: [
      "5 users included (+R449/additional user)",
      "5 compliance frameworks",
      "Unlimited documents",
      "200 AI classifications/month",
      "Full incident management + COIDA forms",
      "Evidence & photo uploads",
      "MHSA statutory reporting",
      "Witness statements & LTIFR",
      "IMS cross-standard mapping",
      "Objectives & KPI tracking",
      "Work permits (all 7 types)",
      "Equipment & asset management",
      "Training records & competency matrix",
      "SHE file generator (18 sections)",
      "B-BBEE scorecard tracking",
      "Custom form builder",
      "Management reviews",
      "Investigation sign-off workflow",
      "COIDA / MHSA statutory forms",
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
      "10 users included (+R349/additional user)",
      "All 15 frameworks (incl. OHS Act, NEMA, NWA, Carbon Tax)",
      "500 AI classifications/month",
      "Everything in Professional",
      "Training records & competency matrix",
      "SHE file generator (18 sections)",
      "B-BBEE scorecard tracking",
      "SA statutory forms (W.Cl.2, SAPS 277)",
      "Vendor compliance portal",
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
      "20 users included (+R299/additional user)",
      "2,000 AI classifications/month",
      "Everything in Business",
      "Multi-site hierarchy (corporate/division/site)",
      "Corporate dashboard (cross-site LTIFR, compliance)",
      "Compliance obligations tracking",
      "Environmental monitoring",
      "SSO & advanced security",
      "Full API access (read/write)",
      "Custom integrations",
      "Dedicated account manager",
      "4h response SLA",
      "Remote onboarding & training sessions",
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
  { credits: 5000, price: 749, perCredit: 0.1498 },
]

export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Standards", href: "#standards" },
    { label: "Security", href: "#features" },
  ],
  company: [
    { label: "About ISU Tech", href: "https://isutech.co.za" },
    { label: "Contact", href: "mailto:nhlanhla@isutech.co.za" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
  ],
} as const
