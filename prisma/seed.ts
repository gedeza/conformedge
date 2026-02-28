import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { ISO14001_SUB_CLAUSES } from "./seed-data/iso14001-subclauses"
import { ISO45001_SUB_CLAUSES } from "./seed-data/iso45001-subclauses"
import { ISO22301_SUB_CLAUSES } from "./seed-data/iso22301-subclauses"
import { ISO27001_SUB_CLAUSES } from "./seed-data/iso27001-subclauses"
import { ISO37001_SUB_CLAUSES } from "./seed-data/iso37001-subclauses"
import { ISO39001_SUB_CLAUSES } from "./seed-data/iso39001-subclauses"
import { generateHLSCrossReferences, DOMAIN_CROSS_REFERENCES } from "./seed-data/cross-references"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface StandardSeed {
  code: string
  name: string
  description: string
  version: string
}

interface ClauseData {
  clauseNumber: string
  title: string
  description: string
}

export interface SubClauseData extends ClauseData {
  parentClauseNumber: string // e.g. "4" for sub-clause "4.1"
}

// ─────────────────────────────────────────────
// ISO Standards
// ─────────────────────────────────────────────

const STANDARDS: StandardSeed[] = [
  {
    code: "ISO9001",
    name: "ISO 9001:2015",
    description: "Quality Management Systems - Requirements",
    version: "2015",
  },
  {
    code: "ISO14001",
    name: "ISO 14001:2015",
    description: "Environmental Management Systems - Requirements with guidance for use",
    version: "2015",
  },
  {
    code: "ISO45001",
    name: "ISO 45001:2018",
    description: "Occupational Health and Safety Management Systems - Requirements with guidance for use",
    version: "2018",
  },
  {
    code: "ISO22301",
    name: "ISO 22301:2019",
    description: "Business Continuity Management Systems - Requirements",
    version: "2019",
  },
  {
    code: "ISO27001",
    name: "ISO 27001:2022",
    description: "Information Security Management Systems - Requirements",
    version: "2022",
  },
  {
    code: "ISO37001",
    name: "ISO 37001:2016",
    description: "Anti-bribery Management Systems - Requirements with guidance for use",
    version: "2016",
  },
  {
    code: "ISO39001",
    name: "ISO 39001:2012",
    description: "Road Traffic Safety Management Systems - Requirements with guidance for use",
    version: "2012",
  },
]

// ─────────────────────────────────────────────
// Per-Standard Clause Definitions (Clauses 4-10)
// Each standard has domain-specific titles and descriptions
// following the High Level Structure (HLS / Annex SL)
// ─────────────────────────────────────────────

const STANDARD_CLAUSES: Record<string, ClauseData[]> = {
  ISO9001: [
    {
      clauseNumber: "4",
      title: "Context of the Organization",
      description: "Determine external and internal issues relevant to the QMS purpose and strategic direction, understand interested parties, and define the scope of the quality management system.",
    },
    {
      clauseNumber: "5",
      title: "Leadership",
      description: "Top management shall demonstrate leadership and commitment to the QMS, establish a quality policy, and assign organizational roles, responsibilities and authorities.",
    },
    {
      clauseNumber: "6",
      title: "Planning",
      description: "Plan actions to address risks and opportunities, establish quality objectives at relevant functions and levels, and plan changes to the QMS systematically.",
    },
    {
      clauseNumber: "7",
      title: "Support",
      description: "Determine and provide resources needed for the QMS including people, infrastructure, monitoring resources, competence, awareness, communication and documented information.",
    },
    {
      clauseNumber: "8",
      title: "Operation",
      description: "Plan, implement and control processes needed to meet requirements for products and services, including design, external providers, production, release and control of nonconforming outputs.",
    },
    {
      clauseNumber: "9",
      title: "Performance Evaluation",
      description: "Monitor, measure, analyse and evaluate QMS performance and effectiveness through customer satisfaction, internal audits and management reviews.",
    },
    {
      clauseNumber: "10",
      title: "Improvement",
      description: "Determine and select opportunities for improvement, react to nonconformities with corrective actions, and continually improve the suitability, adequacy and effectiveness of the QMS.",
    },
  ],

  ISO14001: [
    {
      clauseNumber: "4",
      title: "Context of the Organization",
      description: "Determine external and internal issues relevant to the EMS purpose, understand the needs and expectations of interested parties including compliance obligations, and define the EMS scope considering environmental conditions.",
    },
    {
      clauseNumber: "5",
      title: "Leadership",
      description: "Top management shall demonstrate leadership and commitment to the EMS, establish an environmental policy that includes pollution prevention commitments, and assign EMS roles and responsibilities.",
    },
    {
      clauseNumber: "6",
      title: "Planning",
      description: "Plan actions to address environmental risks and opportunities, identify environmental aspects and determine significant impacts, identify compliance obligations, and establish environmental objectives.",
    },
    {
      clauseNumber: "7",
      title: "Support",
      description: "Determine and provide resources for the EMS, ensure competence of persons doing work that affects environmental performance, promote environmental awareness, and manage documented information.",
    },
    {
      clauseNumber: "8",
      title: "Operation",
      description: "Plan, implement, control and maintain processes to meet EMS requirements, manage operational controls for significant environmental aspects, and prepare for and respond to potential emergency situations.",
    },
    {
      clauseNumber: "9",
      title: "Performance Evaluation",
      description: "Monitor, measure, analyse and evaluate environmental performance, evaluate compliance with obligations, conduct internal audits, and perform management reviews of the EMS.",
    },
    {
      clauseNumber: "10",
      title: "Improvement",
      description: "Determine opportunities for improvement, react to nonconformities and environmental incidents with corrective actions, and continually improve the EMS to enhance environmental performance.",
    },
  ],

  ISO45001: [
    {
      clauseNumber: "4",
      title: "Context of the Organization",
      description: "Determine external and internal issues relevant to the OH&S management system, understand the needs and expectations of workers and other interested parties, and define the OH&S MS scope.",
    },
    {
      clauseNumber: "5",
      title: "Leadership and Worker Participation",
      description: "Top management shall demonstrate leadership and commitment to OH&S, establish an OH&S policy, assign roles and responsibilities, and ensure consultation and participation of workers at all levels.",
    },
    {
      clauseNumber: "6",
      title: "Planning",
      description: "Plan actions to address OH&S risks and opportunities, identify hazards, assess OH&S risks and other risks to the system, determine applicable legal and other requirements, and establish OH&S objectives.",
    },
    {
      clauseNumber: "7",
      title: "Support",
      description: "Determine and provide resources for the OH&S MS, ensure worker competence, promote OH&S awareness, establish internal and external communication processes, and manage documented information.",
    },
    {
      clauseNumber: "8",
      title: "Operation",
      description: "Plan, implement, control and maintain processes for OH&S requirements, establish hierarchy of controls, manage change, manage procurement and outsourcing, and prepare for emergency response.",
    },
    {
      clauseNumber: "9",
      title: "Performance Evaluation",
      description: "Monitor, measure, analyse and evaluate OH&S performance, evaluate compliance with legal and other requirements, conduct internal audits, and perform management reviews.",
    },
    {
      clauseNumber: "10",
      title: "Improvement",
      description: "Determine opportunities for improvement, respond to incidents and nonconformities with corrective actions, and continually improve the OH&S management system.",
    },
  ],

  ISO22301: [
    {
      clauseNumber: "4",
      title: "Context of the Organization",
      description: "Determine external and internal issues relevant to the BCMS purpose, understand the needs of interested parties, determine the scope of the BCMS, and identify products, services and activities within scope.",
    },
    {
      clauseNumber: "5",
      title: "Leadership",
      description: "Top management shall demonstrate leadership and commitment to the BCMS, establish a business continuity policy, and assign roles, responsibilities and authorities for business continuity.",
    },
    {
      clauseNumber: "6",
      title: "Planning",
      description: "Plan actions to address risks and opportunities to the BCMS, establish business continuity objectives at relevant functions and levels, and plan how to achieve them.",
    },
    {
      clauseNumber: "7",
      title: "Support",
      description: "Determine and provide resources for the BCMS, ensure competence of personnel, promote awareness of the BC policy and roles, establish communication procedures, and manage documented information.",
    },
    {
      clauseNumber: "8",
      title: "Operation",
      description: "Conduct business impact analysis and risk assessment, determine business continuity strategies and solutions, establish and implement business continuity plans and procedures, and conduct exercises and testing.",
    },
    {
      clauseNumber: "9",
      title: "Performance Evaluation",
      description: "Monitor, measure, analyse and evaluate BCMS performance, evaluate effectiveness of business continuity procedures, conduct internal audits, and perform management reviews.",
    },
    {
      clauseNumber: "10",
      title: "Improvement",
      description: "Determine opportunities for improvement, react to nonconformities with corrective actions, and continually improve the suitability, adequacy and effectiveness of the BCMS.",
    },
  ],

  ISO27001: [
    {
      clauseNumber: "4",
      title: "Context of the Organization",
      description: "Determine external and internal issues relevant to the ISMS purpose, understand interested parties and their requirements related to information security, and define the ISMS scope.",
    },
    {
      clauseNumber: "5",
      title: "Leadership",
      description: "Top management shall demonstrate leadership and commitment to the ISMS, establish an information security policy aligned with strategic direction, and assign ISMS roles, responsibilities and authorities.",
    },
    {
      clauseNumber: "6",
      title: "Planning",
      description: "Plan actions to address information security risks and opportunities, perform information security risk assessments, determine risk treatment plans, establish information security objectives, and produce a Statement of Applicability.",
    },
    {
      clauseNumber: "7",
      title: "Support",
      description: "Determine and provide resources for the ISMS, ensure competence of persons affecting information security performance, promote security awareness, establish communication processes, and manage documented information.",
    },
    {
      clauseNumber: "8",
      title: "Operation",
      description: "Plan, implement and control ISMS processes, perform information security risk assessments at planned intervals, and implement the information security risk treatment plan.",
    },
    {
      clauseNumber: "9",
      title: "Performance Evaluation",
      description: "Monitor, measure, analyse and evaluate ISMS performance and effectiveness, conduct internal audits of the ISMS, and perform management reviews at planned intervals.",
    },
    {
      clauseNumber: "10",
      title: "Improvement",
      description: "React to nonconformities with corrective actions to eliminate root causes, and continually improve the suitability, adequacy and effectiveness of the ISMS.",
    },
  ],

  ISO37001: [
    {
      clauseNumber: "4",
      title: "Context of the Organization",
      description: "Determine external and internal issues relevant to the ABMS purpose, understand the needs of interested parties, assess bribery risk, and define the scope of the anti-bribery management system.",
    },
    {
      clauseNumber: "5",
      title: "Leadership",
      description: "Top management and the governing body shall demonstrate leadership and commitment to the ABMS, establish an anti-bribery policy, assign roles and responsibilities, and delegate authority to the anti-bribery compliance function.",
    },
    {
      clauseNumber: "6",
      title: "Planning",
      description: "Plan actions to address bribery risks and opportunities, perform bribery risk assessments, establish anti-bribery objectives, and plan actions to achieve them.",
    },
    {
      clauseNumber: "7",
      title: "Support",
      description: "Determine and provide resources for the ABMS, ensure competence of persons, promote anti-bribery awareness and training, establish communication processes, and manage documented information.",
    },
    {
      clauseNumber: "8",
      title: "Operation",
      description: "Plan, implement and control anti-bribery processes including due diligence, financial and non-financial controls, management of gifts and hospitality, and anti-bribery commitments from business associates.",
    },
    {
      clauseNumber: "9",
      title: "Performance Evaluation",
      description: "Monitor, measure, analyse and evaluate ABMS performance, conduct internal audits, perform management reviews, and review the anti-bribery compliance function's effectiveness.",
    },
    {
      clauseNumber: "10",
      title: "Improvement",
      description: "React to nonconformities and reported bribery concerns with corrective actions, investigate bribery events, and continually improve the suitability, adequacy and effectiveness of the ABMS.",
    },
  ],

  ISO39001: [
    {
      clauseNumber: "4",
      title: "Context of the Organization",
      description: "Determine external and internal issues relevant to the RTS management system, understand interested parties, define the scope, identify road traffic safety performance factors, and establish the RTS MS.",
    },
    {
      clauseNumber: "5",
      title: "Leadership",
      description: "Top management shall demonstrate leadership and commitment to road traffic safety, establish an RTS policy with commitment to eliminating fatalities and serious injuries, and assign roles and responsibilities.",
    },
    {
      clauseNumber: "6",
      title: "Planning",
      description: "Plan actions to address road traffic safety risks and opportunities, set RTS performance targets aligned with the long-term goal of zero fatalities, and plan actions to achieve RTS objectives.",
    },
    {
      clauseNumber: "7",
      title: "Support",
      description: "Determine and provide resources for the RTS MS, ensure competence of personnel, promote road traffic safety awareness, establish communication processes, and manage documented information.",
    },
    {
      clauseNumber: "8",
      title: "Operation",
      description: "Plan, implement and control processes for road traffic safety including operational controls for RTS performance factors, management of journeys, routes, vehicles, drivers, and emergency preparedness.",
    },
    {
      clauseNumber: "9",
      title: "Performance Evaluation",
      description: "Monitor, measure, analyse and evaluate RTS performance, investigate traffic crashes and incidents, conduct internal audits, and perform management reviews of the RTS MS.",
    },
    {
      clauseNumber: "10",
      title: "Improvement",
      description: "Determine opportunities for improvement, react to nonconformities and RTS incidents with corrective actions, and continually improve road traffic safety performance and the RTS MS.",
    },
  ],
}

// ─────────────────────────────────────────────
// ISO 9001 Sub-Clauses (Detailed)
// ─────────────────────────────────────────────

const ISO9001_SUB_CLAUSES: SubClauseData[] = [
  // Clause 4 sub-clauses
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Understanding the organization and its context",
    description: "Determine external and internal issues that are relevant to the organization's purpose and strategic direction and that affect its ability to achieve the intended results of the QMS.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Understanding the needs and expectations of interested parties",
    description: "Determine the interested parties relevant to the QMS, and the requirements of those interested parties that are relevant to the quality management system.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.3",
    title: "Determining the scope of the quality management system",
    description: "Determine the boundaries and applicability of the QMS to establish its scope, considering external and internal issues, requirements of relevant interested parties, and the products and services of the organization.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.4",
    title: "Quality management system and its processes",
    description: "Establish, implement, maintain and continually improve a QMS including the processes needed and their interactions, determining inputs, outputs, sequence, criteria, resources, responsibilities and risks.",
  },

  // Clause 5 sub-clauses
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Leadership and commitment",
    description: "Top management shall demonstrate leadership and commitment with respect to the QMS by taking accountability, establishing quality policy and objectives, ensuring integration into business processes, and promoting a process approach and risk-based thinking.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Policy",
    description: "Top management shall establish, implement and maintain a quality policy that is appropriate to the purpose and context of the organization, provides a framework for setting quality objectives, and includes a commitment to satisfy applicable requirements and continual improvement.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Organizational roles, responsibilities and authorities",
    description: "Top management shall ensure responsibilities and authorities for relevant roles are assigned, communicated and understood within the organization, including responsibility for QMS conformity, process performance, customer focus and management of change.",
  },

  // Clause 6 sub-clauses
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Actions to address risks and opportunities",
    description: "When planning for the QMS, consider the issues from 4.1 and requirements from 4.2, and determine risks and opportunities that need to be addressed to give assurance the QMS can achieve intended results, enhance desirable effects, prevent or reduce undesired effects, and achieve improvement.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Quality objectives and planning to achieve them",
    description: "Establish quality objectives at relevant functions, levels and processes needed for the QMS. Objectives shall be consistent with the quality policy, be measurable, take into account applicable requirements, be relevant to conformity, be monitored, communicated, and updated.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.3",
    title: "Planning of changes",
    description: "When the organization determines the need for changes to the QMS, the changes shall be carried out in a planned manner, considering the purpose of the changes, QMS integrity, resource availability, and allocation or reallocation of responsibilities and authorities.",
  },

  // Clause 7 sub-clauses
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Resources",
    description: "Determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the QMS, considering capabilities of and constraints on existing resources, and what needs to be obtained from external providers.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Competence",
    description: "Determine the necessary competence of persons doing work under the organization's control that affects QMS performance and effectiveness, ensure these persons are competent on the basis of appropriate education, training or experience, and take actions to acquire competence where needed.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "Awareness",
    description: "Ensure persons doing work under the organization's control are aware of the quality policy, relevant quality objectives, their contribution to QMS effectiveness, and the implications of not conforming with QMS requirements.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.4",
    title: "Communication",
    description: "Determine the internal and external communications relevant to the QMS, including what to communicate, when, with whom, how, and who communicates.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.5",
    title: "Documented information",
    description: "The QMS shall include documented information required by this standard and determined by the organization as necessary for QMS effectiveness. Control the creation, updating, and management of documented information to ensure availability, suitability and adequate protection.",
  },

  // Clause 8 sub-clauses
  {
    parentClauseNumber: "8",
    clauseNumber: "8.1",
    title: "Operational planning and control",
    description: "Plan, implement and control the processes needed to meet requirements for the provision of products and services by establishing criteria for the processes and acceptance of products and services, determining resources needed, and implementing control of the processes.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.2",
    title: "Requirements for products and services",
    description: "Determine the requirements for products and services to be offered to customers including communication with customers, determining requirements related to products and services, and reviewing requirements to ensure the organization can meet claims for the products and services it offers.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.3",
    title: "Design and development of products and services",
    description: "Establish, implement and maintain a design and development process that is appropriate to ensure subsequent provision of products and services, including planning, inputs, controls, outputs and changes to design and development.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.4",
    title: "Control of externally provided processes, products and services",
    description: "Ensure that externally provided processes, products and services conform to requirements by determining and applying criteria for evaluation, selection, monitoring of performance and re-evaluation of external providers.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.5",
    title: "Production and service provision",
    description: "Implement production and service provision under controlled conditions, including availability of documented information, monitoring and measurement resources, implementation of activities at appropriate stages, use of suitable infrastructure and environment, appointment of competent persons, and validation of processes.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.6",
    title: "Release of products and services",
    description: "Implement planned arrangements at appropriate stages to verify that product and service requirements have been met. The release of products and services to the customer shall not proceed until planned arrangements have been satisfactorily completed, unless otherwise approved by a relevant authority and, as applicable, by the customer.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.7",
    title: "Control of nonconforming outputs",
    description: "Ensure that outputs that do not conform to their requirements are identified and controlled to prevent their unintended use or delivery. Take appropriate action based on the nature of the nonconformity and its effect on the conformity of products and services.",
  },

  // Clause 9 sub-clauses
  {
    parentClauseNumber: "9",
    clauseNumber: "9.1",
    title: "Monitoring, measurement, analysis and evaluation",
    description: "Determine what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation, when they shall be performed, and when the results shall be analysed and evaluated. Evaluate QMS performance and effectiveness.",
  },
  {
    parentClauseNumber: "9",
    clauseNumber: "9.2",
    title: "Internal audit",
    description: "Conduct internal audits at planned intervals to provide information on whether the QMS conforms to the organization's own requirements and ISO 9001 requirements, and is effectively implemented and maintained. Plan, establish, implement and maintain audit programmes.",
  },
  {
    parentClauseNumber: "9",
    clauseNumber: "9.3",
    title: "Management review",
    description: "Top management shall review the QMS at planned intervals to ensure its continuing suitability, adequacy, effectiveness and alignment with the strategic direction of the organization. Reviews shall consider the status of actions from previous reviews, changes in external and internal issues, QMS performance and trends, and opportunities for improvement.",
  },

  // Clause 10 sub-clauses
  {
    parentClauseNumber: "10",
    clauseNumber: "10.1",
    title: "General",
    description: "Determine and select opportunities for improvement, and implement any necessary actions to meet customer requirements and enhance customer satisfaction, including improving products and services, correcting, preventing or reducing undesired effects, and improving QMS performance and effectiveness.",
  },
  {
    parentClauseNumber: "10",
    clauseNumber: "10.2",
    title: "Nonconformity and corrective action",
    description: "When a nonconformity occurs, react to the nonconformity by taking action to control and correct it and deal with the consequences, evaluate the need for action to eliminate the root causes, implement any action needed, review the effectiveness of corrective action taken, and update risks and opportunities if necessary.",
  },
  {
    parentClauseNumber: "10",
    clauseNumber: "10.3",
    title: "Continual improvement",
    description: "Continually improve the suitability, adequacy and effectiveness of the QMS by considering the results of analysis and evaluation, and the outputs from management review, to determine if there are needs or opportunities that shall be addressed as part of continual improvement.",
  },
]

// ─────────────────────────────────────────────
// Upsert Helper
// Uses findFirst + create/update since there is no
// compound unique constraint on (clauseNumber, standardId)
// ─────────────────────────────────────────────

async function upsertClause(data: {
  clauseNumber: string
  standardId: string
  title: string
  description: string
  parentId?: string | null
}) {
  const existing = await prisma.standardClause.findFirst({
    where: {
      clauseNumber: data.clauseNumber,
      standardId: data.standardId,
    },
  })

  if (existing) {
    return prisma.standardClause.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        description: data.description,
        parentId: data.parentId ?? existing.parentId,
      },
    })
  }

  return prisma.standardClause.create({
    data: {
      clauseNumber: data.clauseNumber,
      title: data.title,
      description: data.description,
      standardId: data.standardId,
      parentId: data.parentId ?? null,
    },
  })
}

// ─────────────────────────────────────────────
// Main Seed Function
// ─────────────────────────────────────────────

async function main() {
  console.log("=== ConformEdge Seed ===\n")

  // ── Pass 1: Seed ISO Standards ──
  console.log("Step 1: Seeding ISO standards...\n")

  const standardMap = new Map<string, string>() // code -> id

  for (const std of STANDARDS) {
    const standard = await prisma.standard.upsert({
      where: { code: std.code },
      update: {
        name: std.name,
        description: std.description,
        version: std.version,
      },
      create: {
        code: std.code,
        name: std.name,
        description: std.description,
        version: std.version,
      },
    })

    standardMap.set(std.code, standard.id)
    console.log(`  Standard: ${std.name} (${std.code})`)
  }

  console.log(`\n  ${STANDARDS.length} standards seeded.\n`)

  // ── Pass 2: Seed Top-Level Clauses (4-10) per Standard ──
  console.log("Step 2: Seeding standard-specific clauses (4-10)...\n")

  let clauseCount = 0

  for (const [code, clauses] of Object.entries(STANDARD_CLAUSES)) {
    const standardId = standardMap.get(code)
    if (!standardId) {
      console.warn(`  WARNING: Standard ${code} not found, skipping clauses.`)
      continue
    }

    for (const clause of clauses) {
      await upsertClause({
        clauseNumber: clause.clauseNumber,
        standardId,
        title: clause.title,
        description: clause.description,
      })
      clauseCount++
    }

    console.log(`  ${code}: ${clauses.length} clauses seeded`)
  }

  console.log(`\n  ${clauseCount} total top-level clauses seeded.\n`)

  // ── Pass 3: Seed Sub-Clauses for All Standards ──
  console.log("Step 3: Seeding sub-clauses for all standards...\n")

  const SUB_CLAUSE_MAP: Record<string, SubClauseData[]> = {
    ISO9001: ISO9001_SUB_CLAUSES,
    ISO14001: ISO14001_SUB_CLAUSES,
    ISO45001: ISO45001_SUB_CLAUSES,
    ISO22301: ISO22301_SUB_CLAUSES,
    ISO27001: ISO27001_SUB_CLAUSES,
    ISO37001: ISO37001_SUB_CLAUSES,
    ISO39001: ISO39001_SUB_CLAUSES,
  }

  let totalSubClauses = 0

  for (const [code, subClauses] of Object.entries(SUB_CLAUSE_MAP)) {
    const standardId = standardMap.get(code)
    if (!standardId) {
      console.warn(`  WARNING: Standard ${code} not found. Skipping sub-clauses.`)
      continue
    }

    // Build a map of parent clause numbers to their IDs for this standard
    const parentClauseMap = new Map<string, string>()

    for (const parentClauseNumber of ["4", "5", "6", "7", "8", "9", "10"]) {
      const parent = await prisma.standardClause.findFirst({
        where: {
          clauseNumber: parentClauseNumber,
          standardId,
          parentId: null,
        },
      })

      if (parent) {
        parentClauseMap.set(parentClauseNumber, parent.id)
      }
    }

    let count = 0

    for (const subClause of subClauses) {
      const parentId = parentClauseMap.get(subClause.parentClauseNumber)

      if (!parentId) {
        console.warn(`  WARNING: Parent clause ${subClause.parentClauseNumber} not found for ${code}, skipping ${subClause.clauseNumber}`)
        continue
      }

      await upsertClause({
        clauseNumber: subClause.clauseNumber,
        standardId,
        title: subClause.title,
        description: subClause.description,
        parentId,
      })
      count++
    }

    console.log(`  ${code}: ${count} sub-clauses seeded`)
    totalSubClauses += count
  }

  console.log(`\n  ${totalSubClauses} total sub-clauses seeded.\n`)

  // ── Pass 4: Seed Cross-References ──
  console.log("Step 4: Seeding clause cross-references...\n")

  // Build a lookup: `${standardCode}:${clauseNumber}` → clauseId
  const clauseLookup = new Map<string, string>()
  for (const [code, standardId] of standardMap.entries()) {
    const clauses = await prisma.standardClause.findMany({
      where: { standardId },
      select: { id: true, clauseNumber: true },
    })
    for (const c of clauses) {
      clauseLookup.set(`${code}:${c.clauseNumber}`, c.id)
    }
  }

  // Generate HLS EQUIVALENT references
  const hlsRefs = generateHLSCrossReferences()
  let crossRefCount = 0
  let skipped = 0

  for (const ref of hlsRefs) {
    const sourceId = clauseLookup.get(`${ref.sourceStandard}:${ref.sourceClauseNumber}`)
    const targetId = clauseLookup.get(`${ref.targetStandard}:${ref.targetClauseNumber}`)

    if (!sourceId || !targetId) {
      skipped++
      continue
    }

    const existing = await prisma.clauseCrossReference.findUnique({
      where: { sourceClauseId_targetClauseId: { sourceClauseId: sourceId, targetClauseId: targetId } },
    })

    if (!existing) {
      await prisma.clauseCrossReference.create({
        data: {
          sourceClauseId: sourceId,
          targetClauseId: targetId,
          mappingType: ref.mappingType,
        },
      })
    }
    crossRefCount++
  }

  console.log(`  HLS EQUIVALENT: ${crossRefCount} cross-references (${skipped} skipped — clause not found)`)

  // Domain-specific RELATED/SUPPORTING references
  let domainCount = 0

  for (const ref of DOMAIN_CROSS_REFERENCES) {
    const sourceId = clauseLookup.get(`${ref.sourceStandard}:${ref.sourceClauseNumber}`)
    const targetId = clauseLookup.get(`${ref.targetStandard}:${ref.targetClauseNumber}`)

    if (!sourceId || !targetId) {
      console.warn(`  WARNING: Could not resolve ${ref.sourceStandard}:${ref.sourceClauseNumber} → ${ref.targetStandard}:${ref.targetClauseNumber}`)
      continue
    }

    const existing = await prisma.clauseCrossReference.findUnique({
      where: { sourceClauseId_targetClauseId: { sourceClauseId: sourceId, targetClauseId: targetId } },
    })

    if (existing) {
      await prisma.clauseCrossReference.update({
        where: { id: existing.id },
        data: { mappingType: ref.mappingType, notes: ref.notes },
      })
    } else {
      await prisma.clauseCrossReference.create({
        data: {
          sourceClauseId: sourceId,
          targetClauseId: targetId,
          mappingType: ref.mappingType,
          notes: ref.notes,
        },
      })
    }
    domainCount++
  }

  console.log(`  Domain-specific: ${domainCount} cross-references`)
  console.log(`\n  Total cross-references: ${crossRefCount + domainCount}\n`)

  // ── Summary ──
  const totalClauses = await prisma.standardClause.count()
  const totalStandards = await prisma.standard.count()

  console.log("=== Seed Complete ===")
  console.log(`  Standards: ${totalStandards}`)
  console.log(`  Clauses (total): ${totalClauses}`)
  console.log(`  Top-level clauses: ${clauseCount}`)
  console.log(`  Sub-clauses: ${totalSubClauses}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
