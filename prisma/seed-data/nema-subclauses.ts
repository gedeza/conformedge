import type { SubClauseData } from "../seed"

/**
 * NEMA — National Environmental Management Act (Act 107 of 1998)
 * South African principal environmental legislation.
 * Governs environmental impact assessments, duty of care,
 * waste management, air quality, and water.
 *
 * Structure follows the Act's chapters.
 * Top-level clauses defined in seed.ts STANDARD_CLAUSES.
 */
export const NEMA_SUB_CLAUSES: SubClauseData[] = [
  // ── Chapter 1: Principles ──
  {
    parentClauseNumber: "1",
    clauseNumber: "1.1",
    title: "Section 2 — National environmental management principles",
    description: "Environmental management must place people and their needs at the forefront. Development must be socially, environmentally, and economically sustainable. The polluter pays principle applies.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.2",
    title: "Section 2(4)(a) — Sustainable development",
    description: "Sustainable development requires integration of social, economic, and environmental factors in planning, implementation, and evaluation of decisions.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.3",
    title: "Section 2(4)(p) — Precautionary principle",
    description: "A risk-averse and cautious approach shall be applied, which takes into account the limits of current knowledge about the consequences of decisions and actions.",
  },

  // ── Chapter 2: Institutions ──
  {
    parentClauseNumber: "2",
    clauseNumber: "2.1",
    title: "National Environmental Advisory Forum",
    description: "Minister may establish a National Environmental Advisory Forum to advise on environmental management and governance. Includes representatives from all spheres of government and civil society.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.2",
    title: "Committee for Environmental Coordination",
    description: "Coordination of environmental functions across national departments and spheres of government. Promotes integration of environmental management into development planning.",
  },

  // ── Chapter 3: Environmental Planning ──
  {
    parentClauseNumber: "3",
    clauseNumber: "3.1",
    title: "Environmental implementation plans",
    description: "National and provincial government departments must prepare environmental implementation plans describing how their activities affect the environment and measures to ensure compliance.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.2",
    title: "Environmental management plans",
    description: "National and provincial departments exercising environmental functions must prepare environmental management plans describing policies, plans, programmes, and procedures.",
  },

  // ── Chapter 4: Environmental Impact Assessment ──
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Section 24 — Environmental authorisations",
    description: "Listed activities that may significantly affect the environment may not commence without environmental authorisation from the competent authority. Three listing categories with different assessment requirements.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Section 24(2) — Basic Assessment",
    description: "Listing Notice 1 (GN R983) activities require a Basic Assessment Report (BAR). Shorter process — 90-197 days. Includes public participation and specialist input.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.3",
    title: "Section 24(2) — Full Scoping and EIA",
    description: "Listing Notice 2 (GN R984) activities require full Scoping Report and Environmental Impact Assessment Report. Longer process — up to 300+ days. Includes specialist studies, alternatives assessment, public participation.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.4",
    title: "Section 24G — Rectification of unlawful commencement",
    description: "Persons who commenced listed activities without authorisation may apply for rectification. Administrative fine of up to R10 million. Does not guarantee authorisation.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.5",
    title: "Environmental Management Programme (EMPr)",
    description: "Condition of environmental authorisation. Describes mitigation measures, monitoring requirements, rehabilitation plans, and environmental management commitments for the project lifecycle.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.6",
    title: "Environmental Audit Reports",
    description: "Holders of environmental authorisations must conduct compliance audits at intervals specified in their authorisation. Audit reports submitted to competent authority.",
  },

  // ── Chapter 5: Duty of Care ──
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Section 28 — Duty of care and remediation",
    description: "Every person who causes, has caused, or may cause significant pollution or degradation must take reasonable measures to prevent, minimise, and rectify such pollution or degradation. Applies retroactively.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Section 28(4) — Directive from competent authority",
    description: "If a person fails to take required measures, the Director-General may direct the person to commence measures within a specified period. Non-compliance is an offence.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Section 30 — Emergency incidents",
    description: "Responsible person must report emergency incidents (serious threats to public health, safety, or environment) to relevant authorities. Take measures to contain and minimise effects.",
  },

  // ── Chapter 6: Compliance and Enforcement ──
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Section 31A — Environmental management inspectors",
    description: "Minister or MEC may designate environmental management inspectors (Green Scorpions). Powers to enter premises, question persons, take samples, issue compliance notices.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Section 31H — Compliance notices",
    description: "Environmental management inspector may issue a compliance notice requiring cessation of activity, remediation, or containment. Notice specifies actions and timeframes.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.3",
    title: "Section 31L — Admission of guilt fines",
    description: "An environmental management inspector may serve an admission of guilt fine for specified offences. Maximum fine amount set by regulation.",
  },

  // ── Chapter 7: Air Quality (NEM:AQA) ──
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Atmospheric Emission Licence (AEL)",
    description: "Listed activities under Section 21 of NEM:AQA require an Atmospheric Emission Licence from the licensing authority (metropolitan/district municipality). Application includes emission data, control equipment, and monitoring plans.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Air quality monitoring and reporting",
    description: "AEL holders must monitor emissions at specified frequencies, maintain monitoring equipment, and report to the licensing authority. Annual emission reports required.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "National Ambient Air Quality Standards",
    description: "Standards for PM10, PM2.5, SO2, NO2, O3, CO, lead, and benzene. Compliance measured at facility boundary and ambient monitoring stations.",
  },

  // ── Chapter 8: Waste (NEM:WA) ──
  {
    parentClauseNumber: "8",
    clauseNumber: "8.1",
    title: "Waste Management Licence",
    description: "Listed waste management activities require a Waste Management Licence. Includes storage, treatment, and disposal of general and hazardous waste above prescribed thresholds.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.2",
    title: "Waste classification and disposal",
    description: "Waste classified per SANS 10234. Hazardous waste types (H:H, H:h) require specific handling, transport (SANS 10228), and disposal at licensed facilities. Duty of care applies throughout waste lifecycle.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.3",
    title: "Waste information and reporting",
    description: "Generators of significant quantities must register on the South African Waste Information System (SAWIS). Annual waste data reporting required.",
  },

  // ── Chapter 9: Water (NWA integration) ──
  {
    parentClauseNumber: "9",
    clauseNumber: "9.1",
    title: "Integrated water and environmental management",
    description: "NEMA principles apply to water resource management under the National Water Act. Catchment management strategies must align with environmental management principles.",
  },
  {
    parentClauseNumber: "9",
    clauseNumber: "9.2",
    title: "Pollution prevention — water resources",
    description: "Section 19 of NWA (read with NEMA s28): take reasonable measures to prevent pollution of water resources. Applies to current and historical contamination. Includes groundwater protection.",
  },

  // ── Chapter 10: Offences and Penalties ──
  {
    parentClauseNumber: "10",
    clauseNumber: "10.1",
    title: "Section 49A — Offences",
    description: "Offences include: commencing listed activities without authorisation, providing false information, failing to comply with duty of care, obstructing inspectors, failing to comply with compliance notices.",
  },
  {
    parentClauseNumber: "10",
    clauseNumber: "10.2",
    title: "Section 49B — Penalties",
    description: "Penalties: imprisonment up to 10 years, fines up to R10 million, or both. For continuing offences, additional daily fines. Administrative fines up to R10 million for Section 24G rectification.",
  },
  {
    parentClauseNumber: "10",
    clauseNumber: "10.3",
    title: "Section 34 — Director/officer personal liability",
    description: "A director or officer of a juristic person may be held personally liable if they knew or ought to have known of the contravention and failed to take all reasonable steps to prevent it.",
  },
]
