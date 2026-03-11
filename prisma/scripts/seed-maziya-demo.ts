/**
 * Maziya Service Group — Demo Seed Data
 *
 * Replaces generic demo data with Maziya-specific scenarios covering:
 * - 5 Projects (PRASA signalling, substations, mining rehab, civil, building)
 * - 20+ Documents with AI classifications across 5 standards
 * - 7 Incidents across 3 regions (WC, KZN, Gauteng)
 * - 7 Work Permits (all 7 types)
 * - 5 Objectives with measurements
 * - 1 Management Review with Maziya-specific agenda
 * - 8 CAPAs linked to incidents and audits
 * - 7 Subcontractors (construction, electrical, mining)
 * - 6 Assessments (completed + scheduled)
 * - 3 Checklist Templates + instances
 * - 1 Audit Pack
 * - 60+ Audit Trail events
 *
 * Usage:
 *   npx tsx prisma/scripts/seed-maziya-demo.ts
 *
 * Idempotent — checks for sentinel project before running.
 */

import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SENTINEL_PROJECT = "PRASA Western Cape Re-Signalling"
const TARGET_ORG = process.env.SEED_ORG_NAME || "ConformEdge Systems"

// ── Helpers ──────────────────────────────────────────────────────────

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

function daysAgo(n: number): Date {
  return daysFromNow(-n)
}

type StandardWithClauses = {
  id: string
  code: string
  clauses: { id: string; clauseNumber: string }[]
}

function findClause(standards: StandardWithClauses[], code: string, clauseNum: string) {
  const std = standards.find((s) => s.code === code)
  if (!std) throw new Error(`Standard ${code} not found`)
  let clause = std.clauses.find((c) => c.clauseNumber === clauseNum)
  if (!clause) {
    const parent = clauseNum.split(".")[0]
    clause = std.clauses.find((c) => c.clauseNumber === parent)
  }
  if (!clause) throw new Error(`Clause ${code} ${clauseNum} not found`)
  return { standardId: std.id, clauseId: clause.id }
}

function findStandard(standards: StandardWithClauses[], code: string) {
  const std = standards.find((s) => s.code === code)
  if (!std) throw new Error(`Standard ${code} not found`)
  return std
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 Finding active organization and owner...")

  // Find org by name — defaults to "ConformEdge Systems" on production
  // Override with SEED_ORG_NAME env var for other environments
  let orgUser = await prisma.organizationUser.findFirst({
    where: {
      role: "OWNER",
      isActive: true,
      organization: { name: TARGET_ORG },
    },
    include: { organization: true, user: true },
  })
  if (!orgUser) {
    // Fallback: find any active OWNER (for dev/local environments)
    orgUser = await prisma.organizationUser.findFirst({
      where: { role: "OWNER", isActive: true },
      include: { organization: true, user: true },
      orderBy: { createdAt: "desc" },
    })
    if (!orgUser) throw new Error("No active organization with an OWNER found")
    console.log(`  ⚠️  Org "${TARGET_ORG}" not found, using "${orgUser.organization.name}" instead`)
  }

  const org = orgUser.organization
  const owner = orgUser.user
  const orgId = org.id
  const userId = owner.id

  console.log(`  Org: ${org.name} (${orgId})`)
  console.log(`  Owner: ${owner.firstName} ${owner.lastName} (${userId})`)

  // Idempotency guard
  const existing = await prisma.project.findFirst({
    where: { organizationId: orgId, name: SENTINEL_PROJECT },
  })
  if (existing) {
    console.log("⚠️  Maziya demo data already seeded. Delete manually to re-seed.")
    process.exit(0)
  }

  // Load standards with clauses
  const rawStandards = await prisma.standard.findMany({
    include: { clauses: { select: { id: true, clauseNumber: true } } },
  })
  const standards: StandardWithClauses[] = rawStandards.map((s) => ({
    id: s.id,
    code: s.code,
    clauses: s.clauses,
  }))

  const iso9001 = findStandard(standards, "ISO9001")
  const iso14001 = findStandard(standards, "ISO14001")
  const iso45001 = findStandard(standards, "ISO45001")

  // Optional standards — may not exist in all environments
  let dmreMhsa: StandardWithClauses | null = null
  let popia: StandardWithClauses | null = null
  try { dmreMhsa = findStandard(standards, "DMRE_MHSA") } catch { /* skip */ }
  try { popia = findStandard(standards, "POPIA") } catch { /* skip */ }

  // ════════════════════════════════════════════════════════════════════
  // STEP 1: Projects
  // ════════════════════════════════════════════════════════════════════

  console.log("\n📁 Creating Maziya projects...")

  const [prasa_wc, prasa_kzn, substations_gp, mining_rehab, civil_kzn] = await Promise.all([
    prisma.project.create({
      data: {
        name: SENTINEL_PROJECT,
        description:
          "Thales-Maziya consortium: modernisation of signalling across 46 stations and 250 km of passenger rail in the Western Cape, including new Cape Town Train Traffic Control Centre.",
        status: "COMPLETED",
        startDate: daysAgo(365),
        endDate: daysAgo(30),
        organizationId: orgId,
      },
    }),
    prisma.project.create({
      data: {
        name: "PRASA PTCS Signalling — KwaZulu-Natal",
        description:
          "European Train Control System (ETCS Level 2) design, installation, testing and commissioning. New interlocking systems, centralised traffic control, and civil works.",
        status: "ACTIVE",
        startDate: daysAgo(120),
        endDate: daysFromNow(240),
        organizationId: orgId,
      },
    }),
    prisma.project.create({
      data: {
        name: "PRASA Traction Substations — Gauteng",
        description:
          "3kV DC traction substation reconstruction from Langlaagte to Maraisburg. Traction and distribution equipment refurbishment from Naledi to New Canada.",
        status: "ACTIVE",
        startDate: daysAgo(90),
        endDate: daysFromNow(180),
        organizationId: orgId,
      },
    }),
    prisma.project.create({
      data: {
        name: "Mining Rehabilitation — Mpumalanga",
        description:
          "Asbestos site restoration and mine rehabilitation programme. Environmental remediation and ground stability assessment across 3 former mining sites.",
        status: "ACTIVE",
        startDate: daysAgo(60),
        endDate: daysFromNow(300),
        organizationId: orgId,
      },
    }),
    prisma.project.create({
      data: {
        name: "Bulk Water Infrastructure — eThekwini",
        description:
          "Sewer reticulation and bulk water pipeline installation for eThekwini Metropolitan Municipality. 12 km pipeline route with 6 river crossings.",
        status: "ACTIVE",
        startDate: daysAgo(45),
        endDate: daysFromNow(200),
        organizationId: orgId,
      },
    }),
  ])
  console.log("  ✅ 5 projects created")

  // ════════════════════════════════════════════════════════════════════
  // STEP 2: Documents + Classifications
  // ════════════════════════════════════════════════════════════════════

  console.log("\n📄 Creating documents with classifications...")

  type DocDef = {
    title: string
    status: "DRAFT" | "PENDING_REVIEW" | "APPROVED"
    projectId: string
    description: string
    expiresAt?: Date
    classifications?: { code: string; clause: string; confidence: number }[]
  }

  const docDefs: DocDef[] = [
    // ── ISO 9001 Quality ──
    {
      title: "Integrated Quality Policy",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "Maziya Group quality policy aligned with ISO 9001:2015, covering all 6 divisions.",
      classifications: [
        { code: "ISO9001", clause: "5.2", confidence: 0.95 },
        { code: "ISO9001", clause: "5.1", confidence: 0.88 },
      ],
    },
    {
      title: "Document Control Procedure — IMS",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "Integrated document control procedure applicable across ISO 9001, 14001, and 45001.",
      classifications: [
        { code: "ISO9001", clause: "7.5", confidence: 0.92 },
        { code: "ISO14001", clause: "7.5", confidence: 0.87 },
        { code: "ISO45001", clause: "7.5", confidence: 0.86 },
      ],
    },
    {
      title: "Internal Audit Procedure",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "Procedure for planning and conducting internal audits across all ISO management systems.",
      classifications: [{ code: "ISO9001", clause: "9.2", confidence: 0.93 }],
    },
    {
      title: "Management Review Minutes — Q4 2025",
      status: "APPROVED",
      projectId: prasa_wc.id,
      description: "Minutes from Q4 2025 management review covering audit findings, KPI performance, and resource planning.",
      classifications: [{ code: "ISO9001", clause: "9.3", confidence: 0.91 }],
    },
    {
      title: "Risk & Opportunity Register — PRASA Projects",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "Consolidated risk register covering operational, safety, and commercial risks across all PRASA contracts.",
      classifications: [{ code: "ISO9001", clause: "6.1", confidence: 0.89 }],
    },
    {
      title: "Supplier Evaluation Procedure",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "Evaluation and approval procedure for subcontractors and suppliers on PRASA projects.",
      classifications: [{ code: "ISO9001", clause: "8.4", confidence: 0.87 }],
    },
    // ── ISO 14001 Environmental ──
    {
      title: "Environmental Management Policy",
      status: "APPROVED",
      projectId: mining_rehab.id,
      description: "Environmental policy covering construction activities, mining rehabilitation, and waste management.",
      classifications: [{ code: "ISO14001", clause: "5.2", confidence: 0.94 }],
    },
    {
      title: "Environmental Aspects & Impacts Register",
      status: "APPROVED",
      projectId: mining_rehab.id,
      description: "Register of significant environmental aspects and impacts for all construction and mining activities.",
      classifications: [{ code: "ISO14001", clause: "6.1.2", confidence: 0.90 }],
    },
    {
      title: "Waste Management Plan — Mpumalanga Sites",
      status: "APPROVED",
      projectId: mining_rehab.id,
      description: "Waste segregation, handling, and disposal plan for mining rehabilitation sites including asbestos waste.",
      classifications: [{ code: "ISO14001", clause: "8.1", confidence: 0.88 }],
    },
    // ── ISO 45001 OHS ──
    {
      title: "OHS Policy — All Divisions",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "Occupational health and safety policy applicable to all Maziya Service Group divisions and project sites.",
      classifications: [{ code: "ISO45001", clause: "5.2", confidence: 0.95 }],
    },
    {
      title: "Hazard Identification & Risk Assessment — Rail Signalling",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "HIRA for ETCS Level 2 signalling installation including electrical, confined space, and working at heights hazards.",
      classifications: [{ code: "ISO45001", clause: "6.1.2", confidence: 0.92 }],
    },
    {
      title: "Emergency Preparedness Plan — Construction Sites",
      status: "APPROVED",
      projectId: substations_gp.id,
      description: "Emergency response procedures for all construction sites including electrical emergencies, structural collapse, and fire.",
      classifications: [{ code: "ISO45001", clause: "8.2", confidence: 0.91 }],
    },
    {
      title: "Safety Management Plan — 3kV Substations",
      status: "APPROVED",
      projectId: substations_gp.id,
      description: "Comprehensive safety management plan for 3kV DC traction substation reconstruction work in Gauteng.",
      classifications: [{ code: "ISO45001", clause: "8.1", confidence: 0.93 }],
    },
    {
      title: "PPE Requirements Matrix — All Sites",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "Personal protective equipment requirements per work zone, activity type, and risk level.",
      classifications: [{ code: "ISO45001", clause: "8.1.2", confidence: 0.87 }],
    },
    {
      title: "Incident Investigation Procedure",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "Procedure for investigating and reporting workplace incidents, including 5-Whys methodology and statutory reporting requirements.",
      classifications: [{ code: "ISO45001", clause: "10.2", confidence: 0.90 }],
    },
    {
      title: "Training Records Q1 2026",
      status: "PENDING_REVIEW",
      projectId: prasa_kzn.id,
      expiresAt: daysFromNow(14),
      description: "Competency and training records for Q1 2026 — pending review before archive.",
    },
    // ── DMRE/MHSA Mining ──
    {
      title: "Mine Health and Safety Policy",
      status: "APPROVED",
      projectId: mining_rehab.id,
      description: "H&S policy for mining rehabilitation division aligned with MHSA Act 29 of 1996.",
      classifications: dmreMhsa ? [{ code: "DMRE_MHSA", clause: "2.6", confidence: 0.92 }] : [],
    },
    {
      title: "Competency Register — Mining Personnel",
      status: "APPROVED",
      projectId: mining_rehab.id,
      description: "Register of competent persons for mining operations as required by MHSA Section 2.5.",
      classifications: dmreMhsa ? [{ code: "DMRE_MHSA", clause: "2.5", confidence: 0.89 }] : [],
    },
    {
      title: "Code of Practice — Ground Control",
      status: "APPROVED",
      projectId: mining_rehab.id,
      description: "Mandatory code of practice for ground control and slope stability at rehabilitation sites.",
      classifications: dmreMhsa ? [{ code: "DMRE_MHSA", clause: "6.3", confidence: 0.88 }] : [],
    },
    {
      title: "Occupational Health Surveillance Records — Q1 2026",
      status: "APPROVED",
      projectId: mining_rehab.id,
      description: "Medical surveillance records for workers exposed to asbestos, dust, and noise at mining sites.",
      classifications: dmreMhsa ? [{ code: "DMRE_MHSA", clause: "2.7", confidence: 0.86 }] : [],
    },
    // ── POPIA ──
    {
      title: "Employee Privacy Policy",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "Privacy policy for processing personal information of employees and contractors under POPIA.",
      classifications: popia ? [{ code: "POPIA", clause: "2.1", confidence: 0.90 }] : [],
    },
    {
      title: "Data Processing Impact Assessment",
      status: "APPROVED",
      projectId: prasa_kzn.id,
      description: "DPIA for ConformEdge platform processing of employee safety records and contractor certification data.",
      classifications: popia ? [{ code: "POPIA", clause: "8.2", confidence: 0.87 }] : [],
    },
    {
      title: "Breach Notification Procedure",
      status: "DRAFT",
      projectId: prasa_kzn.id,
      description: "Procedure for handling security compromises involving personal information under POPIA Section 22.",
    },
    // ── Unclassified (for live demo) ──
    {
      title: "Method Statement — ETCS Level 2 Installation",
      status: "DRAFT",
      projectId: prasa_kzn.id,
      description: "Method statement for European Train Control System installation — ready for live AI classification demo.",
    },
  ]

  const documents: { id: string; title: string }[] = []
  for (const def of docDefs) {
    const doc = await prisma.document.create({
      data: {
        title: def.title,
        description: def.description,
        status: def.status,
        projectId: def.projectId,
        organizationId: orgId,
        uploadedById: userId,
        expiresAt: def.expiresAt,
        fileType: "application/pdf",
      },
    })
    documents.push({ id: doc.id, title: doc.title })

    if (def.classifications) {
      for (const cls of def.classifications) {
        try {
          const { clauseId } = findClause(standards, cls.code, cls.clause)
          await prisma.documentClassification.create({
            data: {
              documentId: doc.id,
              standardClauseId: clauseId,
              confidence: cls.confidence,
              isVerified: cls.confidence >= 0.9,
            },
          })
        } catch {
          // Skip if clause not found (DMRE/POPIA may not be fully seeded)
        }
      }
    }
  }
  console.log(`  ✅ ${documents.length} documents created with classifications`)

  // ════════════════════════════════════════════════════════════════════
  // STEP 3: Assessments
  // ════════════════════════════════════════════════════════════════════

  console.log("\n📋 Creating assessments...")

  // Completed: ISO 45001 internal audit — Gauteng substations
  const auditGauteng = await prisma.assessment.create({
    data: {
      title: "ISO 45001 Internal Audit — Traction Substations Gauteng",
      description: "Internal OHS audit of 3kV DC substation reconstruction work. Focus: electrical safety, PTW compliance, contractor oversight.",
      scheduledDate: daysAgo(21),
      completedDate: daysAgo(18),
      overallScore: 78,
      riskLevel: "HIGH",
      organizationId: orgId,
      projectId: substations_gp.id,
      assessorId: userId,
      standardId: iso45001.id,
    },
  })

  // Questions + answers for completed audit
  const auditQuestions = [
    { q: "Are all workers inducted and competent for 3kV electrical work?", g: "Clause 7.2 — Competence: workers shall be competent on the basis of education, training, or experience", score: 72 },
    { q: "Are work permits issued and closed correctly for all high-risk activities?", g: "Clause 8.1 — Operational planning: processes needed to meet OHS requirements", score: 85 },
    { q: "Is the lockout/tagout (LOTO) procedure followed for substation isolation?", g: "Clause 8.1.2 — Eliminating hazards and reducing OHS risks: hierarchy of controls", score: 65 },
    { q: "Are emergency preparedness drills conducted at substation sites?", g: "Clause 8.2 — Emergency preparedness: test planned response actions periodically", score: 80 },
    { q: "Are subcontractor safety certifications current and verified?", g: "Clause 8.4 — Procurement: ensure externally provided processes are controlled", score: 75 },
    { q: "Are incident investigations completed within required timeframes?", g: "Clause 10.2 — Incident, nonconformity and corrective action", score: 88 },
  ]

  for (let i = 0; i < auditQuestions.length; i++) {
    const q = await prisma.assessmentQuestion.create({
      data: {
        question: auditQuestions[i].q,
        guidance: auditQuestions[i].g,
        sortOrder: i + 1,
        assessmentId: auditGauteng.id,
      },
    })
    await prisma.assessmentAnswer.create({
      data: {
        answer: auditQuestions[i].score >= 80 ? "Conforming" : auditQuestions[i].score >= 70 ? "Observation" : "Minor Non-conformity",
        score: auditQuestions[i].score,
        evidence: "Evidence reviewed during site visit at Langlaagte substation",
        questionId: q.id,
        answeredById: userId,
      },
    })
  }

  // Completed: ISO 9001 quality audit — KZN signalling
  const auditKznQuality = await prisma.assessment.create({
    data: {
      title: "ISO 9001 Quality Audit — PTCS Signalling KZN",
      description: "Internal quality audit of ETCS Level 2 installation. Focus: documentation, supplier control, nonconformity management.",
      scheduledDate: daysAgo(35),
      completedDate: daysAgo(32),
      overallScore: 85,
      riskLevel: "MEDIUM",
      organizationId: orgId,
      projectId: prasa_kzn.id,
      assessorId: userId,
      standardId: iso9001.id,
    },
  })

  // Completed: ISO 14001 environmental audit — Mining
  await prisma.assessment.create({
    data: {
      title: "ISO 14001 Environmental Audit — Mining Rehabilitation",
      description: "Environmental management system audit at Mpumalanga rehabilitation sites. Focus: waste management, dust suppression, water quality.",
      scheduledDate: daysAgo(14),
      completedDate: daysAgo(11),
      overallScore: 72,
      riskLevel: "HIGH",
      organizationId: orgId,
      projectId: mining_rehab.id,
      assessorId: userId,
      standardId: iso14001.id,
    },
  })

  // Scheduled: upcoming assessments
  const auditUpcoming1 = await prisma.assessment.create({
    data: {
      title: "ISO 45001 Surveillance Audit — All Sites",
      description: "Annual surveillance audit covering all active construction and mining sites. External auditor visit.",
      scheduledDate: daysFromNow(14),
      organizationId: orgId,
      projectId: prasa_kzn.id,
      assessorId: userId,
      standardId: iso45001.id,
    },
  })

  await prisma.assessment.create({
    data: {
      title: "ISO 9001 Stage 2 Certification — eThekwini",
      description: "Stage 2 certification audit for bulk water infrastructure project quality management system.",
      scheduledDate: daysFromNow(45),
      organizationId: orgId,
      projectId: civil_kzn.id,
      assessorId: userId,
      standardId: iso9001.id,
    },
  })

  await prisma.assessment.create({
    data: {
      title: "DMRE Compliance Inspection — Mpumalanga",
      description: "Regulatory compliance inspection by Department of Mineral Resources and Energy for mining rehabilitation sites.",
      scheduledDate: daysFromNow(30),
      organizationId: orgId,
      projectId: mining_rehab.id,
      assessorId: userId,
      standardId: dmreMhsa ? dmreMhsa.id : iso45001.id,
    },
  })
  console.log("  ✅ 6 assessments created (3 completed, 3 scheduled)")

  // ════════════════════════════════════════════════════════════════════
  // STEP 4: CAPAs
  // ════════════════════════════════════════════════════════════════════

  console.log("\n⚠️  Creating CAPAs...")

  type CapaDef = {
    title: string
    description: string
    type: "CORRECTIVE" | "PREVENTIVE"
    status: "OPEN" | "IN_PROGRESS" | "VERIFICATION" | "CLOSED"
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    projectId: string
    dueDate: Date
    closedDate?: Date
    rootCause?: string
    clauseLinks: { code: string; clause: string }[]
    actions: { description: string; isCompleted: boolean; dueDate: Date; completedDate?: Date }[]
  }

  const capaDefs: CapaDef[] = [
    {
      title: "LOTO Procedure Non-Compliance — Langlaagte Substation",
      description:
        "Internal audit found 3kV isolation procedure not consistently followed during substation refurbishment. 2 instances of work starting before LOTO verification was complete.",
      type: "CORRECTIVE",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      projectId: substations_gp.id,
      dueDate: daysFromNow(10),
      rootCause: "Experienced electricians bypassing LOTO steps due to perceived time pressure. Shift supervisors not enforcing pre-work verification.",
      clauseLinks: [
        { code: "ISO45001", clause: "8.1.2" },
        { code: "ISO45001", clause: "8.1" },
      ],
      actions: [
        { description: "Retrain all electrical teams on LOTO procedure (mandatory attendance)", isCompleted: true, dueDate: daysAgo(5), completedDate: daysAgo(3) },
        { description: "Install physical LOTO lock stations at each substation isolation point", isCompleted: false, dueDate: daysFromNow(5) },
        { description: "Implement mandatory photo evidence of LOTO pins before work start", isCompleted: false, dueDate: daysFromNow(10) },
      ],
    },
    {
      title: "Scaffolding Inspection Gaps — Western Cape Signal Boxes",
      description:
        "Post-incident investigation (scaffolding collapse) revealed scaffolding inspection records incomplete for 3 of 8 signal box sites.",
      type: "CORRECTIVE",
      status: "VERIFICATION",
      priority: "HIGH",
      projectId: prasa_wc.id,
      dueDate: daysFromNow(7),
      rootCause: "Scaffolding inspection checklist not enforced as prerequisite before worker access. Site-specific checklists varied in quality.",
      clauseLinks: [
        { code: "ISO45001", clause: "8.1" },
        { code: "ISO9001", clause: "8.5" },
      ],
      actions: [
        { description: "Standardise scaffolding inspection checklist across all WC sites", isCompleted: true, dueDate: daysAgo(10), completedDate: daysAgo(8) },
        { description: "Retag all scaffolding with colour-coded inspection indicators", isCompleted: true, dueDate: daysAgo(7), completedDate: daysAgo(5) },
        { description: "Conduct unannounced spot checks for 4 weeks to verify compliance", isCompleted: false, dueDate: daysFromNow(7) },
      ],
    },
    {
      title: "Subcontractor Welding Cert Lapse — KZN PTCS",
      description:
        "Two subcontractor welders found on-site with expired SAIW certifications. Work stopped immediately. Certs had expired 3 weeks prior.",
      type: "CORRECTIVE",
      status: "OPEN",
      priority: "HIGH",
      projectId: prasa_kzn.id,
      dueDate: daysFromNow(14),
      rootCause: "No automated tracking of subcontractor certification expiry. Manual spreadsheet tracking missed renewal dates.",
      clauseLinks: [
        { code: "ISO45001", clause: "8.4" },
        { code: "ISO9001", clause: "8.4" },
      ],
      actions: [
        { description: "Onboard all subcontractors onto ConformEdge portal for self-service cert upload", isCompleted: false, dueDate: daysFromNow(7) },
        { description: "Configure automated expiry alerts (30-day and 7-day reminders)", isCompleted: false, dueDate: daysFromNow(10) },
        { description: "Verify all active subcontractor certifications and update register", isCompleted: false, dueDate: daysFromNow(14) },
      ],
    },
    {
      title: "Dust Suppression Failure — Mpumalanga Mining Site",
      description:
        "Environmental audit found dust suppression system non-operational for 4 days. Dust readings exceeded 10mg/m³ occupational exposure limit on 2 days.",
      type: "CORRECTIVE",
      status: "OPEN",
      priority: "CRITICAL",
      projectId: mining_rehab.id,
      dueDate: daysFromNow(7),
      clauseLinks: [
        { code: "ISO14001", clause: "8.1" },
        ...(dmreMhsa ? [{ code: "DMRE_MHSA", clause: "6.1" }] : []),
      ],
      actions: [
        { description: "Repair dust suppression water supply line", isCompleted: true, dueDate: daysAgo(2), completedDate: daysAgo(1) },
        { description: "Install backup dust monitoring alert system (real-time threshold alerts)", isCompleted: false, dueDate: daysFromNow(5) },
        { description: "Schedule occupational health assessment for exposed workers", isCompleted: false, dueDate: daysFromNow(7) },
      ],
    },
    {
      title: "Waste Segregation Non-Compliance — Rehabilitation Sites",
      description:
        "Asbestos-contaminated waste mixed with general construction waste at Site B. Immediate containment measures implemented.",
      type: "CORRECTIVE",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      projectId: mining_rehab.id,
      dueDate: daysFromNow(5),
      rootCause: "New labourers not briefed on asbestos handling procedures. Hazardous waste signage inadequate.",
      clauseLinks: [
        { code: "ISO14001", clause: "8.1" },
        { code: "ISO14001", clause: "6.1.2" },
        ...(dmreMhsa ? [{ code: "DMRE_MHSA", clause: "2.7" }] : []),
      ],
      actions: [
        { description: "Re-segregate all waste at Site B with certified asbestos handler", isCompleted: true, dueDate: daysAgo(3), completedDate: daysAgo(2) },
        { description: "Install multilingual hazardous waste signage (English, Zulu, Sotho)", isCompleted: false, dueDate: daysFromNow(3) },
        { description: "Mandatory asbestos awareness training for all site workers", isCompleted: false, dueDate: daysFromNow(5) },
      ],
    },
    {
      title: "Document Control — Outdated Method Statements",
      description:
        "3 method statements on KZN site using superseded revisions. Document control register not updated after January design changes.",
      type: "CORRECTIVE",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      projectId: prasa_kzn.id,
      dueDate: daysFromNow(14),
      rootCause: "Document control register not updated after design revision in January 2026.",
      clauseLinks: [
        { code: "ISO9001", clause: "7.5" },
        { code: "ISO14001", clause: "7.5" },
      ],
      actions: [
        { description: "Update document control register with all current revisions", isCompleted: true, dueDate: daysAgo(3), completedDate: daysAgo(2) },
        { description: "Distribute updated method statements to all KZN site managers", isCompleted: false, dueDate: daysFromNow(7) },
        { description: "Conduct refresher training on document control procedure", isCompleted: false, dueDate: daysFromNow(14) },
      ],
    },
    {
      title: "Emergency Drill Deficiency — eThekwini Pipeline",
      description:
        "No emergency evacuation drill conducted in first 45 days of civil works project. ISO 45001 requires drills within 30 days of project start.",
      type: "PREVENTIVE",
      status: "OPEN",
      priority: "MEDIUM",
      projectId: civil_kzn.id,
      dueDate: daysFromNow(10),
      clauseLinks: [{ code: "ISO45001", clause: "8.2" }],
      actions: [
        { description: "Schedule emergency drill for all pipeline route sections", isCompleted: false, dueDate: daysFromNow(5) },
        { description: "Brief all workers on muster points and emergency contacts", isCompleted: false, dueDate: daysFromNow(7) },
      ],
    },
    {
      title: "Risk Assessment Review — Annual Update",
      description:
        "Annual risk assessment review completed proactively ahead of ISO 45001 surveillance audit. Updated for 2026 project portfolio.",
      type: "PREVENTIVE",
      status: "CLOSED",
      priority: "LOW",
      projectId: prasa_kzn.id,
      dueDate: daysAgo(7),
      closedDate: daysAgo(5),
      rootCause: "Scheduled review — proactive update for new projects added in 2026.",
      clauseLinks: [
        { code: "ISO9001", clause: "6.1" },
        { code: "ISO45001", clause: "6.1" },
      ],
      actions: [
        { description: "Review and update consolidated risk register for all active projects", isCompleted: true, dueDate: daysAgo(10), completedDate: daysAgo(8) },
        { description: "Present updated risk register to management review", isCompleted: true, dueDate: daysAgo(7), completedDate: daysAgo(5) },
      ],
    },
  ]

  const capaRecords: { id: string; title: string }[] = []
  for (const def of capaDefs) {
    const capa = await prisma.capa.create({
      data: {
        title: def.title,
        description: def.description,
        type: def.type,
        status: def.status,
        priority: def.priority,
        rootCause: def.rootCause,
        dueDate: def.dueDate,
        closedDate: def.closedDate,
        organizationId: orgId,
        projectId: def.projectId,
        raisedById: userId,
        assignedToId: userId,
      },
    })
    capaRecords.push({ id: capa.id, title: capa.title })

    for (const action of def.actions) {
      await prisma.capaAction.create({
        data: {
          description: action.description,
          dueDate: action.dueDate,
          isCompleted: action.isCompleted,
          completedDate: action.completedDate,
          capaId: capa.id,
          assignedToId: userId,
        },
      })
    }

    for (const link of def.clauseLinks) {
      try {
        const { clauseId } = findClause(standards, link.code, link.clause)
        await prisma.capaStandardClause.create({
          data: { capaId: capa.id, standardClauseId: clauseId },
        })
      } catch { /* skip missing clauses */ }
    }
  }
  console.log(`  ✅ ${capaDefs.length} CAPAs created with actions and clause links`)

  // ════════════════════════════════════════════════════════════════════
  // STEP 5: Incidents
  // ════════════════════════════════════════════════════════════════════

  console.log("\n🚨 Creating incidents...")

  // Link scaffolding incident to CAPA
  const scaffoldingCapa = capaRecords.find((c) => c.title.includes("Scaffolding"))

  const incidents = [
    // 1. Scaffolding collapse — WC (HIGH, with 5-Whys)
    {
      title: "Scaffolding collapse — Cape Town Signal Box 7",
      incidentType: "PROPERTY_DAMAGE" as const,
      severity: "HIGH" as const,
      status: "CORRECTIVE_ACTION" as const,
      incidentDate: daysAgo(18),
      location: "Cape Town Signal Box 7, Platform Level 3 — Western Cape",
      description:
        "A 6m section of scaffolding on the north face of Signal Box 7 collapsed during 65 km/h wind gusts. Equipment and cabling damaged. Two workers evacuated safely via stairwell B — no injuries.",
      immediateAction: "Area cordoned off (50m radius). All workers evacuated. Site manager and PRASA safety officer notified. Crane mobilised for debris removal.",
      rootCause: "Wind bracing not installed per manufacturer specification. Scaffolding erected by subcontractor without site-specific wind assessment.",
      rootCauseData: {
        method: "5-whys",
        category: "method",
        whys: [
          { question: "Why did the scaffolding collapse?", answer: "Inadequate wind bracing on the north face exposure" },
          { question: "Why was wind bracing inadequate?", answer: "Scaffolding was erected without site-specific wind assessment for coastal conditions" },
          { question: "Why was no wind assessment done?", answer: "Subcontractor followed standard inland spec, not adjusted for Cape Town wind exposure" },
          { question: "Why wasn't the spec adjusted?", answer: "No pre-erection engineering review required by current PTW checklist" },
          { question: "Why isn't engineering review on the checklist?", answer: "PTW checklist was generic — not updated for coastal/high-wind sites" },
        ],
        rootCause: "PTW checklist for scaffolding lacked site-specific engineering review requirement for high-wind exposure zones",
        containmentAction: "All scaffolding on WC sites suspended until engineering review completed. Emergency bracing installed on remaining structures.",
      },
      projectId: prasa_wc.id,
      capaId: scaffoldingCapa?.id,
    },
    // 2. Electrical shock — Gauteng (HIGH)
    {
      title: "Electrical shock — Langlaagte Traction Substation",
      incidentType: "MEDICAL" as const,
      severity: "HIGH" as const,
      status: "INVESTIGATING" as const,
      incidentDate: daysAgo(8),
      location: "Langlaagte Traction Substation, Bay 3 — Gauteng",
      injuredParty: "Sipho Ndlovu (Electrician Grade A, Thabiso Electrical)",
      witnesses: "Bongani Dlamini (Site Supervisor), Peter Mokoena (Safety Officer)",
      description:
        "Subcontractor electrician received 380V shock while testing relay panel in Bay 3. LOTO procedure had been initiated but secondary circuit not isolated. Worker conscious and responsive, transported to Milpark Hospital.",
      immediateAction: "Power isolated to entire Bay 3. First aider administered treatment. Ambulance called. LOTO procedure audit initiated for all active bays.",
      rootCause: "Secondary 380V control circuit not included in LOTO isolation plan. Isolation procedure only covered primary 3kV circuit.",
      projectId: substations_gp.id,
    },
    // 3. Crane near-miss — KZN (MEDIUM)
    {
      title: "Near-miss: crane load shift during signalling mast lift",
      incidentType: "NEAR_MISS" as const,
      severity: "MEDIUM" as const,
      status: "CORRECTIVE_ACTION" as const,
      incidentDate: daysAgo(12),
      location: "PTCS Corridor, Station 14 — KwaZulu-Natal",
      description:
        "During installation of 12m signalling mast, the 800kg load shifted 15° during lift. Rigging sling showed signs of wear. No personnel in drop zone. Lift aborted and rescheduled.",
      immediateAction: "Lift operations suspended. All rigging equipment inspected. Worn sling removed from service. Rigger and crane operator retrained.",
      rootCause: "Pre-lift rigging inspection did not identify worn sling. Inspection checklist not completed — verbal sign-off only.",
      projectId: prasa_kzn.id,
    },
    // 4. Fall from height near-miss — WC (MEDIUM)
    {
      title: "Near-miss: unsecured harness at signal tower",
      incidentType: "NEAR_MISS" as const,
      severity: "MEDIUM" as const,
      status: "CLOSED" as const,
      incidentDate: daysAgo(25),
      closedDate: daysAgo(15),
      location: "Signal Tower 12, Cape Town Metrorail — Western Cape",
      description:
        "Worker observed climbing signal tower without securing fall arrest harness to anchor point. Height: approximately 8 metres. Stopped by spotter before ascending further.",
      immediateAction: "Worker immediately descended. Verbal warning issued. Toolbox talk conducted for entire crew on fall arrest requirements.",
      rootCause: "Worker cited time pressure to complete task before track occupation window closed. Supervision gap during shift changeover.",
      projectId: prasa_wc.id,
    },
    // 5. Environmental — Mining (MEDIUM)
    {
      title: "Environmental: dust exceedance at Mine Site B",
      incidentType: "ENVIRONMENTAL" as const,
      severity: "MEDIUM" as const,
      status: "CORRECTIVE_ACTION" as const,
      incidentDate: daysAgo(6),
      location: "Rehabilitation Site B, Pit 4 — Mpumalanga",
      description:
        "Ambient dust monitoring recorded 14.2 mg/m³ at Pit 4 boundary (limit: 10 mg/m³). Dust suppression system offline due to water supply line failure. Lasted approximately 4 hours before repair.",
      immediateAction: "Workers issued N95 respirators. Water tanker deployed for manual dust suppression. DMRE inspector notified as required.",
      rootCause: "Aging water supply line burst. No redundant supply available. Monitoring system flagged exceedance 2 hours after onset.",
      projectId: mining_rehab.id,
    },
    // 6. First aid — KZN (LOW)
    {
      title: "First aid: minor cut during cable termination",
      incidentType: "FIRST_AID" as const,
      severity: "LOW" as const,
      status: "CLOSED" as const,
      incidentDate: daysAgo(15),
      closedDate: daysAgo(14),
      location: "Equipment Room, Station 8 — KwaZulu-Natal",
      injuredParty: "David Mthembu (Cable Technician)",
      description:
        "Technician sustained a 3cm cut on left hand while stripping cable insulation with utility knife. First aid administered on-site. No stitches required.",
      immediateAction: "Wound cleaned and bandaged by first aider. Incident recorded. Worker returned to duties after 15-minute rest period.",
      rootCause: "Cut-resistant gloves not worn during cable stripping activity. PPE matrix requires Level 3 cut-resistant gloves for all cable work.",
      projectId: prasa_kzn.id,
    },
    // 7. Property damage — Gauteng (LOW)
    {
      title: "Vehicle struck barrier at substation access road",
      incidentType: "PROPERTY_DAMAGE" as const,
      severity: "LOW" as const,
      status: "CLOSED" as const,
      incidentDate: daysAgo(20),
      closedDate: daysAgo(17),
      location: "Naledi Substation access road — Gauteng",
      description:
        "Delivery truck reversed into concrete barrier at substation entrance. Barrier cracked, truck tailgate dented. No injuries. Driver error — no spotter present for reversing manoeuvre.",
      immediateAction: "Barrier taped off and scheduled for replacement. Driver required to complete reversing awareness refresher. Incident logged.",
      rootCause: "No reversing spotter assigned. Site traffic management plan not enforced for delivery vehicles.",
      projectId: substations_gp.id,
    },
  ]

  for (const inc of incidents) {
    await prisma.incident.create({
      data: {
        title: inc.title,
        incidentType: inc.incidentType,
        severity: inc.severity,
        status: inc.status,
        incidentDate: inc.incidentDate,
        location: inc.location,
        injuredParty: inc.injuredParty,
        witnesses: inc.witnesses,
        description: inc.description,
        immediateAction: inc.immediateAction,
        rootCause: inc.rootCause,
        rootCauseData: inc.rootCauseData ?? undefined,
        closedDate: inc.closedDate,
        projectId: inc.projectId,
        capaId: inc.capaId,
        reportedById: userId,
        organizationId: orgId,
      },
    })
  }
  console.log(`  ✅ ${incidents.length} incidents created (1 with 5-Whys RCA)`)

  // ════════════════════════════════════════════════════════════════════
  // STEP 6: Work Permits (all 7 types)
  // ════════════════════════════════════════════════════════════════════

  console.log("\n🛡️  Creating work permits...")

  // 1. HOT_WORK — Active (MIG welding on signalling structure)
  const hotWorkPermit = await prisma.workPermit.create({
    data: {
      title: "Hot Work — MIG Welding on Signalling Mast Brackets",
      permitNumber: "MZY-PTW-001",
      permitType: "HOT_WORK",
      status: "ACTIVE",
      riskLevel: "HIGH",
      location: "PTCS Corridor, Station 14 — KwaZulu-Natal",
      description: "MIG welding of steel mounting brackets for ETCS signalling equipment. Work at 6m elevation on prepared platforms. Duration: 3 days.",
      hazardsIdentified: "Fire risk from sparks and molten metal\nBurns from hot surfaces and UV radiation\nFume inhalation (welding fumes in semi-enclosed structure)\nFalling objects from height\nElectric shock from welding equipment",
      precautions: "Fire blankets deployed below work area\nFire extinguisher (CO2) within 5m\nSpotter assigned for duration of all welding\nAll combustibles removed from 10m radius\nPortable fume extraction unit positioned at work face",
      ppeRequirements: "Welding helmet with auto-darkening lens (shade 10-13)\nFlame-resistant coveralls (cotton, no synthetic)\nWelding gauntlets\nSafety boots with metatarsal guards\nFall arrest harness (attached to overhead anchor)\nRespirator with P2 filter",
      emergencyProcedures: "Fire: Activate nearest fire alarm, use CO2 extinguisher if safe. Evacuate via stairwell B.\nBurn: Cool with running water 20 minutes, call first aider (ext 555).\nFall: Do not move injured person, call emergency services 10111.\nAssembly point: Station 14 car park.",
      validFrom: daysAgo(1),
      validTo: daysFromNow(2),
      approvedAt: daysAgo(1),
      activatedAt: daysAgo(1),
      requestedById: userId,
      issuedById: userId,
      projectId: prasa_kzn.id,
      organizationId: orgId,
    },
  })
  await prisma.workPermitChecklist.createMany({
    data: [
      { permitId: hotWorkPermit.id, description: "Area cleared of combustible materials (10m radius)", isChecked: true, sortOrder: 0, checkedById: userId, checkedAt: daysAgo(1) },
      { permitId: hotWorkPermit.id, description: "CO2 fire extinguisher positioned within 5m", isChecked: true, sortOrder: 1, checkedById: userId, checkedAt: daysAgo(1) },
      { permitId: hotWorkPermit.id, description: "Fire watch spotter assigned and briefed", isChecked: true, sortOrder: 2, checkedById: userId, checkedAt: daysAgo(1) },
      { permitId: hotWorkPermit.id, description: "Welding equipment inspected, earthed, and cables intact", isChecked: false, sortOrder: 3 },
      { permitId: hotWorkPermit.id, description: "Gas cylinders secured upright with chain restraint", isChecked: false, sortOrder: 4 },
      { permitId: hotWorkPermit.id, description: "Welder SAIW certification verified (current)", isChecked: true, sortOrder: 5, checkedById: userId, checkedAt: daysAgo(1) },
    ],
  })

  // 2. ELECTRICAL — Pending Approval (3kV substation isolation)
  const electricalPermit = await prisma.workPermit.create({
    data: {
      title: "Electrical Isolation — 3kV Traction Substation Bay 5",
      permitNumber: "MZY-PTW-002",
      permitType: "ELECTRICAL",
      status: "PENDING_APPROVAL",
      riskLevel: "CRITICAL",
      location: "Langlaagte Traction Substation, Bay 5 — Gauteng",
      description: "Full isolation of 3kV DC traction supply for circuit breaker replacement in Bay 5. LOTO procedure with 6-point isolation. Estimated duration: 8 hours. Rail traffic impact: Langlaagte–Maraisburg section.",
      hazardsIdentified: "Electrocution risk (3,000V DC traction supply)\nArc flash (potential 40kA fault current)\nStored energy in capacitor banks\nConfined working space in switchgear room\nRail traffic proximity during isolation setup",
      precautions: "6-point LOTO isolation with personal locks per worker\nVoltage verified dead at each isolation point (live-line tester)\nEarthing straps applied after de-energisation\nBarrier tape around live equipment boundaries\nPRASA rail operations notified 48 hours in advance",
      ppeRequirements: "Arc flash suit (Category 4, 40 cal/cm²)\nInsulated gloves (Class 2, tested within 6 months)\nInsulated safety boots\nFull face shield with arc-rated visor\nHard hat with chin strap\nEarth fault detector (personal)",
      emergencyProcedures: "Electrocution: DO NOT touch victim if still in contact with source. Isolate supply first. Call 10111 and site emergency ext 999.\nArc flash: Treat burns with sterile dressing. Do not remove clothing fused to skin. Call ambulance.\nDe-energisation failure: Abort all work. Evacuate switchgear room. Notify PRASA control room.",
      validFrom: daysFromNow(1),
      validTo: daysFromNow(2),
      requestedById: userId,
      projectId: substations_gp.id,
      organizationId: orgId,
    },
  })
  await prisma.workPermitChecklist.createMany({
    data: [
      { permitId: electricalPermit.id, description: "LOTO isolation plan reviewed and signed by all parties", isChecked: false, sortOrder: 0 },
      { permitId: electricalPermit.id, description: "All 6 isolation points identified and labelled", isChecked: false, sortOrder: 1 },
      { permitId: electricalPermit.id, description: "Personal locks issued to each worker (minimum 4)", isChecked: false, sortOrder: 2 },
      { permitId: electricalPermit.id, description: "Voltage verified dead with calibrated live-line tester", isChecked: false, sortOrder: 3 },
      { permitId: electricalPermit.id, description: "Earthing straps applied and verified", isChecked: false, sortOrder: 4 },
      { permitId: electricalPermit.id, description: "PRASA rail operations notified and track possession confirmed", isChecked: false, sortOrder: 5 },
      { permitId: electricalPermit.id, description: "Arc flash PPE inspected and fitted for all personnel", isChecked: false, sortOrder: 6 },
    ],
  })

  // 3. CONFINED_SPACE — Active (culvert inspection, KZN)
  await prisma.workPermit.create({
    data: {
      title: "Confined Space Entry — Storm Water Culvert, PTCS Route",
      permitNumber: "MZY-PTW-003",
      permitType: "CONFINED_SPACE",
      status: "ACTIVE",
      riskLevel: "CRITICAL",
      location: "Culvert crossing at km 42.3, PTCS Corridor — KwaZulu-Natal",
      description: "Entry into 1.8m diameter storm water culvert for structural integrity inspection prior to cable routing. Two-person team with standby rescue at both portals.",
      hazardsIdentified: "Oxygen deficiency (standing water, organic decomposition)\nToxic gas accumulation (H₂S from sewage cross-contamination)\nFlash flooding (recent rains)\nStructural collapse (age-related degradation)\nLimited egress (single entry point, 85m length)",
      precautions: "Continuous 4-gas atmospheric monitoring (O₂, CO, H₂S, LEL)\nStandby rescue team at entry portal with winch\nCommunication check every 10 minutes\nWeather forecast confirmed — no rain within 6 hours\nForced ventilation fan running 30 minutes before entry",
      ppeRequirements: "Self-contained breathing apparatus (SCBA) — 60 min cylinders\nFull body harness with retrieval line\nHard hat with integral headlamp\nWaterproof boots (steel toe)\nPersonal gas detector with audible alarm",
      emergencyProcedures: "DO NOT enter to rescue without SCBA.\nActivate rescue winch at entry portal.\nCall emergency services: 10111\nSite emergency: ext 999\nFlood warning: Evacuate immediately via entry portal.",
      validFrom: daysAgo(0),
      validTo: daysFromNow(1),
      approvedAt: daysAgo(0),
      activatedAt: daysAgo(0),
      requestedById: userId,
      issuedById: userId,
      projectId: prasa_kzn.id,
      organizationId: orgId,
    },
  })

  // 4. WORKING_AT_HEIGHTS — Closed (signal tower antenna, WC)
  await prisma.workPermit.create({
    data: {
      title: "Working at Heights — Signal Tower Antenna Installation",
      permitNumber: "MZY-PTW-004",
      permitType: "WORKING_AT_HEIGHTS",
      status: "CLOSED",
      riskLevel: "HIGH",
      location: "Signal Tower 12, Cape Town Metrorail — Western Cape",
      description: "Installation of GSM-R antenna array at 25m height on existing signal tower. Crane-assisted lift of equipment modules. 2-person crew.",
      hazardsIdentified: "Fall from height (25m)\nDropped objects (antenna modules, tools)\nWind exposure at elevation\nCrane proximity hazard",
      precautions: "Full body harness with twin-tail lanyard (100% tie-off)\nTool tethering for all hand tools\nExclusion zone 10m radius at base\nWind limit: suspend work above 40 km/h",
      ppeRequirements: "Full body harness with shock absorber\nHard hat with chin strap\nSafety glasses\nSteel-toe boots\nHi-vis vest",
      emergencyProcedures: "Fall: Activate rescue plan (tower rescue kit at base). Call 10111.\nDropped object: Sound horn, evacuate exclusion zone.\nAssembly: Station car park.",
      validFrom: daysAgo(14),
      validTo: daysAgo(10),
      approvedAt: daysAgo(14),
      activatedAt: daysAgo(14),
      closedAt: daysAgo(10),
      closureNotes: "Antenna installation completed successfully over 3 working days. No incidents. Fall protection 100% compliant throughout. Equipment tested and commissioned.",
      requestedById: userId,
      issuedById: userId,
      projectId: prasa_wc.id,
      organizationId: orgId,
    },
  })

  // 5. LIFTING — Pending Approval (signalling mast, KZN)
  const liftingPermit = await prisma.workPermit.create({
    data: {
      title: "Lifting Operations — Signalling Mast Installation",
      permitNumber: "MZY-PTW-005",
      permitType: "LIFTING",
      status: "PENDING_APPROVAL",
      riskLevel: "HIGH",
      location: "PTCS Corridor, Station 16 — KwaZulu-Natal",
      description: "Mobile crane lift of 12m signalling mast (800kg) and equipment cabinet (350kg). Tandem lift using 50-ton mobile crane. Track possession required.",
      hazardsIdentified: "Load drop (mast: 800kg at 12m height)\nCrane tip-over (ground bearing capacity)\nEntanglement with overhead catenary\nOverhead power line proximity\nRail traffic (track possession window)",
      precautions: "Lift plan approved by appointed lifting machinery inspector\nGround bearing survey completed (pad load calculations)\nMinimum 6m clearance from catenary maintained\nSpotter assigned with direct radio link to crane operator\nExclusion zone 1.5× boom radius",
      ppeRequirements: "Hard hat with chin strap\nHi-vis vest (Class 2)\nSafety boots (steel toe)\nGloves (rigger)\nSafety glasses",
      emergencyProcedures: "Load drop: Sound alarm, evacuate exclusion zone. Do not approach dropped load.\nCrane failure: Crane operator lowers load to ground. Evacuate if hydraulic failure suspected.\nContact with catenary: Do NOT touch crane. Notify Eskom/PRASA to isolate.",
      validFrom: daysFromNow(3),
      validTo: daysFromNow(4),
      requestedById: userId,
      projectId: prasa_kzn.id,
      organizationId: orgId,
    },
  })
  await prisma.workPermitChecklist.createMany({
    data: [
      { permitId: liftingPermit.id, description: "Crane load test certificate current (within 12 months)", isChecked: false, sortOrder: 0 },
      { permitId: liftingPermit.id, description: "Crane operator certificate of competency verified", isChecked: false, sortOrder: 1 },
      { permitId: liftingPermit.id, description: "Lift plan signed by appointed lifting machinery inspector", isChecked: false, sortOrder: 2 },
      { permitId: liftingPermit.id, description: "Ground bearing capacity confirmed at crane setup position", isChecked: false, sortOrder: 3 },
      { permitId: liftingPermit.id, description: "Rigging equipment inspected (slings, shackles, chain blocks)", isChecked: false, sortOrder: 4 },
      { permitId: liftingPermit.id, description: "Track possession confirmed with PRASA operations", isChecked: false, sortOrder: 5 },
    ],
  })

  // 6. EXCAVATION — Active (fibre-optic cable trench, eThekwini)
  await prisma.workPermit.create({
    data: {
      title: "Excavation — Fibre-Optic Cable Trench, River Crossing 3",
      permitNumber: "MZY-PTW-006",
      permitType: "EXCAVATION",
      status: "ACTIVE",
      riskLevel: "HIGH",
      location: "Pipeline Route km 8.4, River Crossing 3 — eThekwini",
      description: "1.2m deep trench excavation for fibre-optic cable duct alongside bulk water pipeline. 200m section through mixed clay/rock near river bank. TLB and hand excavation.",
      hazardsIdentified: "Trench collapse (clay soil near river, water table high)\nUnderground utility strike (Eskom cables, Telkom fibre)\nFlood risk (proximity to river bank)\nPlant/pedestrian interface (TLB operations near public road)",
      precautions: "Trench shoring installed for all excavations >1m deep\nUtility locate scan (CAT scanner) before breaking ground\nCall-before-you-dig confirmation from Eskom and Telkom\nBattered sides at 1:1 slope where shoring not practical\nDewatering pump on standby",
      ppeRequirements: "Hard hat\nHi-vis vest\nSafety boots (steel toe)\nGloves\nSafety glasses",
      emergencyProcedures: "Trench collapse: Do NOT enter trench. Call emergency services 10111. Begin surface rescue.\nUtility strike (gas/electric): Evacuate 50m. Call Eskom 0860 037 566.\nFlooding: Evacuate trench immediately. Move to high ground.",
      validFrom: daysAgo(3),
      validTo: daysFromNow(4),
      approvedAt: daysAgo(3),
      activatedAt: daysAgo(3),
      requestedById: userId,
      issuedById: userId,
      projectId: civil_kzn.id,
      organizationId: orgId,
    },
  })

  // 7. GENERAL — Closed (site establishment, Mining)
  await prisma.workPermit.create({
    data: {
      title: "General — Site Establishment & Mobilisation",
      permitNumber: "MZY-PTW-007",
      permitType: "GENERAL",
      status: "CLOSED",
      riskLevel: "MEDIUM",
      location: "Rehabilitation Site B, Main Camp — Mpumalanga",
      description: "Site establishment including temporary fencing, site office installation, chemical toilet placement, and access road grading for mining rehabilitation project.",
      hazardsIdentified: "Plant/pedestrian interface during grading\nManual handling of site office modules\nDust generation from access road preparation\nAsbestos-contaminated ground (historical mining area)",
      precautions: "Asbestos clearance survey completed before ground disturbance\nWet suppression during grading\nTraffic management plan for plant movements\nManual handling risk assessment for office modules",
      ppeRequirements: "Hard hat\nHi-vis vest\nDust mask (P2)\nSafety boots\nGloves",
      emergencyProcedures: "Standard site emergency procedures. Muster point: Site entrance gate.",
      validFrom: daysAgo(55),
      validTo: daysAgo(45),
      approvedAt: daysAgo(55),
      activatedAt: daysAgo(55),
      closedAt: daysAgo(45),
      closureNotes: "Site establishment complete. All temporary infrastructure operational. Access road graded. Asbestos survey clear for camp area. DMRE inspector satisfied.",
      requestedById: userId,
      issuedById: userId,
      projectId: mining_rehab.id,
      organizationId: orgId,
    },
  })

  console.log("  ✅ 7 work permits created (all 7 types represented)")

  // ════════════════════════════════════════════════════════════════════
  // STEP 7: Objectives
  // ════════════════════════════════════════════════════════════════════

  console.log("\n🎯 Creating objectives...")

  const now = new Date()
  const twoMonthsAgo = new Date(now); twoMonthsAgo.setMonth(now.getMonth() - 2)
  const oneMonthAgo = new Date(now); oneMonthAgo.setMonth(now.getMonth() - 1)
  const sixMonthsFromNow = new Date(now); sixMonthsFromNow.setMonth(now.getMonth() + 6)

  // 1. Reduce incident rate (ISO 45001)
  const obj1 = await prisma.objective.create({
    data: {
      title: "Reduce site incident rate by 30%",
      description: "Target a 30% reduction in reportable incidents across all construction and mining sites by end of Q4 2026. Baseline: Q4 2025 average of 4.2 incidents/month.",
      targetValue: 30,
      currentValue: 12,
      unit: "%",
      measurementFrequency: "MONTHLY",
      status: "ACTIVE",
      standardId: iso45001.id,
      ownerId: userId,
      organizationId: orgId,
      dueDate: sixMonthsFromNow,
    },
  })
  await prisma.objectiveMeasurement.createMany({
    data: [
      { value: 5, notes: "January baseline — 4 incidents across 5 sites", objectiveId: obj1.id, recordedById: userId, measuredAt: twoMonthsAgo },
      { value: 8, notes: "February — safety training rollout for all site supervisors", objectiveId: obj1.id, recordedById: userId, measuredAt: oneMonthAgo },
      { value: 12, notes: "March — 12% reduction achieved. Scaffolding incident in WC offset KZN improvement.", objectiveId: obj1.id, recordedById: userId, measuredAt: now },
    ],
  })

  // 2. Work permit closure compliance (ISO 45001)
  const obj2 = await prisma.objective.create({
    data: {
      title: "Achieve 100% work permit closure within 48 hours",
      description: "All work permits to be formally closed within 48 hours of work completion. Currently experiencing delays of 3-5 days on average.",
      targetValue: 100,
      currentValue: 82,
      unit: "%",
      measurementFrequency: "MONTHLY",
      status: "ACTIVE",
      standardId: iso45001.id,
      ownerId: userId,
      organizationId: orgId,
      dueDate: new Date(now.getFullYear(), now.getMonth() + 4, now.getDate()),
    },
  })
  await prisma.objectiveMeasurement.createMany({
    data: [
      { value: 65, notes: "January — 65% closed within 48h. Major gaps in WC and Gauteng sites.", objectiveId: obj2.id, recordedById: userId, measuredAt: twoMonthsAgo },
      { value: 74, notes: "February — improved after digital PTW system training", objectiveId: obj2.id, recordedById: userId, measuredAt: oneMonthAgo },
      { value: 82, notes: "March — 82% closure compliance. KZN at 95%, WC at 70% (improvement needed)", objectiveId: obj2.id, recordedById: userId, measuredAt: now },
    ],
  })

  // 3. Subcontractor certification compliance (ISO 9001)
  const obj3 = await prisma.objective.create({
    data: {
      title: "Maintain 95% subcontractor certification compliance",
      description: "All active subcontractors to maintain current and verified safety, competency, and insurance certifications. Self-service portal rollout in progress.",
      targetValue: 95,
      currentValue: 78,
      unit: "%",
      measurementFrequency: "MONTHLY",
      status: "ACTIVE",
      standardId: iso9001.id,
      ownerId: userId,
      organizationId: orgId,
      dueDate: new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()),
    },
  })
  await prisma.objectiveMeasurement.createMany({
    data: [
      { value: 62, notes: "January — baseline. 38% of subcontractors have at least one expired cert.", objectiveId: obj3.id, recordedById: userId, measuredAt: twoMonthsAgo },
      { value: 71, notes: "February — portal invites sent. 12 subcontractors onboarded.", objectiveId: obj3.id, recordedById: userId, measuredAt: oneMonthAgo },
      { value: 78, notes: "March — 78% compliant. 5 certs still pending renewal (welding, crane ops).", objectiveId: obj3.id, recordedById: userId, measuredAt: now },
    ],
  })

  // 4. Checklist completion (ISO 9001)
  const obj4 = await prisma.objective.create({
    data: {
      title: "Achieve 95% checklist completion rate",
      description: "Ensure all scheduled compliance checklists (weekly safety, monthly equipment, environmental) are completed on time across all sites.",
      targetValue: 95,
      currentValue: 72,
      unit: "%",
      measurementFrequency: "MONTHLY",
      status: "ACTIVE",
      standardId: iso9001.id,
      ownerId: userId,
      organizationId: orgId,
      dueDate: new Date(now.getFullYear(), now.getMonth() + 4, now.getDate()),
    },
  })
  await prisma.objectiveMeasurement.createMany({
    data: [
      { value: 58, notes: "February — first month of digital checklists. Low adoption on mining sites.", objectiveId: obj4.id, recordedById: userId, measuredAt: oneMonthAgo },
      { value: 72, notes: "March — 72% after mobile app training. Gauteng leading at 85%.", objectiveId: obj4.id, recordedById: userId, measuredAt: now },
    ],
  })

  // 5. Environmental compliance — mining (ISO 14001)
  const obj5 = await prisma.objective.create({
    data: {
      title: "Zero environmental non-conformities at mining sites",
      description: "Achieve and maintain zero environmental NCRs at Mpumalanga rehabilitation sites. Focus areas: dust control, waste segregation, water quality.",
      targetValue: 0,
      currentValue: 2,
      unit: "NCRs",
      measurementFrequency: "MONTHLY",
      status: "ACTIVE",
      standardId: iso14001.id,
      ownerId: userId,
      organizationId: orgId,
      dueDate: sixMonthsFromNow,
    },
  })
  await prisma.objectiveMeasurement.createMany({
    data: [
      { value: 4, notes: "January — 4 NCRs (dust exceedance x2, waste segregation x1, water quality x1)", objectiveId: obj5.id, recordedById: userId, measuredAt: twoMonthsAgo },
      { value: 3, notes: "February — 3 NCRs. Water quality issue resolved. Dust suppression upgraded.", objectiveId: obj5.id, recordedById: userId, measuredAt: oneMonthAgo },
      { value: 2, notes: "March — 2 NCRs remaining (dust exceedance, asbestos waste segregation). CAPAs in progress.", objectiveId: obj5.id, recordedById: userId, measuredAt: now },
    ],
  })

  console.log("  ✅ 5 objectives created with measurements")

  // ════════════════════════════════════════════════════════════════════
  // STEP 8: Management Review
  // ════════════════════════════════════════════════════════════════════

  console.log("\n📋 Creating management review...")

  const review = await prisma.managementReview.create({
    data: {
      title: "Q1 2026 Management Review — All Divisions",
      reviewDate: daysAgo(3),
      location: "Boardroom, 56 3rd Avenue, Johannesburg",
      status: "IN_PROGRESS",
      meetingMinutes:
        "Meeting opened at 09:00 by CEO. Reviewed Q4 2025 audit findings across all ISO standards. " +
        "Discussed incident trends (7 incidents Q1 including scaffolding collapse in WC). " +
        "Reviewed subcontractor compliance status — 5 certs pending renewal. " +
        "Mining division environmental performance reviewed — 2 active NCRs. " +
        "Action items assigned for LOTO procedure update, subcontractor portal rollout, and environmental monitoring upgrade.",
      nextReviewDate: daysFromNow(90),
      facilitatorId: userId,
      createdById: userId,
      organizationId: orgId,
    },
  })

  // Link all 3 core standards + DMRE if available
  const reviewStandards = [iso9001.id, iso14001.id, iso45001.id]
  if (dmreMhsa) reviewStandards.push(dmreMhsa.id)
  await prisma.managementReviewStandard.createMany({
    data: reviewStandards.map((sid) => ({ reviewId: review.id, standardId: sid })),
  })

  await prisma.managementReviewAttendee.create({
    data: { reviewId: review.id, userId },
  })

  await prisma.managementReviewAgendaItem.createMany({
    data: [
      {
        reviewId: review.id,
        type: "AUDIT_RESULTS",
        title: "Q4 2025 Internal Audit Findings — All Standards",
        notes: "ISO 45001 Gauteng audit: 78/100, 2 minor NCRs (LOTO procedure, competency records). ISO 9001 KZN audit: 85/100, 1 observation (document control). ISO 14001 mining: 72/100, 1 major NCR (dust suppression).",
        sortOrder: 1,
      },
      {
        reviewId: review.id,
        type: "INCIDENT_TRENDS",
        title: "Incident Analysis — Multi-Site Q1 2026",
        notes: "7 incidents across 3 regions: WC (2 — scaffolding, harness), KZN (2 — crane, cable cut), Gauteng (2 — electrical shock, vehicle), Mining (1 — dust). HIGH severity: 2 (scaffolding, electrical). Lost time: 0. Root cause themes: procedure non-compliance (4/7), equipment condition (2/7), supervision gap (1/7).",
        sortOrder: 2,
      },
      {
        reviewId: review.id,
        type: "CAPA_STATUS",
        title: "Open CAPA Review",
        notes: "8 CAPAs total: 3 OPEN, 3 IN_PROGRESS, 1 VERIFICATION, 1 CLOSED. 2 CRITICAL priority (LOTO non-compliance, asbestos waste segregation). Overdue: none. Next due: LOTO procedure update (10 days).",
        sortOrder: 3,
      },
      {
        reviewId: review.id,
        type: "OBJECTIVES_PERFORMANCE",
        title: "KPI Dashboard Review — Construction Metrics",
        notes: "Incident rate: 12% reduction (target 30%). PTW closure: 82% within 48h (target 100%). Subcontractor compliance: 78% (target 95%). Checklist completion: 72% (target 95%). Environmental NCRs: 2 (target 0). KZN leading on PTW compliance (95%), WC needs improvement (70%).",
        sortOrder: 4,
      },
      {
        reviewId: review.id,
        type: "RISK_OPPORTUNITIES",
        title: "Subcontractor Compliance & Supply Chain Risk",
        notes: "5 subcontractors with certs pending renewal. 1 welding cert lapse found on KZN site (CAPA raised). Opportunity: ConformEdge self-service portal rollout to all Tier 1 subcontractors by end March. Expected to reduce cert tracking admin by 60%.",
        sortOrder: 5,
      },
      {
        reviewId: review.id,
        type: "CHANGES_CONTEXT",
        title: "Regulatory Environment Updates",
        notes: "Draft Construction Regulations 2024 (published March 2025): tighter OHS file requirements effective Q3 2026. PRASA HSE strategy refresh Q2 2026. CIDB grading audit scheduled Q3 2026. DMRE inspector visit for mining sites scheduled for next month.",
        sortOrder: 6,
      },
      {
        reviewId: review.id,
        type: "RESOURCE_NEEDS",
        title: "SHEQ Staffing & Technology Investment",
        notes: "Current: 2 SHEQ officers across 5 active projects. Recommendation: 1 additional regional coordinator for KZN. ConformEdge platform adoption reducing admin overhead by estimated 30-50%. Training budget: R180K for rail-specific hazard recognition (20 staff).",
        sortOrder: 7,
      },
      {
        reviewId: review.id,
        type: "IMPROVEMENT_OPPORTUNITIES",
        title: "Digital Transformation Progress",
        notes: "ConformEdge adoption: 72% checklist completion digitally (up from 0% in Dec). AI classification: 20 documents classified in Q1. Mobile app usage on construction sites increasing. Recommendation: mandatory digital PTW for all new permits from April 2026.",
        sortOrder: 8,
      },
    ],
  })

  await prisma.managementReviewAction.createMany({
    data: [
      {
        reviewId: review.id,
        description: "Update LOTO procedure to include secondary circuit isolation for all substation work",
        status: "IN_PROGRESS",
        assigneeId: userId,
        dueDate: daysFromNow(10),
      },
      {
        reviewId: review.id,
        description: "Complete subcontractor portal rollout — all Tier 1 subcontractors onboarded by 31 March",
        status: "IN_PROGRESS",
        assigneeId: userId,
        dueDate: daysFromNow(20),
      },
      {
        reviewId: review.id,
        description: "Upgrade dust monitoring system at Mpumalanga sites (real-time threshold alerts)",
        status: "OPEN",
        assigneeId: userId,
        dueDate: daysFromNow(30),
      },
      {
        reviewId: review.id,
        description: "Schedule external ISO 45001 surveillance audit preparation meeting",
        status: "COMPLETED",
        assigneeId: userId,
        dueDate: daysAgo(1),
        completedAt: daysAgo(1),
      },
      {
        reviewId: review.id,
        description: "Recruit regional SHEQ coordinator for KwaZulu-Natal operations",
        status: "OPEN",
        assigneeId: userId,
        dueDate: daysFromNow(45),
      },
    ],
  })
  console.log("  ✅ Management review created with 8 agenda items and 5 actions")

  // ════════════════════════════════════════════════════════════════════
  // STEP 9: Subcontractors
  // ════════════════════════════════════════════════════════════════════

  console.log("\n🏗️  Creating subcontractors...")

  type SubDef = {
    name: string
    regNo: string
    bee: string
    safety: number
    tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE"
    certs: { name: string; issuedBy: string; issuedDate: Date; expiresAt: Date; status: "APPROVED" | "PENDING_REVIEW" | "REJECTED" }[]
  }

  const subDefs: SubDef[] = [
    {
      name: "Thabiso Electrical Contractors (Pty) Ltd",
      regNo: "2020/654321/07",
      bee: "Level 1",
      safety: 82,
      tier: "GOLD",
      certs: [
        { name: "CIDB Grading Certificate — Grade 5 EB", issuedBy: "CIDB", issuedDate: daysAgo(150), expiresAt: daysFromNow(215), status: "APPROVED" },
        { name: "Electrical Contractor Registration", issuedBy: "DoEL (Dept of Employment and Labour)", issuedDate: daysAgo(200), expiresAt: daysFromNow(165), status: "APPROVED" },
        { name: "Medical Fitness Certificate", issuedBy: "HealthForce SA", issuedDate: daysAgo(10), expiresAt: daysFromNow(355), status: "PENDING_REVIEW" },
      ],
    },
    {
      name: "Ngwenya Scaffolding & Rigging",
      regNo: "2018/789012/07",
      bee: "Level 3",
      safety: 65,
      tier: "BRONZE",
      certs: [
        { name: "CIDB Grading Certificate — Grade 4 SQ", issuedBy: "CIDB", issuedDate: daysAgo(200), expiresAt: daysFromNow(165), status: "APPROVED" },
        { name: "Scaffolding Erector Competency", issuedBy: "SACPCMP", issuedDate: daysAgo(400), expiresAt: daysAgo(35), status: "REJECTED" },
      ],
    },
    {
      name: "Precision Welding Services SA",
      regNo: "2019/123456/07",
      bee: "Level 2",
      safety: 91,
      tier: "GOLD",
      certs: [
        { name: "SAIW Welding Certification — MIG/TIG", issuedBy: "South African Institute of Welding", issuedDate: daysAgo(300), expiresAt: daysFromNow(10), status: "APPROVED" },
        { name: "CIDB Grading Certificate — Grade 6 ME", issuedBy: "CIDB", issuedDate: daysAgo(180), expiresAt: daysFromNow(185), status: "APPROVED" },
        { name: "Public Liability Insurance — R50M", issuedBy: "Santam", issuedDate: daysAgo(90), expiresAt: daysFromNow(275), status: "APPROVED" },
      ],
    },
    {
      name: "KZN Crane & Rigging Services",
      regNo: "2016/456789/07",
      bee: "Level 2",
      safety: 95,
      tier: "PLATINUM",
      certs: [
        { name: "Crane Operator Certificate of Competency", issuedBy: "Department of Employment and Labour", issuedDate: daysAgo(120), expiresAt: daysFromNow(245), status: "APPROVED" },
        { name: "Lifting Machinery Inspector Registration", issuedBy: "Engineering Council of SA", issuedDate: daysAgo(90), expiresAt: daysFromNow(275), status: "APPROVED" },
        { name: "Public Liability Insurance — R100M", issuedBy: "Hollard", issuedDate: daysAgo(60), expiresAt: daysFromNow(305), status: "APPROVED" },
      ],
    },
    {
      name: "EnviroRehab Solutions (Pty) Ltd",
      regNo: "2021/567890/07",
      bee: "Level 1",
      safety: 88,
      tier: "GOLD",
      certs: [
        { name: "Asbestos Removal Contractor Registration", issuedBy: "Department of Employment and Labour", issuedDate: daysAgo(180), expiresAt: daysFromNow(185), status: "APPROVED" },
        { name: "Occupational Hygiene Certificate", issuedBy: "SAIOH", issuedDate: daysAgo(90), expiresAt: daysFromNow(275), status: "APPROVED" },
        { name: "Waste Management Licence", issuedBy: "DFFE", issuedDate: daysAgo(200), expiresAt: daysFromNow(165), status: "APPROVED" },
      ],
    },
    {
      name: "ProSignal Communications",
      regNo: "2022/234567/07",
      bee: "Level 2",
      safety: 86,
      tier: "SILVER",
      certs: [
        { name: "ICASA Frequency Licence — GSM-R", issuedBy: "ICASA", issuedDate: daysAgo(150), expiresAt: daysFromNow(215), status: "APPROVED" },
        { name: "CIDB Grading Certificate — Grade 5 EP", issuedBy: "CIDB", issuedDate: daysAgo(100), expiresAt: daysFromNow(265), status: "APPROVED" },
      ],
    },
    {
      name: "Makhubu Civil Works",
      regNo: "2015/345678/07",
      bee: "Level 1",
      safety: 74,
      tier: "SILVER",
      certs: [
        { name: "CIDB Grading Certificate — Grade 7 CE", issuedBy: "CIDB", issuedDate: daysAgo(250), expiresAt: daysFromNow(115), status: "APPROVED" },
        { name: "Safety Competency Card", issuedBy: "SACPCMP", issuedDate: daysAgo(350), expiresAt: daysFromNow(15), status: "APPROVED" },
        { name: "Medical Fitness Certificate", issuedBy: "Medirite Occupational Health", issuedDate: daysAgo(30), expiresAt: daysFromNow(335), status: "PENDING_REVIEW" },
      ],
    },
  ]

  for (const def of subDefs) {
    const sub = await prisma.subcontractor.create({
      data: {
        name: def.name,
        registrationNumber: def.regNo,
        beeLevel: def.bee,
        safetyRating: def.safety,
        tier: def.tier,
        organizationId: orgId,
      },
    })
    for (const cert of def.certs) {
      await prisma.subcontractorCertification.create({
        data: {
          name: cert.name,
          issuedBy: cert.issuedBy,
          issuedDate: cert.issuedDate,
          expiresAt: cert.expiresAt,
          status: cert.status,
          reviewedAt: cert.status !== "PENDING_REVIEW" ? daysAgo(5) : undefined,
          reviewNotes:
            cert.status === "REJECTED"
              ? "Certificate expired — request renewal from subcontractor before site access permitted"
              : cert.status === "APPROVED"
                ? "Verified and accepted"
                : undefined,
          subcontractorId: sub.id,
        },
      })
    }
  }
  console.log(`  ✅ ${subDefs.length} subcontractors created with certifications`)

  // ════════════════════════════════════════════════════════════════════
  // STEP 10: Checklists
  // ════════════════════════════════════════════════════════════════════

  console.log("\n✅ Creating checklist templates and instances...")

  // Template 1: Weekly Site Safety Inspection
  const template1Items = [
    { description: "All workers wearing required PPE in designated zones", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "Fire extinguishers accessible and within service date", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "Scaffolding inspected and tagged (colour-coded)", fieldType: "BOOLEAN", fieldConfig: null },
    { description: "Ambient noise level at work area (dB)", fieldType: "NUMBER", fieldConfig: { min: 0, max: 120, unit: "dB" } },
    { description: "Overall site safety rating", fieldType: "RATING", fieldConfig: { max: 5 } },
    { description: "Housekeeping standard", fieldType: "SELECT", fieldConfig: { options: ["Excellent", "Good", "Fair", "Poor"] } },
    { description: "Emergency exits clear and signposted", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "First aid kits stocked and accessible", fieldType: "BOOLEAN", fieldConfig: null },
    { description: "Dust level reading (mg/m³)", fieldType: "NUMBER", fieldConfig: { min: 0, max: 50, unit: "mg/m³" } },
    { description: "Risk level assessment", fieldType: "SELECT", fieldConfig: { options: ["Low", "Medium", "High", "Critical"] } },
  ]

  const template1 = await prisma.checklistTemplate.create({
    data: {
      name: "Weekly Site Safety Inspection",
      description: "Standard weekly safety inspection checklist for all active construction and mining sites",
      standardId: iso45001.id,
      items: template1Items.map((item, i) => ({ description: item.description, sortOrder: i + 1, fieldType: item.fieldType, fieldConfig: item.fieldConfig })),
      organizationId: orgId,
      createdById: userId,
      isRecurring: true,
      recurrenceFrequency: "WEEKLY",
      nextDueDate: daysFromNow(3),
      defaultAssigneeId: userId,
      defaultProjectId: prasa_kzn.id,
      lastGeneratedAt: daysAgo(3),
    },
  })

  // Instance: KZN site safety inspection, IN_PROGRESS
  const checklist1 = await prisma.complianceChecklist.create({
    data: {
      title: "Weekly Site Safety Inspection — KZN PTCS, Week 10",
      description: "Site safety inspection for PTCS Signalling corridor, KwaZulu-Natal",
      status: "IN_PROGRESS",
      completionPercentage: 60,
      organizationId: orgId,
      projectId: prasa_kzn.id,
      standardId: iso45001.id,
      assignedToId: userId,
      templateId: template1.id,
    },
  })
  const cl1Responses: (null | Record<string, unknown>)[] = [
    null, null, { value: true }, { value: 78 }, { value: 4 }, { value: "Good" }, null, null, null, null,
  ]
  const cl1Compliant: (boolean | null)[] = [true, true, null, null, null, null, null, null, null, null]
  for (let i = 0; i < template1Items.length; i++) {
    await prisma.checklistItem.create({
      data: {
        description: template1Items[i].description,
        sortOrder: i + 1,
        fieldType: template1Items[i].fieldType,
        fieldConfig: template1Items[i].fieldConfig ?? undefined,
        response: cl1Responses[i] ?? undefined,
        isCompliant: cl1Compliant[i],
        checklistId: checklist1.id,
      },
    })
  }

  // Template 2: Monthly Equipment Maintenance
  const template2Items = [
    { description: "All equipment service records up to date", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "Hydraulic system pressure within spec", fieldType: "BOOLEAN", fieldConfig: null },
    { description: "Engine oil temperature (°C)", fieldType: "NUMBER", fieldConfig: { min: 0, max: 150, unit: "°C" } },
    { description: "Coolant level within normal range", fieldType: "BOOLEAN", fieldConfig: null },
    { description: "Safety guards intact on all machinery", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "Brake system test passed", fieldType: "BOOLEAN", fieldConfig: null },
    { description: "Tyre tread depth (mm)", fieldType: "NUMBER", fieldConfig: { min: 0, max: 25, unit: "mm" } },
    { description: "Operator logbook completed and signed", fieldType: "COMPLIANCE", fieldConfig: null },
  ]

  const template2 = await prisma.checklistTemplate.create({
    data: {
      name: "Monthly Equipment Maintenance Check",
      description: "Monthly inspection of heavy equipment and plant machinery across all project sites",
      standardId: iso9001.id,
      items: template2Items.map((item, i) => ({ description: item.description, sortOrder: i + 1, fieldType: item.fieldType, fieldConfig: item.fieldConfig })),
      organizationId: orgId,
      createdById: userId,
      isRecurring: true,
      recurrenceFrequency: "MONTHLY",
      nextDueDate: daysFromNow(12),
      defaultAssigneeId: userId,
      defaultProjectId: substations_gp.id,
      lastGeneratedAt: daysAgo(7),
    },
  })

  // Instance: Completed equipment check
  const checklist2 = await prisma.complianceChecklist.create({
    data: {
      title: "Monthly Equipment Maintenance Check — Gauteng Fleet, Feb 2026",
      description: "Heavy equipment inspection for Gauteng substation fleet",
      status: "COMPLETED",
      completionPercentage: 100,
      organizationId: orgId,
      projectId: substations_gp.id,
      standardId: iso9001.id,
      assignedToId: userId,
      templateId: template2.id,
    },
  })
  const cl2Responses: (null | Record<string, unknown>)[] = [null, { value: true }, { value: 87 }, { value: true }, null, { value: true }, { value: 12 }, null]
  const cl2Compliant: (boolean | null)[] = [true, null, null, null, true, null, null, true]
  for (let i = 0; i < template2Items.length; i++) {
    await prisma.checklistItem.create({
      data: {
        description: template2Items[i].description,
        sortOrder: i + 1,
        fieldType: template2Items[i].fieldType,
        fieldConfig: template2Items[i].fieldConfig ?? undefined,
        response: cl2Responses[i] ?? undefined,
        isCompliant: cl2Compliant[i],
        checklistId: checklist2.id,
      },
    })
  }

  // Template 3: Electrical Substation Pre-Start (Maziya-specific)
  const template3Items = [
    { description: "LOTO isolation plan reviewed and signed", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "All isolation points identified and locked", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "Voltage verified dead (live-line tester)", fieldType: "BOOLEAN", fieldConfig: null },
    { description: "Earthing straps applied", fieldType: "BOOLEAN", fieldConfig: null },
    { description: "Arc flash PPE inspected for all personnel", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "Capacitor bank discharge time elapsed (minutes)", fieldType: "NUMBER", fieldConfig: { min: 0, max: 60, unit: "min" } },
    { description: "Communication confirmed with PRASA control room", fieldType: "BOOLEAN", fieldConfig: null },
    { description: "Risk assessment reviewed for today's scope", fieldType: "COMPLIANCE", fieldConfig: null },
  ]

  await prisma.checklistTemplate.create({
    data: {
      name: "3kV Substation Pre-Start Safety Checklist",
      description: "Daily pre-start safety verification for all traction substation electrical work. Mandatory before any 3kV isolation.",
      standardId: iso45001.id,
      items: template3Items.map((item, i) => ({ description: item.description, sortOrder: i + 1, fieldType: item.fieldType, fieldConfig: item.fieldConfig })),
      organizationId: orgId,
      createdById: userId,
      isRecurring: false,
    },
  })

  console.log("  ✅ 3 checklist templates + 2 instances created")

  // ════════════════════════════════════════════════════════════════════
  // STEP 11: Approval Workflow + Audit Pack
  // ════════════════════════════════════════════════════════════════════

  console.log("\n🔄 Creating approval workflow and audit pack...")

  await prisma.approvalWorkflowTemplate.create({
    data: {
      name: "Document Approval Chain",
      description: "Standard 3-step approval for all controlled documents: Manager review → Admin approval → Owner sign-off",
      steps: [
        { stepOrder: 1, role: "MANAGER", label: "Manager Review" },
        { stepOrder: 2, role: "ADMIN", label: "Admin Approval" },
        { stepOrder: 3, role: "OWNER", label: "Owner Sign-off" },
      ],
      isDefault: true,
      organizationId: orgId,
      createdById: userId,
    },
  })

  await prisma.auditPack.create({
    data: {
      title: "ISO 45001 Surveillance Audit Pack — All Sites Q1 2026",
      description: "Compiled evidence pack for upcoming ISO 45001 surveillance audit. Includes policies, risk assessments, incident reports, work permits, training records, and management review minutes.",
      status: "READY",
      generatedAt: daysAgo(2),
      organizationId: orgId,
      projectId: prasa_kzn.id,
      createdById: userId,
    },
  })
  console.log("  ✅ Approval workflow template + 1 audit pack created")

  // ════════════════════════════════════════════════════════════════════
  // STEP 12: Audit Trail Events
  // ════════════════════════════════════════════════════════════════════

  console.log("\n📜 Creating audit trail events...")

  type AuditEvent = { action: string; entityType: string; entityId: string; metadata?: Record<string, unknown>; createdAt: Date }

  const auditEvents: AuditEvent[] = [
    // Project creation
    { action: "CREATE", entityType: "Project", entityId: prasa_wc.id, metadata: { name: prasa_wc.name }, createdAt: daysAgo(60) },
    { action: "CREATE", entityType: "Project", entityId: prasa_kzn.id, metadata: { name: prasa_kzn.name }, createdAt: daysAgo(55) },
    { action: "CREATE", entityType: "Project", entityId: substations_gp.id, metadata: { name: substations_gp.name }, createdAt: daysAgo(50) },
    { action: "CREATE", entityType: "Project", entityId: mining_rehab.id, metadata: { name: mining_rehab.name }, createdAt: daysAgo(45) },
    { action: "CREATE", entityType: "Project", entityId: civil_kzn.id, metadata: { name: civil_kzn.name }, createdAt: daysAgo(40) },

    // Documents — upload + classification
    { action: "CREATE", entityType: "Document", entityId: documents[0].id, metadata: { title: "Integrated Quality Policy" }, createdAt: daysAgo(38) },
    { action: "AI_CLASSIFY", entityType: "Document", entityId: documents[0].id, metadata: { title: "Integrated Quality Policy", standard: "ISO9001", clause: "5.2", confidence: 0.95 }, createdAt: daysAgo(38) },
    { action: "CREATE", entityType: "Document", entityId: documents[1].id, metadata: { title: "Document Control Procedure — IMS" }, createdAt: daysAgo(36) },
    { action: "AI_CLASSIFY", entityType: "Document", entityId: documents[1].id, metadata: { title: "Document Control Procedure — IMS", standards: ["ISO9001", "ISO14001", "ISO45001"] }, createdAt: daysAgo(36) },
    { action: "STATUS_CHANGE", entityType: "Document", entityId: documents[0].id, metadata: { from: "DRAFT", to: "APPROVED" }, createdAt: daysAgo(35) },
    { action: "STATUS_CHANGE", entityType: "Document", entityId: documents[1].id, metadata: { from: "DRAFT", to: "APPROVED" }, createdAt: daysAgo(34) },
    { action: "CREATE", entityType: "Document", entityId: documents[6].id, metadata: { title: "Environmental Management Policy" }, createdAt: daysAgo(33) },
    { action: "AI_CLASSIFY", entityType: "Document", entityId: documents[6].id, metadata: { standard: "ISO14001", confidence: 0.94 }, createdAt: daysAgo(33) },
    { action: "CREATE", entityType: "Document", entityId: documents[9].id, metadata: { title: "OHS Policy — All Divisions" }, createdAt: daysAgo(32) },
    { action: "AI_CLASSIFY", entityType: "Document", entityId: documents[9].id, metadata: { standard: "ISO45001", confidence: 0.95 }, createdAt: daysAgo(32) },
    { action: "CREATE", entityType: "Document", entityId: documents[12].id, metadata: { title: "Safety Management Plan — 3kV Substations" }, createdAt: daysAgo(30) },
    { action: "AI_CLASSIFY", entityType: "Document", entityId: documents[12].id, metadata: { standard: "ISO45001", clause: "8.1", confidence: 0.93 }, createdAt: daysAgo(30) },
    { action: "CREATE", entityType: "Document", entityId: documents[16].id, metadata: { title: "Mine Health and Safety Policy" }, createdAt: daysAgo(28) },
    { action: "AI_CLASSIFY", entityType: "Document", entityId: documents[16].id, metadata: { standard: "DMRE_MHSA", clause: "2.6", confidence: 0.92 }, createdAt: daysAgo(28) },

    // Assessments
    { action: "CREATE", entityType: "Assessment", entityId: auditKznQuality.id, metadata: { title: "ISO 9001 Quality Audit — PTCS Signalling KZN" }, createdAt: daysAgo(36) },
    { action: "COMPLETE", entityType: "Assessment", entityId: auditKznQuality.id, metadata: { score: 85 }, createdAt: daysAgo(32) },
    { action: "CREATE", entityType: "Assessment", entityId: auditGauteng.id, metadata: { title: "ISO 45001 Internal Audit — Traction Substations" }, createdAt: daysAgo(22) },
    { action: "COMPLETE", entityType: "Assessment", entityId: auditGauteng.id, metadata: { score: 78 }, createdAt: daysAgo(18) },
    { action: "CREATE", entityType: "Assessment", entityId: auditUpcoming1.id, metadata: { title: "ISO 45001 Surveillance Audit — All Sites" }, createdAt: daysAgo(10) },

    // CAPAs
    { action: "CAPA_RAISE", entityType: "CAPA", entityId: capaRecords[0].id, metadata: { title: capaRecords[0].title, priority: "CRITICAL" }, createdAt: daysAgo(19) },
    { action: "CAPA_RAISE", entityType: "CAPA", entityId: capaRecords[1].id, metadata: { title: capaRecords[1].title, priority: "HIGH" }, createdAt: daysAgo(16) },
    { action: "STATUS_CHANGE", entityType: "CAPA", entityId: capaRecords[1].id, metadata: { from: "OPEN", to: "VERIFICATION" }, createdAt: daysAgo(5) },
    { action: "CAPA_RAISE", entityType: "CAPA", entityId: capaRecords[2].id, metadata: { title: capaRecords[2].title, priority: "HIGH" }, createdAt: daysAgo(10) },
    { action: "CAPA_RAISE", entityType: "CAPA", entityId: capaRecords[3].id, metadata: { title: capaRecords[3].title, priority: "CRITICAL" }, createdAt: daysAgo(7) },
    { action: "CAPA_RAISE", entityType: "CAPA", entityId: capaRecords[4].id, metadata: { title: capaRecords[4].title, priority: "CRITICAL" }, createdAt: daysAgo(5) },
    { action: "STATUS_CHANGE", entityType: "CAPA", entityId: capaRecords[7].id, metadata: { from: "OPEN", to: "CLOSED" }, createdAt: daysAgo(5) },

    // Incidents
    { action: "CREATE", entityType: "Incident", entityId: "scaffolding", metadata: { title: "Scaffolding collapse — Cape Town Signal Box 7", severity: "HIGH" }, createdAt: daysAgo(18) },
    { action: "CREATE", entityType: "Incident", entityId: "electrical", metadata: { title: "Electrical shock — Langlaagte Substation", severity: "HIGH" }, createdAt: daysAgo(8) },
    { action: "CREATE", entityType: "Incident", entityId: "crane", metadata: { title: "Near-miss: crane load shift", severity: "MEDIUM" }, createdAt: daysAgo(12) },
    { action: "CREATE", entityType: "Incident", entityId: "harness", metadata: { title: "Near-miss: unsecured harness", severity: "MEDIUM" }, createdAt: daysAgo(25) },
    { action: "STATUS_CHANGE", entityType: "Incident", entityId: "harness", metadata: { from: "INVESTIGATING", to: "CLOSED" }, createdAt: daysAgo(15) },
    { action: "CREATE", entityType: "Incident", entityId: "dust", metadata: { title: "Dust exceedance at Mine Site B", severity: "MEDIUM" }, createdAt: daysAgo(6) },

    // Work Permits
    { action: "CREATE", entityType: "WorkPermit", entityId: hotWorkPermit.id, metadata: { title: "Hot Work — MIG Welding", permitType: "HOT_WORK" }, createdAt: daysAgo(2) },
    { action: "STATUS_CHANGE", entityType: "WorkPermit", entityId: hotWorkPermit.id, metadata: { from: "DRAFT", to: "ACTIVE" }, createdAt: daysAgo(1) },
    { action: "CREATE", entityType: "WorkPermit", entityId: electricalPermit.id, metadata: { title: "Electrical Isolation — 3kV", permitType: "ELECTRICAL" }, createdAt: daysAgo(1) },
    { action: "CREATE", entityType: "WorkPermit", entityId: liftingPermit.id, metadata: { title: "Lifting — Signalling Mast", permitType: "LIFTING" }, createdAt: daysAgo(0) },

    // Objectives
    { action: "CREATE", entityType: "Objective", entityId: obj1.id, metadata: { title: "Reduce site incident rate by 30%" }, createdAt: daysAgo(42) },
    { action: "UPDATE", entityType: "Objective", entityId: obj1.id, metadata: { measurement: "12%", notes: "March measurement recorded" }, createdAt: daysAgo(0) },
    { action: "CREATE", entityType: "Objective", entityId: obj2.id, metadata: { title: "100% work permit closure within 48h" }, createdAt: daysAgo(40) },
    { action: "CREATE", entityType: "Objective", entityId: obj3.id, metadata: { title: "95% subcontractor cert compliance" }, createdAt: daysAgo(38) },
    { action: "CREATE", entityType: "Objective", entityId: obj5.id, metadata: { title: "Zero environmental NCRs at mining sites" }, createdAt: daysAgo(35) },

    // Management Review
    { action: "CREATE", entityType: "ManagementReview", entityId: review.id, metadata: { title: "Q1 2026 Management Review" }, createdAt: daysAgo(7) },
    { action: "STATUS_CHANGE", entityType: "ManagementReview", entityId: review.id, metadata: { from: "PLANNED", to: "IN_PROGRESS" }, createdAt: daysAgo(3) },

    // Checklists
    { action: "CREATE", entityType: "Checklist", entityId: checklist1.id, metadata: { title: "Weekly Site Safety — KZN Week 10" }, createdAt: daysAgo(3) },
    { action: "COMPLETE", entityType: "Checklist", entityId: checklist2.id, metadata: { title: "Equipment Maintenance — Gauteng Feb" }, createdAt: daysAgo(7) },

    // Audit Pack
    { action: "CREATE", entityType: "AuditPack", entityId: "pack-1", metadata: { title: "ISO 45001 Surveillance Audit Pack" }, createdAt: daysAgo(2) },
    { action: "STATUS_CHANGE", entityType: "AuditPack", entityId: "pack-1", metadata: { from: "DRAFT", to: "READY" }, createdAt: daysAgo(1) },

    // Subcontractor uploads
    { action: "CERT_UPLOAD", entityType: "Subcontractor", entityId: "precision-welding", metadata: { cert: "SAIW Welding Certification", status: "APPROVED" }, createdAt: daysAgo(15) },
    { action: "CERT_UPLOAD", entityType: "Subcontractor", entityId: "thabiso-electrical", metadata: { cert: "Medical Fitness Certificate", status: "PENDING_REVIEW" }, createdAt: daysAgo(10) },
    { action: "STATUS_CHANGE", entityType: "SubcontractorCert", entityId: "ngwenya-safety", metadata: { cert: "Safety Competency Card", from: "PENDING_REVIEW", to: "REJECTED", reason: "Certificate expired" }, createdAt: daysAgo(8) },

    // Document bulk upload activity
    { action: "CREATE", entityType: "Document", entityId: documents[10].id, metadata: { title: "Hazard Identification & Risk Assessment" }, createdAt: daysAgo(27) },
    { action: "AI_CLASSIFY", entityType: "Document", entityId: documents[10].id, metadata: { standard: "ISO45001", clause: "6.1.2", confidence: 0.92 }, createdAt: daysAgo(27) },
    { action: "CREATE", entityType: "Document", entityId: documents[20].id, metadata: { title: "Employee Privacy Policy" }, createdAt: daysAgo(25) },
    { action: "AI_CLASSIFY", entityType: "Document", entityId: documents[20].id, metadata: { standard: "POPIA", clause: "2.1", confidence: 0.90 }, createdAt: daysAgo(25) },
    { action: "CREATE", entityType: "Document", entityId: documents[14].id, metadata: { title: "Incident Investigation Procedure" }, createdAt: daysAgo(24) },
    { action: "AI_CLASSIFY", entityType: "Document", entityId: documents[14].id, metadata: { standard: "ISO45001", clause: "10.2", confidence: 0.90 }, createdAt: daysAgo(24) },
  ]

  for (const evt of auditEvents) {
    await prisma.auditTrailEvent.create({
      data: {
        action: evt.action,
        entityType: evt.entityType,
        entityId: evt.entityId,
        metadata: evt.metadata,
        userId,
        organizationId: orgId,
        createdAt: evt.createdAt,
      },
    })
  }
  console.log(`  ✅ ${auditEvents.length} audit trail events created`)

  // ════════════════════════════════════════════════════════════════════
  // Done
  // ════════════════════════════════════════════════════════════════════

  console.log("\n" + "═".repeat(60))
  console.log("🎉 Maziya demo data seeded successfully!")
  console.log("═".repeat(60))
  console.log("\n📊 Summary:")
  console.log(`   Projects:        5 (PRASA WC, KZN, Substations GP, Mining, Civil)`)
  console.log(`   Documents:       ${documents.length} (with AI classifications across 5 standards)`)
  console.log(`   Assessments:     6 (3 completed, 3 scheduled)`)
  console.log(`   CAPAs:           ${capaDefs.length} (with actions + clause links)`)
  console.log(`   Incidents:       ${incidents.length} (across 3 regions, 1 with 5-Whys)`)
  console.log(`   Work Permits:    7 (all 7 types: HOT_WORK, ELECTRICAL, CONFINED_SPACE, HEIGHTS, LIFTING, EXCAVATION, GENERAL)`)
  console.log(`   Objectives:      5 (with monthly measurements + trend data)`)
  console.log(`   Management Rev:  1 (8 agenda items, 5 actions, multi-standard)`)
  console.log(`   Subcontractors:  ${subDefs.length} (with certs, tier ratings, BEE levels)`)
  console.log(`   Checklists:      3 templates + 2 instances (with custom fields)`)
  console.log(`   Audit Pack:      1 (READY status)`)
  console.log(`   Audit Trail:     ${auditEvents.length} events (spanning 60 days)`)
  console.log(`\n💡 Run the demo seed for M-Theory org separately if needed.`)
  console.log(`   Dashboard should now show populated KPIs and widgets.`)
}

main()
  .catch((e) => {
    console.error("❌ Maziya demo seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
