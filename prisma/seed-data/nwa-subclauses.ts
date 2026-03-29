import type { SubClauseData } from "../seed"

/**
 * NWA — National Water Act (Act 36 of 1998)
 * South African water resource management legislation.
 * Governs water use authorisation, pollution prevention,
 * and water resource protection.
 *
 * Structure follows the Act's chapters.
 * Top-level clauses defined in seed.ts STANDARD_CLAUSES.
 */
export const NWA_SUB_CLAUSES: SubClauseData[] = [
  // ── Chapter 1: Interpretation and Fundamental Principles ──
  {
    parentClauseNumber: "1",
    clauseNumber: "1.1",
    title: "Definitions",
    description: "Key terms: 'water resource', 'watercourse', 'pollution', 'waste', 'water use', 'catchment', 'aquifer'. Water includes surface water, groundwater, and coastal water.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.2",
    title: "Section 3 — Public trusteeship of water resources",
    description: "National Government is the public trustee of the nation's water resources. No person may own water resources. Use is subject to authorisation under the Act.",
  },

  // ── Chapter 2: Water Management Strategy ──
  {
    parentClauseNumber: "2",
    clauseNumber: "2.1",
    title: "National Water Resource Strategy",
    description: "Framework for protection, use, development, conservation, management, and control of water resources. Includes water allocation and resource quality objectives.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.2",
    title: "Catchment management strategies",
    description: "Developed by catchment management agencies. Must give effect to the national strategy. Sets water allocation priorities and resource management plans for each water management area.",
  },

  // ── Chapter 3: Protection of Water Resources ──
  {
    parentClauseNumber: "3",
    clauseNumber: "3.1",
    title: "Section 12 — Classification of water resources",
    description: "Minister must establish a system for classifying water resources. Classification determines the resource quality objectives and ecological Reserve requirements.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.2",
    title: "Section 16 — Resource quality objectives",
    description: "Quantitative description of desired water resource conditions. Includes quantity, quality, habitat integrity, and aquatic ecosystem health. Once set, all water uses must respect these objectives.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.3",
    title: "Section 17 — The Reserve",
    description: "Quantity and quality of water required to satisfy basic human needs and protect aquatic ecosystems. The Reserve has priority over all other water uses (except Schedule 1).",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.4",
    title: "Section 19 — Pollution prevention",
    description: "Owner, controller, occupier, or user of land must take reasonable measures to prevent pollution of water resources occurring on that land. Applies to current pollution and potential future pollution. Competent authority may direct remedial measures.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.5",
    title: "Section 20 — Emergency pollution incidents",
    description: "Person responsible for emergency incident involving water pollution must take steps to contain and minimise effects, undertake clean-up, and report to Department and relevant catchment management agency.",
  },

  // ── Chapter 4: Water Use ──
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Section 21 — Water uses requiring authorisation",
    description: "Eleven categories of water use under Section 21: (a) taking water, (b) storing water, (c) impeding/diverting flow, (d) engaging in stream bed/bank activities, (e) engaging in controlled activities, (f) discharging waste/effluent, (g) disposing of waste that may impact water, (h) disposing of waste for hydraulic purposes, (i) altering watercourse characteristics, (j) removing/discharge from underground water, (k) using water for recreational purposes.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Schedule 1 — Permissible water use",
    description: "Water use that does not require authorisation: reasonable domestic use, small-scale gardening (non-commercial), watering livestock (non-feedlot), recreational use, emergency firefighting.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.3",
    title: "General Authorisations",
    description: "Water uses below prescribed thresholds may be exercised under General Authorisations (GN R398 / GN R399). No individual application required but must register and comply with conditions.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.4",
    title: "Water Use Licence (WUL) application",
    description: "Water uses exceeding General Authorisation thresholds require a Water Use Licence. Application to responsible authority with detailed water use description, impact assessment, and proposed mitigation.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.5",
    title: "Section 29 — Conditions of water use authorisation",
    description: "Conditions may include: monitoring, return flow quality limits, metering, reporting, financial security, rehabilitation, time limits, and compliance with resource quality objectives.",
  },

  // ── Chapter 5: Monitoring and Compliance ──
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Section 137 — Monitoring by water users",
    description: "Persons authorised to use water must monitor water use, effluent quality, and impact on water resources as conditions of authorisation. Records must be maintained and made available on request.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Regulation 3630 — Qualified oversight",
    description: "Water treatment works (including private industrial wastewater treatment) must be supervised by process controllers classified per Regulation 2834. Competent oversight is a legal requirement.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Compliance monitoring and enforcement",
    description: "Authorised persons may enter premises, take samples, inspect works. Non-compliance with WUL conditions may result in directive, fine, imprisonment (up to 5 years first offence), or licence revocation.",
  },

  // ── Chapter 6: Financial Provisions ──
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Water use charges",
    description: "Minister may establish a pricing strategy for water use. Charges may include: raw water tariff, waste discharge charge, and water resource management charge. Revenue funds water infrastructure and management.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Financial provision for rehabilitation",
    description: "Responsible authority may require financial security (guarantee or deposit) to ensure rehabilitation of water resources after cessation of water use activities.",
  },

  // ── Chapter 7: Offences and Penalties ──
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Section 151 — Offences",
    description: "Offences include: using water without authorisation, contravening licence conditions, failing to comply with directive, obstructing officials, providing false information, pollution of water resources.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Section 151(2) — Penalties",
    description: "Penalties: fine, imprisonment up to 5 years (first offence), or both. For continuing offences, additional daily fines. Second and subsequent offences: up to 10 years imprisonment.",
  },
]
