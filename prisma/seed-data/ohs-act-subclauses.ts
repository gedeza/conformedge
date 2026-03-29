import type { SubClauseData } from "../seed"

/**
 * OHS Act — Occupational Health and Safety Act (Act 85 of 1993)
 * South African statutory framework for workplace health and safety.
 * Applies to ALL workplaces except mines (which fall under MHSA).
 *
 * Structure follows the Act's sections grouped into logical chapters.
 * Top-level clauses defined in seed.ts STANDARD_CLAUSES.
 */
export const OHS_ACT_SUB_CLAUSES: SubClauseData[] = [
  // ── Section 1: Definitions and Application ──
  {
    parentClauseNumber: "1",
    clauseNumber: "1.1",
    title: "Definitions",
    description: "Key terms: 'employer', 'employee', 'workplace', 'health and safety representative', 'chief inspector', 'major incident', 'biological agent', 'hazardous chemical substance'.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.2",
    title: "Application of Act",
    description: "Applies to every employer, employee, self-employed person, and workplace. Excludes mines (governed by MHSA). Minister may exempt certain categories.",
  },

  // ── Section 2: General Duties of Employers ──
  {
    parentClauseNumber: "2",
    clauseNumber: "2.1",
    title: "Section 8 — General duties of employers",
    description: "Every employer shall provide and maintain a working environment that is safe and without risk to the health of employees, including provision of information, instruction, training, and supervision.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.2",
    title: "Section 9 — General duties regarding premises",
    description: "Every person who designs, manufactures, imports, sells, or uses plant or machinery shall ensure it is safe and without risk when properly used.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.3",
    title: "Section 10 — General duties of employees",
    description: "Every employee shall take reasonable care for the health and safety of themselves and others, cooperate with employer, carry out lawful orders, and report unsafe conditions.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.4",
    title: "Section 14 — Duty not to interfere with safety",
    description: "No person shall intentionally or recklessly interfere with, misuse, or damage anything provided in the interest of health or safety.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.5",
    title: "Section 15 — Duty to inform",
    description: "Employers shall inform health and safety representatives and committee of inspections, investigations, formal inquiries, and incidents.",
  },

  // ── Section 3: Mandatory Agreements & Appointments ──
  {
    parentClauseNumber: "3",
    clauseNumber: "3.1",
    title: "Section 16(1) — CEO responsibility",
    description: "The chief executive officer shall ensure that duties of the employer are properly discharged. Overall accountability for health and safety.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.2",
    title: "Section 16(2) — Competent person appointment",
    description: "Assign health and safety duties to competent persons. Written appointment required specifying scope and responsibilities. Appointed person must have authority and resources.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.3",
    title: "Section 37(1) — Employer liability for contractors",
    description: "Every employer shall ensure that persons other than employees on the premises are not exposed to hazards. Employer liable unless Section 37(2) agreement in place.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.4",
    title: "Section 37(2) — Mandatory agreement with mandatary",
    description: "Written agreement where a mandatary (contractor) accepts full responsibility for OHS compliance on the employer's premises. Must specify scope of work, duration, and safety arrangements. Without this agreement, the employer (Section 37(1) principal) remains liable for contractor safety.",
  },

  // ── Section 4: Health and Safety Representatives ──
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Section 17 — Designation of health and safety representatives",
    description: "Every employer with 20+ employees shall designate health and safety representatives. Number determined by inspector or agreement. Representatives elected by employees in their section.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Section 18 — Functions of H&S representatives",
    description: "Review workplace effectiveness of health and safety measures, identify potential hazards, investigate incidents, inspect the workplace, and make representations to the employer.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.3",
    title: "Section 19 — Health and safety committees",
    description: "Employer with 2+ H&S representatives shall establish health and safety committee(s). Committee meets at least quarterly. Reviews workplace health and safety, makes recommendations, discusses incidents.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.4",
    title: "Section 20 — Powers of health and safety committees",
    description: "Committee may make recommendations regarding health and safety to the employer, who shall consider and respond within a reasonable time.",
  },

  // ── Section 5: Incident Reporting ──
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Section 24 — Report to inspector regarding incidents",
    description: "Employer shall report to an inspector any incident resulting in: (a) death of a person, (b) an injury requiring medical treatment beyond first aid, (c) illness diagnosed as arising from workplace exposure. Report without delay.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Section 24(3) — Scene preservation",
    description: "No person shall disturb the scene of an incident until the inspector has completed their investigation, except to prevent further injury, save life, or restore essential services.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Section 25 — Report to chief inspector regarding major incidents",
    description: "Where a major incident occurs at a major hazard installation, the employer shall report to the chief inspector and provide a detailed investigation report.",
  },

  // ── Section 6: Inspectors and Enforcement ──
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Section 28 — Powers of inspectors",
    description: "Inspector may enter any workplace at any reasonable time, question persons, examine documents, take samples, and seize articles for examination or evidence.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Section 29 — Prohibition notice",
    description: "Inspector may issue a prohibition notice if there is a threat to the health or safety of persons. Activity must cease until the threat is removed.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.3",
    title: "Section 30 — Improvement notice",
    description: "Inspector may issue an improvement notice requiring employer to remedy a contravention within a specified period.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.4",
    title: "Section 31 — Formal inquiries",
    description: "Chief inspector may direct a formal inquiry into any incident, health hazard, or matter affecting safety. Inquiry conducted by an inspector or a person appointed by the Minister.",
  },

  // ── Section 7: Regulations ──
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "General Safety Regulations",
    description: "Regulations governing housekeeping, stacking and storage, fire precautions, electrical safety, personal protective equipment, and general workplace conditions.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "General Administrative Regulations",
    description: "Record-keeping, risk assessments, report formats, registration of premises, and administrative requirements for compliance demonstration.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "Construction Regulations (2014)",
    description: "Specific regulations for construction work: health and safety specifications, plans, fall protection, excavations, demolition, scaffolding, and contractor management on construction sites.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.4",
    title: "Driven Machinery Regulations",
    description: "Requirements for safeguarding of machinery, maintenance, inspection, operator competency, and safe use of power presses, woodworking machines, and other driven machinery.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.5",
    title: "Hazardous Chemical Substances Regulations",
    description: "Assessment of exposure, occupational exposure limits, engineering controls, PPE, health surveillance, and emergency procedures for hazardous chemical substances.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.6",
    title: "Noise-Induced Hearing Loss Regulations (2024)",
    description: "Noise exposure limits (85 dBA), noise assessments, audiometric testing, hearing conservation programmes, and noise zones. Effective 2025 — replaces 1984 regulations.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.7",
    title: "Physical Agents Regulations (2025)",
    description: "Replaces Environmental Regulations for Workplaces (1987). Covers heat stress, cold stress, vibration, non-ionising radiation exposure limits and monitoring.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.8",
    title: "Pressure Equipment Regulations",
    description: "Design, manufacture, inspection, and use of pressure vessels, steam generators, and gas containers. Registration and inspection requirements.",
  },

  // ── Section 8: Offences and Penalties ──
  {
    parentClauseNumber: "8",
    clauseNumber: "8.1",
    title: "Section 38 — Offences",
    description: "Any person who contravenes or fails to comply with any provision of the Act or regulations is guilty of an offence.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.2",
    title: "Section 38 — Penalties",
    description: "Penalties include a fine, imprisonment not exceeding 2 years, or both. For continuing offences, additional fines per day. Directors and officers may be personally liable.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.3",
    title: "Section 39 — Vicarious liability",
    description: "An employer is liable for acts or omissions of its managers, agents, or employees acting within the scope of their authority or employment.",
  },
]
