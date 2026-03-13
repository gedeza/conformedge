import type { SubClauseData } from "../seed"

/**
 * SACPCMP — South African Council for the Project and Construction Management Professions
 * (Act 48 of 2000)
 *
 * Professional regulatory framework for project and construction management practitioners.
 * Structure follows the Act's chapters and key regulatory areas.
 * Top-level clauses defined in seed.ts STANDARD_CLAUSES.
 */
export const SACPCMP_SUB_CLAUSES: SubClauseData[] = [
  // ── Chapter 1: Registration Categories ──
  {
    parentClauseNumber: "1",
    clauseNumber: "1.1",
    title: "Professional Construction Manager (Pr CM)",
    description: "Requirements for registration as a Professional Construction Manager including accredited qualification, minimum 5 years post-qualification experience in construction management, and professional competency assessment.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.2",
    title: "Professional Construction Project Manager (Pr CPM)",
    description: "Requirements for registration as a Professional Construction Project Manager including accredited qualification, minimum 5 years post-qualification experience in construction project management, and demonstrated competence.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.3",
    title: "Professional Construction Mentor (Pr CM-tor)",
    description: "Requirements for registration as a Professional Construction Mentor including senior-level experience, demonstrated mentoring capability, and commitment to developing emerging professionals in the industry.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.4",
    title: "Candidate Registration",
    description: "Provisions for candidate registration enabling graduates to gain supervised practical experience toward professional registration. Requirements for training plans, logbooks, and mentor assignments.",
  },

  // ── Chapter 2: Practice Standards ──
  {
    parentClauseNumber: "2",
    clauseNumber: "2.1",
    title: "Project Initiation and Planning",
    description: "Standards for construction project initiation including feasibility studies, scope definition, resource planning, scheduling, budgeting, and procurement strategy development.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.2",
    title: "Contract Administration",
    description: "Standards for construction contract administration including tender management, contract documentation, variation management, payment certification, and dispute resolution procedures.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.3",
    title: "Quality Management in Construction",
    description: "Standards for construction quality management including quality planning, inspection and testing plans, non-conformance management, and quality assurance documentation.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.4",
    title: "Cost Management",
    description: "Standards for construction cost management including cost estimation, budgeting, cost control, earned value management, and financial reporting on construction projects.",
  },

  // ── Chapter 3: Health and Safety Responsibilities ──
  {
    parentClauseNumber: "3",
    clauseNumber: "3.1",
    title: "Construction Regulations Compliance",
    description: "Obligations under the Construction Regulations (2014) issued under the OHS Act. Duties of clients, designers, and construction managers regarding health and safety on construction sites.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.2",
    title: "Health and Safety Specifications",
    description: "Requirements for preparing and maintaining health and safety specifications for construction projects. Content requirements, review procedures, and communication to contractors.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.3",
    title: "Health and Safety Plans",
    description: "Standards for reviewing and approving contractor health and safety plans. Assessment criteria, ongoing monitoring requirements, and non-compliance procedures.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.4",
    title: "Fall Protection and Hazardous Work",
    description: "Specific requirements for managing fall protection, excavation safety, demolition work, working over water, and other high-risk construction activities.",
  },

  // ── Chapter 4: Professional Conduct ──
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Competence and Due Diligence",
    description: "Registered persons shall perform work only in areas of competence, exercise due care and diligence, and maintain knowledge at a level enabling competent professional service in construction management.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Integrity and Public Interest",
    description: "Obligations to act with integrity, prioritise public safety and welfare, avoid conflicts of interest, maintain confidentiality, and report unsafe conditions on construction sites.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.3",
    title: "B-BBEE and Transformation",
    description: "Obligations to support broad-based black economic empowerment in construction, promote transformation, and contribute to skills development and enterprise development in the sector.",
  },

  // ── Chapter 5: CPD Requirements ──
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "CPD Credit System",
    description: "Minimum 25 CPD credits per 5-year cycle for all registered categories. Credits earned through formal learning, informal learning, and developmental activities. Annual declarations required.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Approved CPD Activities",
    description: "Categories of approved CPD activities including industry conferences, technical workshops, formal courses, mentoring, publishing, professional committee participation, and site visits.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Compliance Monitoring",
    description: "SACPCMP's CPD audit process, record-keeping requirements, consequences of non-compliance including suspension of registration, and reinstatement procedures.",
  },

  // ── Chapter 6: Disciplinary Procedures ──
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Complaints and Investigation",
    description: "Process for lodging complaints of improper conduct, initial assessment by the Investigating Committee, evidence gathering, and the respondent's rights during investigation.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Disciplinary Hearing",
    description: "Composition of the Disciplinary Tribunal, hearing procedures, burden of proof, right to legal representation, and standards for findings of improper conduct.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.3",
    title: "Penalties and Appeals",
    description: "Penalties including caution, reprimand, suspension or cancellation of registration, and fines. Publication of findings. Appeal procedures to the Council and courts.",
  },

  // ── Chapter 7: Construction Project Management Standards ──
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Stakeholder Management",
    description: "Standards for identifying, analysing, and managing stakeholders on construction projects. Communication plans, engagement strategies, and conflict resolution mechanisms.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Risk Management in Construction",
    description: "Requirements for construction risk identification, assessment, mitigation planning, and monitoring. Integration of risk management into all project phases from inception to close-out.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "Programme and Schedule Management",
    description: "Standards for construction programme development, critical path analysis, schedule monitoring, delay analysis, extension of time assessment, and schedule recovery planning.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.4",
    title: "Close-out and Handover",
    description: "Standards for construction project close-out including practical completion, defects liability management, as-built documentation, lessons learned, and formal handover procedures.",
  },
]
