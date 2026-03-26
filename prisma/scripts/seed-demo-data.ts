/**
 * Seed demo data for ConformEdge sales presentations.
 *
 * Populates the existing "iSu Technologies" org with realistic
 * SA construction/mining compliance data across every major feature.
 *
 * Usage:
 *   npx tsx prisma/scripts/seed-demo-data.ts
 *
 * Idempotent — skips if demo data already exists.
 */

import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const TARGET_ORG_NAME = "iSu Technologies"
const SENTINEL_PROJECT = "Acme Construction — Triple Certification"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── Helpers ──────────────────────────────────────────────────────────

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

function daysAgo(n: number): Date {
  return daysFromNow(-n)
}

/** Find a clause by standard code + clause number, falling back to parent */
function findClause(
  standards: StandardWithClauses[],
  code: string,
  clauseNum: string,
) {
  const std = standards.find((s) => s.code === code)
  if (!std) throw new Error(`Standard ${code} not found`)
  // Try exact match first, then fall back to parent clause (e.g. "5.2" → "5")
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

type StandardWithClauses = {
  id: string
  code: string
  clauses: { id: string; clauseNumber: string }[]
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 Finding org and user...")

  const org = await prisma.organization.findFirst({
    where: { name: TARGET_ORG_NAME },
    select: { id: true, name: true },
  })
  if (!org) {
    console.error(`❌ Organization "${TARGET_ORG_NAME}" not found.`)
    process.exit(1)
  }

  // Idempotency guard
  const existing = await prisma.project.findFirst({
    where: { organizationId: org.id, name: SENTINEL_PROJECT },
  })
  if (existing) {
    console.log("⚠️  Demo data already seeded. Delete manually to re-seed.")
    process.exit(0)
  }

  // Find first OWNER/ADMIN user
  const membership = await prisma.organizationUser.findFirst({
    where: { organizationId: org.id, role: { in: ["OWNER", "ADMIN"] } },
    include: { user: true },
  })
  if (!membership) {
    console.error("❌ No OWNER/ADMIN user found in org.")
    process.exit(1)
  }
  const userId = membership.user.id
  console.log(`   Org: ${org.name} (${org.id})`)
  console.log(`   User: ${membership.user.firstName} ${membership.user.lastName} (${userId})`)

  // Load all standards with clauses
  const rawStandards = await prisma.standard.findMany({
    include: { clauses: { select: { id: true, clauseNumber: true } } },
  })
  const standards: StandardWithClauses[] = rawStandards.map((s) => ({
    id: s.id,
    code: s.code,
    clauses: s.clauses,
  }))

  // ── Step 2: Projects ─────────────────────────────────────────────

  console.log("\n📁 Creating projects...")

  const [acme, goldline, apex] = await Promise.all([
    prisma.project.create({
      data: {
        name: SENTINEL_PROJECT,
        description:
          "Triple certification initiative for Acme Construction covering ISO 9001, 14001 and 45001. Target completion Q3 2026.",
        status: "ACTIVE",
        startDate: daysAgo(90),
        endDate: daysFromNow(180),
        organizationId: org.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Goldline Mining Services — OHS Certification",
        description:
          "ISO 45001 OHS certification for Goldline Mining's surface operations in Mpumalanga.",
        status: "ACTIVE",
        startDate: daysAgo(60),
        endDate: daysFromNow(120),
        organizationId: org.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Apex Engineering — Quality & Security",
        description:
          "Combined ISO 9001 and 27001 implementation for Apex Engineering's consulting division.",
        status: "PLANNING",
        startDate: daysFromNow(14),
        endDate: daysFromNow(365),
        organizationId: org.id,
      },
    }),
  ])
  console.log(`   ✅ 3 projects created`)

  // ── Step 3: Documents + Classifications ───────────────────────────

  console.log("\n📄 Creating documents with classifications...")

  type DocDef = {
    title: string
    status: "DRAFT" | "PENDING_REVIEW" | "APPROVED"
    projectId: string
    expiresAt?: Date
    description?: string
    classifications?: { code: string; clause: string; confidence: number }[]
  }

  const docDefs: DocDef[] = [
    // Acme (9)
    {
      title: "Quality Policy",
      status: "APPROVED",
      projectId: acme.id,
      description: "Acme Construction quality policy aligned with ISO 9001:2015 clause 5.2",
      classifications: [
        { code: "ISO9001", clause: "5.2", confidence: 0.95 },
        { code: "ISO9001", clause: "5.1", confidence: 0.88 },
      ],
    },
    {
      title: "Environmental Policy",
      status: "APPROVED",
      projectId: acme.id,
      description: "Environmental management policy for Acme Construction operations",
      classifications: [{ code: "ISO14001", clause: "5.2", confidence: 0.93 }],
    },
    {
      title: "OHS Policy",
      status: "APPROVED",
      projectId: acme.id,
      description: "Occupational health and safety policy for all Acme Construction sites",
      classifications: [{ code: "ISO45001", clause: "5.2", confidence: 0.94 }],
    },
    {
      title: "Document Control Procedure",
      status: "APPROVED",
      projectId: acme.id,
      description: "Procedure for controlling documented information across the IMS",
      classifications: [
        { code: "ISO9001", clause: "7.5", confidence: 0.91 },
        { code: "ISO14001", clause: "7.5", confidence: 0.85 },
        { code: "ISO45001", clause: "7.5", confidence: 0.85 },
      ],
    },
    {
      title: "Internal Audit Procedure",
      status: "APPROVED",
      projectId: acme.id,
      description: "Procedure for planning and conducting internal audits of the QMS",
      classifications: [{ code: "ISO9001", clause: "9.2", confidence: 0.92 }],
    },
    {
      title: "Management Review Minutes — Q4 2025",
      status: "APPROVED",
      projectId: acme.id,
      description: "Minutes from the Q4 2025 management review meeting",
      classifications: [{ code: "ISO9001", clause: "9.3", confidence: 0.89 }],
    },
    {
      title: "Risk & Opportunity Register",
      status: "APPROVED",
      projectId: acme.id,
      description: "Register of risks and opportunities identified for the QMS",
      classifications: [{ code: "ISO9001", clause: "6.1", confidence: 0.87 }],
    },
    {
      title: "Emergency Preparedness Plan",
      status: "APPROVED",
      projectId: acme.id,
      description: "Emergency preparedness and response plan for construction sites",
      classifications: [{ code: "ISO45001", clause: "8.2", confidence: 0.9 }],
    },
    {
      title: "Training Records Q1 2026",
      status: "PENDING_REVIEW",
      projectId: acme.id,
      expiresAt: daysFromNow(14),
      description: "Competency and training records for Q1 2026 — pending review before archive",
    },
    // Goldline (4)
    {
      title: "Safety Management Plan",
      status: "APPROVED",
      projectId: goldline.id,
      description: "Comprehensive safety management plan for Goldline surface mining operations",
      classifications: [{ code: "ISO45001", clause: "8.1", confidence: 0.93 }],
    },
    {
      title: "Hazard Identification Register",
      status: "APPROVED",
      projectId: goldline.id,
      description: "Register of identified hazards and assessed risks for mining activities",
      classifications: [{ code: "ISO45001", clause: "6.1", confidence: 0.88 }],
    },
    {
      title: "Incident Investigation Procedure",
      status: "DRAFT",
      projectId: goldline.id,
      description: "Procedure for investigating and reporting workplace incidents and near-misses",
    },
    {
      title: "PPE Requirements Register",
      status: "APPROVED",
      projectId: goldline.id,
      description: "Personal protective equipment requirements per work zone and activity",
      classifications: [{ code: "ISO45001", clause: "8.1.2", confidence: 0.86 }],
    },
    // Apex (2)
    {
      title: "Quality Manual",
      status: "DRAFT",
      projectId: apex.id,
      description: "Draft quality manual for Apex Engineering — available for live AI classification demo",
    },
    {
      title: "Information Security Policy",
      status: "DRAFT",
      projectId: apex.id,
      description: "Draft information security policy for Apex Engineering consulting operations",
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
        organizationId: org.id,
        uploadedById: userId,
        expiresAt: def.expiresAt,
        fileType: "application/pdf",
      },
    })
    documents.push({ id: doc.id, title: doc.title })

    // Insert pre-computed classifications
    if (def.classifications) {
      for (const cls of def.classifications) {
        const { clauseId } = findClause(standards, cls.code, cls.clause)
        await prisma.documentClassification.create({
          data: {
            documentId: doc.id,
            standardClauseId: clauseId,
            confidence: cls.confidence,
            isVerified: cls.confidence >= 0.9,
          },
        })
      }
    }
  }
  console.log(`   ✅ ${documents.length} documents created with classifications`)

  // ── Step 4: Assessments ───────────────────────────────────────────

  console.log("\n📋 Creating assessments...")

  const iso9001 = findStandard(standards, "ISO9001")
  const iso45001 = findStandard(standards, "ISO45001")
  const iso14001 = findStandard(standards, "ISO14001")

  const assessment1 = await prisma.assessment.create({
    data: {
      title: "ISO 9001 Surveillance Audit — Acme Construction",
      description: "Annual surveillance audit to verify continued QMS conformity",
      scheduledDate: daysFromNow(7),
      organizationId: org.id,
      projectId: acme.id,
      assessorId: userId,
      standardId: iso9001.id,
    },
  })

  const assessment2 = await prisma.assessment.create({
    data: {
      title: "ISO 45001 Internal Audit — Goldline Mining",
      description: "Internal audit of OHS management system at Goldline surface operations",
      scheduledDate: daysAgo(14),
      completedDate: daysAgo(12),
      overallScore: 82,
      riskLevel: "MEDIUM",
      organizationId: org.id,
      projectId: goldline.id,
      assessorId: userId,
      standardId: iso45001.id,
    },
  })

  await prisma.assessment.create({
    data: {
      title: "ISO 14001 Stage 1 Audit — Acme Construction",
      description: "Stage 1 documentation review for environmental management system certification",
      scheduledDate: daysFromNow(30),
      organizationId: org.id,
      projectId: acme.id,
      assessorId: userId,
      standardId: iso14001.id,
    },
  })

  await prisma.assessment.create({
    data: {
      title: "ISO 9001 Gap Assessment — Apex Engineering",
      description: "Initial gap assessment to identify QMS readiness for Apex Engineering",
      scheduledDate: daysFromNow(45),
      organizationId: org.id,
      projectId: apex.id,
      assessorId: userId,
      standardId: iso9001.id,
    },
  })

  // Add questions + answers for the completed assessment
  const questions = [
    { q: "Is the OH&S policy communicated to all workers?", g: "Clause 5.2 — policy shall be available as documented information", score: 90 },
    { q: "Are hazard identification processes ongoing and proactive?", g: "Clause 6.1.2 — consider routine and non-routine activities", score: 85 },
    { q: "Are emergency preparedness procedures tested regularly?", g: "Clause 8.2 — organization shall periodically test planned response actions", score: 70 },
    { q: "Is worker consultation and participation documented?", g: "Clause 5.4 — establish processes for consultation and participation", score: 80 },
    { q: "Are incident investigations conducted and corrective actions tracked?", g: "Clause 10.2 — react to incidents, determine causes, take corrective action", score: 85 },
  ]

  for (let i = 0; i < questions.length; i++) {
    const q = await prisma.assessmentQuestion.create({
      data: {
        question: questions[i].q,
        guidance: questions[i].g,
        sortOrder: i + 1,
        assessmentId: assessment2.id,
      },
    })
    await prisma.assessmentAnswer.create({
      data: {
        answer: questions[i].score >= 80 ? "Conforming" : "Minor Non-conformity",
        score: questions[i].score,
        evidence: "Evidence reviewed during site visit",
        questionId: q.id,
        answeredById: userId,
      },
    })
  }
  console.log(`   ✅ 4 assessments created (1 completed with 5 questions)`)

  // ── Step 5: CAPAs ────────────────────────────────────────────────

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
      title: "Document Control NCR — Outdated procedures found",
      description:
        "During internal audit, 3 procedures were found using superseded revision. Document control register not updated after last management review.",
      type: "CORRECTIVE",
      status: "OPEN",
      priority: "HIGH",
      projectId: acme.id,
      dueDate: daysFromNow(21),
      rootCause: "Document control register not updated after management review in Q4 2025",
      clauseLinks: [
        { code: "ISO9001", clause: "7.5" },
        { code: "ISO14001", clause: "7.5" },
      ],
      actions: [
        { description: "Update document control register with all current revisions", isCompleted: false, dueDate: daysFromNow(7) },
        { description: "Distribute updated procedures to all site managers", isCompleted: false, dueDate: daysFromNow(14) },
        { description: "Conduct refresher training on document control procedure", isCompleted: false, dueDate: daysFromNow(21) },
      ],
    },
    {
      title: "Training Gap — 3 operators lack competency records",
      description:
        "Three crane operators on Site B lack documented competency assessments. Training matrix incomplete for Q1 2026.",
      type: "CORRECTIVE",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      projectId: acme.id,
      dueDate: daysFromNow(14),
      rootCause: "New hires onboarded without completing competency verification checklist",
      clauseLinks: [
        { code: "ISO9001", clause: "7.2" },
        { code: "ISO45001", clause: "7.2" },
      ],
      actions: [
        { description: "Schedule competency assessments for 3 crane operators", isCompleted: true, dueDate: daysAgo(3), completedDate: daysAgo(2) },
        { description: "Update training matrix for Q1 2026", isCompleted: false, dueDate: daysFromNow(7) },
      ],
    },
    {
      title: "PPE Compliance — Hard hat policy not followed on Site C",
      description:
        "Site inspection revealed 5 workers without hard hats in Zone A. Immediate stop-work issued. Under verification after corrective measures.",
      type: "CORRECTIVE",
      status: "VERIFICATION",
      priority: "HIGH",
      projectId: goldline.id,
      dueDate: daysFromNow(7),
      rootCause: "Insufficient PPE enforcement by shift supervisors during night shift",
      clauseLinks: [{ code: "ISO45001", clause: "8.1.2" }],
      actions: [
        { description: "Issue written warnings to responsible shift supervisors", isCompleted: true, dueDate: daysAgo(7), completedDate: daysAgo(6) },
        { description: "Install PPE checkpoint signage at Zone A entrance", isCompleted: true, dueDate: daysAgo(5), completedDate: daysAgo(4) },
        { description: "Conduct unannounced PPE spot checks for 2 weeks", isCompleted: false, dueDate: daysFromNow(7) },
      ],
    },
    {
      title: "Environmental Monitoring — Waste management gaps",
      description:
        "Monthly environmental inspection found inadequate waste segregation at main site. Hazardous waste storage area not compliant with SANS 10228.",
      type: "PREVENTIVE",
      status: "OPEN",
      priority: "CRITICAL",
      projectId: acme.id,
      dueDate: daysFromNow(10),
      clauseLinks: [
        { code: "ISO14001", clause: "8.1" },
        { code: "ISO14001", clause: "6.1.2" },
      ],
      actions: [
        { description: "Engage certified waste contractor for hazardous waste audit", isCompleted: false, dueDate: daysFromNow(5) },
        { description: "Procure compliant waste storage containers and signage", isCompleted: false, dueDate: daysFromNow(7) },
        { description: "Retrain site team on waste segregation procedures", isCompleted: false, dueDate: daysFromNow(10) },
      ],
    },
    {
      title: "Risk Assessment Update Required",
      description:
        "Annual risk assessment review due. Previous assessment completed 11 months ago. Proactive update before ISO 9001 gap assessment.",
      type: "PREVENTIVE",
      status: "CLOSED",
      priority: "LOW",
      projectId: apex.id,
      dueDate: daysAgo(5),
      closedDate: daysAgo(3),
      rootCause: "Scheduled review — proactive update ahead of certification readiness",
      clauseLinks: [{ code: "ISO9001", clause: "6.1" }],
      actions: [
        { description: "Review and update risk register", isCompleted: true, dueDate: daysAgo(10), completedDate: daysAgo(7) },
        { description: "Present updated risk register to management", isCompleted: true, dueDate: daysAgo(5), completedDate: daysAgo(3) },
      ],
    },
  ]

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
        organizationId: org.id,
        projectId: def.projectId,
        raisedById: userId,
        assignedToId: userId,
      },
    })

    // CAPA actions
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

    // Clause links
    for (const link of def.clauseLinks) {
      const { clauseId } = findClause(standards, link.code, link.clause)
      await prisma.capaStandardClause.create({
        data: { capaId: capa.id, standardClauseId: clauseId },
      })
    }
  }
  console.log(`   ✅ 5 CAPAs created with actions and clause links`)

  // ── Step 6: Vendors ──────────────────────────────────────────────

  console.log("\n🏗️  Creating vendors...")

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
      name: "Precision Drilling SA (Pty) Ltd",
      regNo: "2019/123456/07",
      bee: "Level 2",
      safety: 92,
      tier: "GOLD",
      certs: [
        { name: "CIDB Grading Certificate — Grade 7 CE", issuedBy: "CIDB", issuedDate: daysAgo(180), expiresAt: daysFromNow(185), status: "APPROVED" },
        { name: "Safety Competency Card", issuedBy: "SACPCMP", issuedDate: daysAgo(300), expiresAt: daysFromNow(10), status: "APPROVED" },
        { name: "Public Liability Insurance — R50M", issuedBy: "Santam", issuedDate: daysAgo(90), expiresAt: daysFromNow(275), status: "APPROVED" },
      ],
    },
    {
      name: "Thabiso Electrical Contractors",
      regNo: "2020/654321/07",
      bee: "Level 1",
      safety: 78,
      tier: "SILVER",
      certs: [
        { name: "CIDB Grading Certificate — Grade 5 EB", issuedBy: "CIDB", issuedDate: daysAgo(150), expiresAt: daysFromNow(215), status: "APPROVED" },
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
        { name: "Safety Competency Card", issuedBy: "SACPCMP", issuedDate: daysAgo(400), expiresAt: daysAgo(35), status: "REJECTED" },
      ],
    },
    {
      name: "SafeBlast Explosives (Pty) Ltd",
      regNo: "2017/345678/07",
      bee: "Level 2",
      safety: 98,
      tier: "PLATINUM",
      certs: [
        { name: "Explosives Handling Permit", issuedBy: "SAPS Explosives Unit", issuedDate: daysAgo(120), expiresAt: daysFromNow(245), status: "APPROVED" },
        { name: "Public Liability Insurance — R100M", issuedBy: "Hollard", issuedDate: daysAgo(60), expiresAt: daysFromNow(305), status: "APPROVED" },
        { name: "Medical Fitness Certificate", issuedBy: "HealthForce SA", issuedDate: daysAgo(45), expiresAt: daysFromNow(320), status: "APPROVED" },
      ],
    },
  ]

  for (const def of subDefs) {
    const sub = await prisma.vendor.create({
      data: {
        name: def.name,
        registrationNumber: def.regNo,
        beeLevel: def.bee,
        safetyRating: def.safety,
        tier: def.tier,
        organizationId: org.id,
      },
    })
    for (const cert of def.certs) {
      await prisma.vendorCertification.create({
        data: {
          name: cert.name,
          issuedBy: cert.issuedBy,
          issuedDate: cert.issuedDate,
          expiresAt: cert.expiresAt,
          status: cert.status,
          reviewedAt: cert.status !== "PENDING_REVIEW" ? daysAgo(5) : undefined,
          reviewNotes:
            cert.status === "REJECTED"
              ? "Certificate expired — request renewal from subcontractor"
              : cert.status === "APPROVED"
                ? "Verified and accepted"
                : undefined,
          vendorId: sub.id,
        },
      })
    }
  }
  console.log(`   ✅ 4 vendors created with certifications`)

  // ── Step 7: Checklist Templates + Checklists ─────────────────────

  console.log("\n✅ Creating checklists with custom fields...")

  // Template 1: Weekly Site Safety Inspection
  const template1Items = [
    { description: "All workers wearing required PPE in designated zones", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "Fire extinguishers accessible and within service date", fieldType: "COMPLIANCE", fieldConfig: null },
    { description: "Scaffolding inspected and tagged", fieldType: "BOOLEAN", fieldConfig: null },
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
      description: "Standard weekly safety inspection checklist for all active construction sites",
      standardId: iso45001.id,
      items: template1Items.map((item, i) => ({
        description: item.description,
        sortOrder: i + 1,
        fieldType: item.fieldType,
        fieldConfig: item.fieldConfig,
      })),
      organizationId: org.id,
      createdById: userId,
      isRecurring: true,
      recurrenceFrequency: "WEEKLY",
      nextDueDate: daysFromNow(3),
      defaultAssigneeId: userId,
      defaultProjectId: acme.id,
      lastGeneratedAt: daysAgo(3),
    },
  })

  // Template 2: Monthly Equipment Maintenance Check
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
      description: "Monthly inspection of heavy equipment and plant machinery",
      standardId: iso9001.id,
      items: template2Items.map((item, i) => ({
        description: item.description,
        sortOrder: i + 1,
        fieldType: item.fieldType,
        fieldConfig: item.fieldConfig,
      })),
      organizationId: org.id,
      createdById: userId,
      isRecurring: true,
      recurrenceFrequency: "MONTHLY",
      nextDueDate: daysFromNow(12),
      defaultAssigneeId: userId,
      defaultProjectId: acme.id,
      lastGeneratedAt: daysAgo(7),
    },
  })

  // Generated checklist 1: from template 1, IN_PROGRESS, 60%
  const checklist1 = await prisma.complianceChecklist.create({
    data: {
      title: "Weekly Site Safety Inspection — Week 9",
      description: "Site safety inspection for Acme Construction main site",
      status: "IN_PROGRESS",
      completionPercentage: 60,
      organizationId: org.id,
      projectId: acme.id,
      standardId: iso45001.id,
      assignedToId: userId,
      templateId: template1.id,
    },
  })

  // Add items with some responses
  const cl1Responses: (null | Record<string, unknown>)[] = [
    null,    // PPE — compliance, answered via isCompliant
    null,    // Fire extinguishers — compliance
    { value: true },  // Scaffolding — boolean
    { value: 78 },    // Noise dB — number
    { value: 4 },     // Safety rating — rating
    { value: "Good" }, // Housekeeping — select
    null,    // Emergency exits — not yet answered
    null,    // First aid — not yet answered
    null,    // Dust level — not yet answered
    null,    // Risk level — not yet answered
  ]
  const cl1Compliant: (boolean | null)[] = [true, true, null, null, null, null, null, null, null, null]

  for (let i = 0; i < template1Items.length; i++) {
    const item = template1Items[i]
    await prisma.checklistItem.create({
      data: {
        description: item.description,
        sortOrder: i + 1,
        fieldType: item.fieldType,
        fieldConfig: item.fieldConfig ?? undefined,
        response: cl1Responses[i] ?? undefined,
        isCompliant: cl1Compliant[i],
        checklistId: checklist1.id,
      },
    })
  }

  // Generated checklist 2: from template 2, COMPLETED, 100%
  const checklist2 = await prisma.complianceChecklist.create({
    data: {
      title: "Monthly Equipment Maintenance Check — February 2026",
      description: "Heavy equipment inspection for Acme Construction fleet",
      status: "COMPLETED",
      completionPercentage: 100,
      organizationId: org.id,
      projectId: acme.id,
      standardId: iso9001.id,
      assignedToId: userId,
      templateId: template2.id,
    },
  })

  const cl2Responses: (null | Record<string, unknown>)[] = [
    null,            // Service records — compliance
    { value: true }, // Hydraulic pressure
    { value: 87 },  // Oil temp
    { value: true }, // Coolant
    null,            // Safety guards — compliance
    { value: true }, // Brake test
    { value: 12 },  // Tyre depth
    null,            // Logbook — compliance
  ]
  const cl2Compliant: (boolean | null)[] = [true, null, null, null, true, null, null, true]

  for (let i = 0; i < template2Items.length; i++) {
    const item = template2Items[i]
    await prisma.checklistItem.create({
      data: {
        description: item.description,
        sortOrder: i + 1,
        fieldType: item.fieldType,
        fieldConfig: item.fieldConfig ?? undefined,
        response: cl2Responses[i] ?? undefined,
        isCompliant: cl2Compliant[i],
        checklistId: checklist2.id,
      },
    })
  }

  console.log(`   ✅ 2 templates + 2 checklists created with custom fields`)

  // ── Step 8: Approval Workflow Template ────────────────────────────

  console.log("\n🔄 Creating approval workflow template...")

  await prisma.approvalWorkflowTemplate.create({
    data: {
      name: "Document Approval Chain",
      description: "Standard 3-step approval for all controlled documents",
      steps: [
        { stepOrder: 1, role: "MANAGER", label: "Manager Review" },
        { stepOrder: 2, role: "ADMIN", label: "Admin Approval" },
        { stepOrder: 3, role: "OWNER", label: "Owner Sign-off" },
      ],
      isDefault: true,
      organizationId: org.id,
      createdById: userId,
    },
  })
  console.log(`   ✅ Approval workflow template created (set as default)`)

  // ── Step 9: Audit Pack ────────────────────────────────────────────

  console.log("\n📦 Creating audit pack...")

  await prisma.auditPack.create({
    data: {
      title: "ISO 9001 Surveillance Audit Pack — Acme Construction Q1 2026",
      description:
        "Compiled evidence pack for the upcoming ISO 9001 surveillance audit including policies, procedures, management review minutes, and training records.",
      status: "READY",
      generatedAt: daysAgo(2),
      organizationId: org.id,
      projectId: acme.id,
      createdById: userId,
    },
  })
  console.log(`   ✅ 1 audit pack created`)

  // ── Step 10: Audit Trail Events ───────────────────────────────────

  console.log("\n📜 Creating audit trail events...")

  type AuditEvent = {
    action: string
    entityType: string
    entityId: string
    metadata?: Record<string, unknown>
    createdAt: Date
  }

  const auditEvents: AuditEvent[] = [
    { action: "CREATE", entityType: "Project", entityId: acme.id, metadata: { name: acme.name }, createdAt: daysAgo(30) },
    { action: "CREATE", entityType: "Project", entityId: goldline.id, metadata: { name: "Goldline Mining Services — OHS Certification" }, createdAt: daysAgo(28) },
    { action: "CREATE", entityType: "Document", entityId: documents[0].id, metadata: { title: documents[0].title }, createdAt: daysAgo(25) },
    { action: "CLASSIFY", entityType: "Document", entityId: documents[0].id, metadata: { title: documents[0].title, standard: "ISO9001", confidence: 0.95 }, createdAt: daysAgo(25) },
    { action: "CREATE", entityType: "Document", entityId: documents[1].id, metadata: { title: documents[1].title }, createdAt: daysAgo(24) },
    { action: "CREATE", entityType: "Document", entityId: documents[3].id, metadata: { title: documents[3].title }, createdAt: daysAgo(22) },
    { action: "CLASSIFY", entityType: "Document", entityId: documents[3].id, metadata: { title: documents[3].title, standards: ["ISO9001", "ISO14001", "ISO45001"] }, createdAt: daysAgo(22) },
    { action: "STATUS_CHANGE", entityType: "Document", entityId: documents[0].id, metadata: { title: documents[0].title, from: "DRAFT", to: "APPROVED" }, createdAt: daysAgo(20) },
    { action: "CREATE", entityType: "Assessment", entityId: assessment2.id, metadata: { title: "ISO 45001 Internal Audit — Goldline Mining" }, createdAt: daysAgo(16) },
    { action: "COMPLETE", entityType: "Assessment", entityId: assessment2.id, metadata: { title: "ISO 45001 Internal Audit — Goldline Mining", score: 82 }, createdAt: daysAgo(12) },
    { action: "CREATE", entityType: "Assessment", entityId: assessment1.id, metadata: { title: "ISO 9001 Surveillance Audit — Acme Construction" }, createdAt: daysAgo(10) },
    { action: "CREATE", entityType: "Document", entityId: documents[9].id, metadata: { title: documents[9].title }, createdAt: daysAgo(8) },
    { action: "CLASSIFY", entityType: "Document", entityId: documents[9].id, metadata: { title: documents[9].title, standard: "ISO45001", confidence: 0.93 }, createdAt: daysAgo(8) },
    { action: "CREATE", entityType: "AuditPack", entityId: "system", metadata: { title: "ISO 9001 Surveillance Audit Pack — Acme Q1 2026" }, createdAt: daysAgo(2) },
    { action: "STATUS_CHANGE", entityType: "AuditPack", entityId: "system", metadata: { title: "ISO 9001 Surveillance Audit Pack", from: "DRAFT", to: "READY" }, createdAt: daysAgo(1) },
  ]

  for (const evt of auditEvents) {
    await prisma.auditTrailEvent.create({
      data: {
        action: evt.action,
        entityType: evt.entityType,
        entityId: evt.entityId,
        metadata: evt.metadata,
        userId,
        organizationId: org.id,
        createdAt: evt.createdAt,
      },
    })
  }
  console.log(`   ✅ ${auditEvents.length} audit trail events created`)

  // ── Done ──────────────────────────────────────────────────────────

  console.log("\n🎉 Demo data seeded successfully!")
  console.log("   Dashboard should now show populated KPIs, documents, assessments, CAPAs, etc.")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
