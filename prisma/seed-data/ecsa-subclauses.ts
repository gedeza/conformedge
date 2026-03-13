import type { SubClauseData } from "../seed"

/**
 * ECSA — Engineering Council of South Africa (Act 46 of 2000)
 * Professional regulatory framework for engineering practitioners.
 *
 * Structure follows the Act's chapters and key regulatory areas.
 * Top-level clauses defined in seed.ts STANDARD_CLAUSES.
 */
export const ECSA_SUB_CLAUSES: SubClauseData[] = [
  // ── Chapter 1: Registration Categories ──
  {
    parentClauseNumber: "1",
    clauseNumber: "1.1",
    title: "Professional Engineer (Pr Eng)",
    description: "Requirements for registration as a Professional Engineer including academic qualifications (accredited 4-year BEng/BSc Eng), 3 years post-qualification experience, professional competency assessment, and commitment to CPD.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.2",
    title: "Professional Engineering Technologist (Pr Tech Eng)",
    description: "Requirements for registration as a Professional Engineering Technologist including accredited BTech/BEngTech qualification, 3 years post-qualification experience, and demonstrated competence in technology application.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.3",
    title: "Professional Certificated Engineer (Pr Cert Eng)",
    description: "Requirements for registration as a Professional Certificated Engineer including Government Certificate of Competency and demonstrated professional competence in the relevant discipline.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.4",
    title: "Professional Engineering Technician (Pr Techni Eng)",
    description: "Requirements for registration as a Professional Engineering Technician including accredited National Diploma, 3 years post-qualification experience, and demonstrated technical competence.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.5",
    title: "Candidate Registration",
    description: "Provisions for candidate registration categories enabling graduates to gain supervised experience toward professional registration, including training and mentoring requirements.",
  },

  // ── Chapter 2: CPD Requirements ──
  {
    parentClauseNumber: "2",
    clauseNumber: "2.1",
    title: "CPD Credit System",
    description: "Minimum 25 CPD credits per 5-year cycle. Credits earned through structured learning (Category 1), informal learning (Category 2), and developmental activities (Category 3). At least 5 credits must be Category 1.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.2",
    title: "Record Keeping and Auditing",
    description: "Registered persons must maintain detailed CPD records including evidence of activities undertaken. ECSA conducts random audits of CPD compliance. Failure to comply may result in deregistration.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.3",
    title: "CPD Activity Categories",
    description: "Approved CPD activities include conferences, seminars, workshops, formal courses, mentoring, technical publications, professional service on committees, and self-directed learning with assessment.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.4",
    title: "Exemptions and Extensions",
    description: "Provisions for CPD exemptions or extensions due to illness, maternity/paternity, unemployment, or other extenuating circumstances. Application process and supporting documentation requirements.",
  },

  // ── Chapter 3: Rules of Conduct ──
  {
    parentClauseNumber: "3",
    clauseNumber: "3.1",
    title: "Competence and Due Care",
    description: "Registered persons shall perform work only in areas of their competence, exercise due care and diligence, and maintain their knowledge and skill at a level that enables them to render competent professional service.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.2",
    title: "Integrity and Honesty",
    description: "Registered persons shall act with integrity, avoid deceptive conduct, not knowingly make false statements, and disclose any conflicts of interest to all affected parties.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.3",
    title: "Public Interest and Safety",
    description: "Registered persons shall have due regard for public health, safety and the environment, report conditions that endanger the public, and not participate in activities that compromise public welfare.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.4",
    title: "Professional Relationships",
    description: "Conduct governing relationships with clients, employers, colleagues, and other professionals. Obligations of confidentiality, fair dealing, and avoidance of unfair competition.",
  },

  // ── Chapter 4: Code of Professional Practice ──
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Professional Responsibilities",
    description: "Standards of professional responsibility including adequate investigation before undertaking work, proper documentation, independent judgment, and notification of limitations in competence.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Fees and Remuneration",
    description: "Guidelines for professional fees, ensuring fair compensation for engineering services. Fee structures must be transparent and commensurate with the scope and complexity of work undertaken.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.3",
    title: "Advertising and Marketing",
    description: "Rules governing advertising of engineering services, prohibiting misleading claims, ensuring factual representation of qualifications and experience, and maintaining professional dignity.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.4",
    title: "Professional Indemnity",
    description: "Requirements for professional indemnity insurance, liability provisions, and obligations to inform clients of insurance coverage and any limitations on liability.",
  },

  // ── Chapter 5: Disciplinary Procedures ──
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Complaints and Investigation",
    description: "Process for lodging complaints against registered persons, initial assessment by the Investigating Committee, gathering of evidence, and the respondent's right to respond.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Disciplinary Tribunal",
    description: "Composition and powers of the Disciplinary Tribunal. Hearing procedures, burden of proof, right to legal representation, and standards of evidence required for findings of improper conduct.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Penalties and Sanctions",
    description: "Penalties including caution, reprimand, suspension, cancellation of registration, and fines up to R500,000. Publication of findings and appeal procedures to the Council or courts.",
  },

  // ── Chapter 6: Practice Standards ──
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Design and Documentation Standards",
    description: "Standards for engineering design documentation, calculations, specifications, and drawings. Requirements for review, verification, and approval processes in engineering design.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Construction Monitoring",
    description: "Standards for monitoring construction and manufacturing processes to ensure compliance with design intent. Inspection, testing, and reporting requirements during implementation.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.3",
    title: "Risk Management in Engineering",
    description: "Requirements for identifying, assessing, and managing engineering risks throughout the project lifecycle. Integration of risk-based thinking in all engineering decisions.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.4",
    title: "Environmental Sustainability",
    description: "Obligations to consider environmental impact in engineering practice, promote sustainable development, and apply lifecycle assessment principles in engineering decisions.",
  },

  // ── Chapter 7: Identification of Engineering Work ──
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Engineering Work Categories",
    description: "Definition and categorisation of engineering work that must be performed by or under the supervision of registered persons. Distinction between engineering and non-engineering work.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Supervision Requirements",
    description: "Requirements for adequate professional supervision of engineering work, including the level of supervision required based on complexity, risk, and the qualifications of persons performing the work.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "Signing Off and Taking Responsibility",
    description: "Requirements for registered persons to take professional responsibility for engineering work by signing off on designs, reports, and other deliverables. Implications of signing responsibility.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.4",
    title: "Identification of Work Regulations",
    description: "Regulations promulgated under Section 18(1)(c) of the Act identifying categories of engineering work reserved for registered persons. Enforcement mechanisms and transitional provisions.",
  },
]
