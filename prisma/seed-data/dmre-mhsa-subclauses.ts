import type { SubClauseData } from "../seed"

/**
 * DMRE — Mine Health and Safety Act (Act 29 of 1996)
 * South African regulatory framework for mining sector compliance.
 *
 * Structure follows the Act's chapters and sections.
 * Top-level clauses defined in seed.ts STANDARD_CLAUSES.
 */
export const DMRE_MHSA_SUB_CLAUSES: SubClauseData[] = [
  // ── Chapter 1: Definitions and Application ──
  {
    parentClauseNumber: "1",
    clauseNumber: "1.1",
    title: "Definitions",
    description: "Definitions of key terms used throughout the Act including 'mine', 'employer', 'employee', 'health and safety representative', 'occupational disease', 'serious injury', and other relevant terms.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.2",
    title: "Application of Act",
    description: "The Act applies to all mines, mining areas, and works as defined. Determine applicability to specific operations, including surface and underground workings, processing plants, and associated infrastructure.",
  },

  // ── Chapter 2: Health and Safety at Mines ──
  {
    parentClauseNumber: "2",
    clauseNumber: "2.1",
    title: "Employer duties — general health and safety",
    description: "Every employer shall ensure, as far as reasonably practicable, that the mine is designed, constructed, equipped, and operated so that employees can perform their work without endangering their health and safety or that of any other person.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.2",
    title: "Employer duties — risk assessment",
    description: "Assess and respond to risks to health and safety. Identify hazards, assess risks, record significant findings, implement control measures following the hierarchy of controls, and review assessments when circumstances change.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.3",
    title: "Employer duties — codes of practice",
    description: "Prepare and implement mandatory codes of practice (COPs) on significant health and safety matters. COPs must be developed in consultation with health and safety representatives and reviewed at least every two years.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.4",
    title: "Employee duties",
    description: "Every employee shall take reasonable care to protect their own health and safety and that of others. Report unsafe conditions, comply with health and safety measures, and cooperate with the employer's compliance obligations.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.5",
    title: "Appointment of managers and competent persons",
    description: "Appoint a manager responsible for health and safety at the mine. Ensure competent persons are appointed for specific functions including mine overseer, shift supervisor, engineer, and occupational health practitioner.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.6",
    title: "Health and safety policy",
    description: "Establish and maintain a written health and safety policy. The policy must be communicated to all employees, displayed prominently at the mine, and reviewed periodically to ensure it remains current and effective.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.7",
    title: "Occupational hygiene and health surveillance",
    description: "Implement occupational hygiene programmes to measure and control exposure to health hazards. Conduct medical surveillance of employees exposed to identified health risks including dust, noise, radiation, and chemical agents.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.8",
    title: "Emergency preparedness and response",
    description: "Develop and maintain emergency procedures for foreseeable emergencies. Conduct regular drills, ensure availability of rescue equipment, establish communication systems, and maintain emergency response teams.",
  },

  // ── Chapter 3: Tripartite Institutions ──
  {
    parentClauseNumber: "3",
    clauseNumber: "3.1",
    title: "Mine Health and Safety Council",
    description: "The MHSC advises the Minister on health and safety legislation and research. Coordinate implementation of the Act, promote health and safety culture, and review the state of health and safety at mines.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.2",
    title: "Health and safety committees",
    description: "Establish health and safety committees at every mine with more than 20 employees. Committees comprise employer and employee representatives and must meet at least once every three months.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.3",
    title: "Health and safety representatives",
    description: "Employees shall elect health and safety representatives. Representatives have the right to inspect the workplace, participate in investigations, attend committee meetings, and make representations to the employer on health and safety matters.",
  },

  // ── Chapter 4: Officers and Inspections ──
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Chief Inspector of Mines",
    description: "The Chief Inspector oversees mine health and safety enforcement nationally. Powers include entering and inspecting mines, issuing instructions and prohibition notices, and conducting investigations into accidents and incidents.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Inspectors and inspection powers",
    description: "Inspectors may enter any mine at any reasonable time, examine documents and records, take samples, interview persons, and issue compliance instructions. Mine operators must cooperate fully with inspections.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.3",
    title: "Prohibition and improvement notices",
    description: "Inspectors may issue prohibition notices to stop dangerous activities immediately, or improvement notices requiring corrective action within a specified timeframe. Failure to comply constitutes a criminal offence.",
  },

  // ── Chapter 5: Incidents and Reporting ──
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Reporting of incidents and accidents",
    description: "Report all incidents, injuries, occupational diseases, and dangerous occurrences to the Chief Inspector. Fatal and serious incidents must be reported immediately. Preserve the scene of any fatal or serious accident.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Investigation of incidents",
    description: "Investigate all accidents and incidents to determine root causes and prevent recurrence. Maintain investigation records, implement corrective actions, and communicate findings to affected persons and the Inspector.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Occupational disease reporting",
    description: "Report all cases of occupational disease including silicosis, noise-induced hearing loss, and other mining-related conditions. Maintain a register of occupational diseases and health surveillance records.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.4",
    title: "Record-keeping and statistics",
    description: "Maintain comprehensive records of all health and safety incidents, injuries, diseases, dangerous occurrences, and near-misses. Submit periodic statistical returns to the DMRE as prescribed.",
  },

  // ── Chapter 6: Regulations and Standards ──
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Mandatory codes of practice",
    description: "Develop mandatory COPs for: rockfall and rockburst, fire prevention, flammable gas, rail-bound transport, explosives and blasting, electrical safety, noise, dust, and other prescribed matters.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Mine design and ventilation",
    description: "Ensure mine design and ventilation systems comply with prescribed standards. Maintain adequate ventilation to control airborne pollutants, temperature, and humidity. Monitor ventilation effectiveness continuously.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.3",
    title: "Ground control and support",
    description: "Implement ground control measures appropriate to geological conditions. Conduct geotechnical assessments, install support systems, monitor ground movement, and establish exclusion zones where necessary.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.4",
    title: "Machinery and equipment safety",
    description: "Ensure all machinery and equipment is designed, installed, maintained, and operated safely. Conduct regular inspections, implement lockout/tagout procedures, and maintain equipment registers.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.5",
    title: "Personal protective equipment",
    description: "Provide appropriate PPE where hazards cannot be adequately controlled by other means. Ensure PPE is fit-for-purpose, maintained, and employees are trained in its correct use and limitations.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.6",
    title: "Training and competency requirements",
    description: "Ensure all employees and contractors receive appropriate health and safety training. Maintain training records, assess competency, and provide refresher training as required by regulations.",
  },

  // ── Chapter 7: Offences and Penalties ──
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Offences under the Act",
    description: "Define offences including failure to comply with the Act, obstructing inspectors, falsifying records, and failing to report incidents. Both employers and individuals may be held criminally liable.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Penalties and enforcement",
    description: "Penalties include fines and imprisonment. The court may also order remedial measures. Administrative penalties may be imposed by the Chief Inspector for less serious contraventions.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "Director and officer liability",
    description: "Directors, managers, and officers may be held personally liable for offences committed by the company if the offence was committed with their consent, connivance, or due to their negligence.",
  },

  // ── Chapter 8: General Provisions ──
  {
    parentClauseNumber: "8",
    clauseNumber: "8.1",
    title: "Compensation for occupational injuries and diseases",
    description: "Employees who suffer occupational injuries or contract occupational diseases are entitled to compensation under the Compensation for Occupational Injuries and Diseases Act (COIDA). Employers must register with the Compensation Fund.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.2",
    title: "Rehabilitation and return to work",
    description: "Implement rehabilitation programmes for injured or ill employees. Assess fitness to work, provide alternative duties where possible, and support return-to-work processes in accordance with the Act.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.3",
    title: "Contractor management",
    description: "Ensure contractors and subcontractors comply with the Act and mine health and safety requirements. Include health and safety requirements in contracts, monitor contractor performance, and maintain oversight of contractor activities.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.4",
    title: "Environmental management",
    description: "Manage environmental impacts of mining operations including dust suppression, water management, waste disposal, and rehabilitation of mined areas. Comply with concurrent environmental legislation requirements.",
  },
]
