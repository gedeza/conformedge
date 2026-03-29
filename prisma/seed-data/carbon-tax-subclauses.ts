import type { SubClauseData } from "../seed"

/**
 * Carbon Tax Act — (Act 15 of 2019)
 * South African carbon tax legislation for greenhouse gas emissions.
 * Phase 2 effective January 2026 with mandatory carbon budgets.
 *
 * Structure follows the Act's sections and Phase 2 amendments.
 * Top-level clauses defined in seed.ts STANDARD_CLAUSES.
 */
export const CARBON_TAX_SUB_CLAUSES: SubClauseData[] = [
  // ── Chapter 1: Definitions and Scope ──
  {
    parentClauseNumber: "1",
    clauseNumber: "1.1",
    title: "Definitions",
    description: "Key terms: 'greenhouse gas', 'carbon dioxide equivalent (CO2e)', 'carbon budget', 'tax-free allowance', 'carbon offset', 'taxpayer', 'fuel combustion', 'industrial process', 'fugitive emissions'.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.2",
    title: "Scope and application",
    description: "Applies to entities conducting activities resulting in GHG emissions above prescribed thresholds. Entities must be registered as customs and excise manufacturing warehouses with SARS.",
  },

  // ── Chapter 2: Tax Base and Rates ──
  {
    parentClauseNumber: "2",
    clauseNumber: "2.1",
    title: "Section 4 — Levy of carbon tax",
    description: "Tax levied on total GHG emissions of a taxpayer, expressed in tonnes of CO2 equivalent. Includes Scope 1 (direct) emissions from fuel combustion, industrial processes, and fugitive emissions.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.2",
    title: "Tax rate",
    description: "R236/tCO2e effective January 2025. Phase 2 (from January 2026): rate escalates annually — R308/tCO2e in 2026, rising to approximately R462/tCO2e by 2030. Rate increase linked to CPI + 2%.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.3",
    title: "GHG emissions covered",
    description: "Carbon dioxide (CO2), methane (CH4), nitrous oxide (N2O), perfluorocarbons (PFCs), hydrofluorocarbons (HFCs), sulphur hexafluoride (SF6), and nitrogen trifluoride (NF3).",
  },

  // ── Chapter 3: Tax-Free Allowances ──
  {
    parentClauseNumber: "3",
    clauseNumber: "3.1",
    title: "Section 7 — Basic tax-free allowance",
    description: "60% basic tax-free allowance until end of 2025. Phase 2: decreases by 10 percentage points in 2026 (to 50%), then by 2.5 percentage points annually thereafter.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.2",
    title: "Process and fugitive emissions allowance",
    description: "Additional 10% allowance for process and fugitive emissions (hard-to-abate sectors including aluminium, cement, steel, glass, ceramics). Retained in Phase 2.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.3",
    title: "Trade exposure allowance",
    description: "Up to 10% allowance for sectors with significant international trade exposure. Protects competitiveness of export-oriented industries. Reviewed annually.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.4",
    title: "Performance allowance",
    description: "Up to 5% for entities performing better than the sector benchmark (emissions intensity). Based on comparison with sector average or best available technology.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.5",
    title: "Carbon budget allowance (Phase 1)",
    description: "5% allowance for participating in the carbon budget system. Phase 2: entirely phased out from January 2026. Non-participation now carries penalty rather than forfeiting bonus.",
  },

  // ── Chapter 4: Carbon Offsets ──
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Carbon offset allowance",
    description: "Taxpayers may reduce tax liability by purchasing carbon offsets. Phase 2: allowance increased to 20-25% (up from 5-10% in Phase 1). Offsets must be from approved South African projects.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Eligible offset projects",
    description: "Projects must be registered under approved standards (VCS, Gold Standard, CDM). Must be located in South Africa. Must demonstrate additionality and permanence. Energy efficiency and renewable energy projects common.",
  },

  // ── Chapter 5: Carbon Budgets (Phase 2) ──
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Mandatory carbon budget registration",
    description: "Phase 2 (from January 2026): entities above prescribed thresholds must register for a company-level carbon budget. Registration with DFFE (Department of Forestry, Fisheries and Environment).",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Carbon budget determination",
    description: "Company-level budget set based on historical emissions, sector pathway, and national mitigation targets. Budget covers 5-year commitment period aligned with National Climate Change Response.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Carbon budget exceedance penalty",
    description: "Emissions exceeding the carbon budget are taxed at R640/tCO2e — nearly 3x the base rate. Creates strong financial incentive to stay within budget allocation.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.4",
    title: "Mitigation plans",
    description: "Entities with carbon budgets must prepare and submit annual mitigation plans to DFFE. Plans must describe actions to reduce emissions toward budget targets.",
  },

  // ── Chapter 6: Reporting and Filing ──
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "GHG emissions reporting (SAGERS)",
    description: "Annual emissions report via South African Greenhouse Gas Emissions Reporting System (SAGERS). Due 31 March for preceding calendar year. Reporting follows IPCC guidelines and SA-specific emission factors.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Tax filing and payment",
    description: "Carbon tax return filed via SARS eFiling. Due 31 July for preceding calendar year emissions. Payment accompanies the return. Customs and excise framework applies.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.3",
    title: "Scope 1 emission calculation",
    description: "Direct emissions from fuel combustion (stationary and mobile), industrial processes, fugitive emissions, and waste treatment. Calculation methods: tier 1 (emission factors), tier 2 (country-specific), tier 3 (facility measurement).",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.4",
    title: "Verification",
    description: "Emissions data subject to third-party verification. Verification standard and accreditation requirements set by DFFE. Mandatory for entities with emissions above specified thresholds.",
  },

  // ── Chapter 7: Incentives and Transition ──
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Section 12L — Energy efficiency savings (expires Dec 2025)",
    description: "Tax deduction of R0.95/kWh for verified energy efficiency savings. Section 12L incentive expires 31 December 2025 and is not renewed in Phase 2.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Revenue recycling",
    description: "Carbon tax revenue recycled through: electricity price reduction via reduced electricity levy, credit for renewable energy premium, and energy efficiency tax incentives.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "Just transition considerations",
    description: "Phase 2 design considers impact on emissions-intensive industries and workers. Transition support mechanisms, skills development, and economic diversification funding.",
  },
]
