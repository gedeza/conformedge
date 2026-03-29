# ConformEdge Enterprise Gap Analysis — March 2026

**Prepared by:** ISU Technologies (Pty) Ltd
**Date:** 29 March 2026
**Scope:** Platform readiness for Transnet SOE + large SA industrials (Tiger Brands, Hulamin, JSE-listed)

---

## Executive Summary

A comprehensive audit of the ConformEdge codebase against capabilities pitched in the Transnet vendor compliance documents — and expanded to cover the compliance needs of large SA industrial/manufacturing companies — reveals:

| Category | Count | % |
|---|---|---|
| **Fully Built** | 39 capabilities | 74% |
| **Partially Built** | 7 capabilities | 13% |
| **Not Built** | 7 capabilities | 13% |
| **Transnet Readiness** | ~74% | |
| **Broader Enterprise Readiness** | ~55% | |

The architecture is sound (multi-tenant, IMS engine, AI classification, modular standards). The hardest technical problems are solved. Gaps are primarily in SA-specific regulatory tracking, environmental compliance, and enterprise-scale features.

---

## Part 1: Transnet Pitch Verification

### 1.1 Pitch Numbers — Verified

| Claim | Actual | Status |
|---|---|---|
| 36 modules | ~35 pages/routes | Accurate |
| 11 standards | 11 standards (7 ISO + 4 SA regulatory) | Exact |
| 395+ sub-clauses | 403 (118 main + 285 sub) | Exceeds |
| 7 permit types | 7 types (HOT_WORK, CONFINED_SPACE, WORKING_AT_HEIGHTS, ELECTRICAL, EXCAVATION, LIFTING, GENERAL) | Exact |
| 13 WRC templates | 13 templates (294 inspection items) | Exact |
| R2,299 / R5,499 / R8,499 / R16,999 pricing | Matches plans.ts | Verified |
| 3 / 5 / 10 / 25 included users | Matches plans.ts | Verified |
| R399 / R449 / R349 / R299 additional users | Matches plans.ts | Verified |
| 17% annual discount | 16.67% (10/12 months) — rounds to 17% | Accurate |
| Implementation fees (R0/R7,499/R24,499/R49,499) | Not in codebase — marketing/sales collateral only | Not in code |

### 1.2 Fully Built Capabilities (39)

All verified against actual code, Prisma models, and UI components:

| # | Capability | Key Evidence |
|---|---|---|
| 1 | AI Document Classification | Claude Haiku API, `classify-document.ts`, confidence scoring, 30K char processing |
| 2 | 11 Compliance Standards | Seeded: ISO 9001/14001/45001/22301/27001/37001/39001, MHSA, POPIA, ECSA, SACPCMP |
| 3 | IMS Cross-Standard Engine | Union-Find algorithm (`ims-engine.ts`), shared clause detection, gap cascades |
| 4 | Gap Analysis (clause-by-clause) | Per-clause COVERED/PARTIAL/GAP, per-standard %, weighted org-level scoring |
| 5 | Audit Pack Generation | 8-page branded PDF (cover, TOC, summary, documents, assessments, CAPAs, checklists, sign-off) |
| 6 | Audit Pack Email | One-click via Resend with PDF attachment |
| 7 | Incident Management (full lifecycle) | Near-miss → fatality, 7 types, 4-status workflow, 70+ fields |
| 8 | COIDA W.Cl.2 Auto-Generation | PDF from incident data — employer, employee, injury, medical, witness |
| 9 | MHSA Statutory Forms | Section 11, 23, 24 forms + SAPS277 |
| 10 | Fishbone Root Cause Analysis | Interactive Ishikawa diagram, 6 categories, 5-Whys methodology |
| 11 | LTIFR Dashboard | Rolling 12-month, thresholds (good < 0.5, moderate < 1.0, high ≥ 1.0) |
| 12 | Incident Trend Analysis | Monthly stacked area chart by type |
| 13 | Evidence Capture | File upload + live camera, captions, chronological |
| 14 | Witness Statements | Structured records — name, contact, email, statement |
| 15 | Investigation Sign-Off | Manager+ approval for fatalities/serious LTIs |
| 16 | Multi-CAPA from Incidents | Many-to-many junction table |
| 17 | Work Permits (7 types) | All with type-specific guidance rules |
| 18 | Permit Digital Sign-Off | Canvas signature pad, per-item checklist sign-off |
| 19 | Permit Auto-Expiry | Cron job ACTIVE → EXPIRED, 24h warning |
| 20 | Equipment Register | 3-step wizard, 5-status state machine, asset numbering |
| 21 | Calibration Tracking | R2 certificate upload, PASS/FAIL/CONDITIONAL, next-due calculation |
| 22 | CAPA Escalation from Repairs | Auto-creates CORRECTIVE CAPA, maps priority |
| 23 | 13 WRC Inspection Templates | 294 items across lifting machines + accessories, dedicated seed script |
| 24 | Document Approval Workflows | Multi-step sequential, role-based, APPROVE/REJECT/SKIP |
| 25 | Document Version Control | Parent-child chain, full history traversal |
| 26 | Subcontractor Portal | Token-based, self-service cert upload, expiry badges, renewal |
| 27 | Compliance Scoring | Weighted 0-100 (certs 40%, safety 35%, BEE 25%), 5 tiers |
| 28 | Expiry Alerts | Cron checks documents, certs, permits, CAPAs, objectives (30/14/7 day windows) |
| 29 | PWA / Mobile | Service worker, offline fallback, standalone install |
| 30 | Camera + Signatures | Dual camera, JPEG compression, canvas signature pad |
| 31 | Multi-Tenant Org Isolation | Every entity scoped by organizationId, Clerk sync |
| 32 | RBAC (5 roles) | VIEWER → AUDITOR → MANAGER → ADMIN → OWNER |
| 33 | 4 Subscription Tiers | Starter/Professional/Business/Enterprise with feature gating |
| 34 | Billing & Payments | Paystack, EFT, Invoice, Prepaid — usage tracking, credit packs |
| 35 | Objectives & KPI Tracking | Standard-linked, measurement frequency, progress |
| 36 | Management Reviews | Agenda items, attendees, actions, multi-standard |
| 37 | Reports & Analytics | Compliance by standard, CAPA charts, risk distribution, LTIFR, COIDA export |
| 38 | Offline Checklist Sync | IndexedDB queue, 3 actions (toggleCompliance, updateItemResponse, updateItemEvidence) |
| 39 | Notification System | 24 types, IN_APP + EMAIL channels, user preferences, cron-driven |

### 1.3 Partially Built Capabilities (7)

| # | Capability | What Exists | Gap |
|---|---|---|---|
| 1 | **Cross-Divisional Dashboard** | Partner console aggregates users, docs, CAPAs, incidents, health scores across client orgs | No per-standard compliance breakdown, no cross-org LTIFR, no cross-org trends, no export |
| 2 | **BBBEE Certificate Tracking** | `beeLevel` field (1-8), 25% of compliance score, UI in forms/lists/portal | No BBBEE-specific cert type, no level history, no SANAS verification, no scorecard elements |
| 3 | **Training Records** | Documents + Objectives + seed data references | No per-person module, no induction register, no competency matrix |
| 4 | **Offline Sync** | Checklists work offline (3 actions), camera works, IndexedDB queue | Incidents, permits, equipment require connectivity. Zero GPS capture |
| 5 | **Vendor Expiry Alerts** | Cron sends to org OWNER/ADMIN/MANAGER | vendor.contactEmail never used for sending — vendors never receive alerts |
| 6 | **Notification Escalation** | CAPA auto-escalates priority after 7 days overdue; approval workflow chains | No hierarchical "manager → director" escalation, no configurable chains |
| 7 | **Procurement Compliance Reports** | Reports page with charts + CSV | No vendor-specific compliance export, no 80/20 or 90/10 scoring |

### 1.4 Not Built Capabilities (7)

| # | Capability | Impact | Notes |
|---|---|---|---|
| 1 | **Section 37(2) Agreement Tracking** | **CRITICAL** | Zero code — #1 OHS Act liability hook for Transnet pitch |
| 2 | **Section 16(2) Competent Person Appointments** | MEDIUM | Referenced in seed data but no structured tracking |
| 3 | **Environmental Permits (CEMP/NEMA/Water/Waste)** | **HIGH** | Zero CEMP, NEMA, water license, waste permit, environmental officer tracking |
| 4 | **RSR Railway Safety Standard** | MEDIUM | No standard seeded, demo data reference only |
| 5 | **SHE File Template** | MEDIUM | Audit packs exist but no SA-specific SHE file structure |
| 6 | **HIRA Assessment Template** | LOW | Generic assessments work, no HIRA-specific hazard register/risk matrix |
| 7 | **Contractor Pre-Qualification Workflow** | MEDIUM | No tender pre-qual flow |

---

## Part 2: Expanded Enterprise Analysis — SA Industrial Market

### 2.1 Target Companies Analysed

| Company | Sector | Revenue | Employees | Sites | Key Compliance Burden |
|---|---|---|---|---|---|
| **Transnet** | SOE — Transport/Logistics | R70B+ | 50,000+ | Nationwide (6 divisions) | OHS Act, RSR, ISO, BBBEE, NEMA |
| **Tiger Brands** | Food Manufacturing (JSE: TBS) | ~R36B | 10,000+ | 40–50 plants | FSSC 22000, HACCP, NRCS, OHS Act, NEMA, BBBEE |
| **Hulamin** | Aluminium Semi-Fabrication (JSE: HLM) | ~R14B | ~2,000 | 2 major (PMB + Richards Bay) | ISO 45001/14001/9001, IATF 16949, OHS Act, Carbon Tax, NWA |
| **Sasol** | Chemicals/Energy (JSE: SOL) | ~R270B | 29,000+ | Multiple | MHSA, OHS Act, NEMA, Carbon Tax, NWA |
| **ArcelorMittal SA** | Steel (JSE: ACL) | ~R50B | 8,000+ | Multiple | MHSA, OHS Act, ISO, Carbon Tax, NEMA, NWA |
| **PPC** | Cement (JSE: PPC) | ~R12B | 3,000+ | Multiple | OHS Act, ISO, NEMA, Carbon Tax, NWA |
| **WBHO** | Construction (JSE: WBO) | ~R40B | 9,000+ | Project-based | OHS Act, Construction Regs, CIDB, ISO, BBBEE |

### 2.2 Regulatory Frameworks — Current vs Required

| Framework | In ConformEdge? | Who Needs It | Priority |
|---|---|---|---|
| ISO 9001 | Yes | All | — |
| ISO 14001 | Yes | All | — |
| ISO 45001 | Yes | All | — |
| ISO 22301 | Yes | Financial, critical infrastructure | — |
| ISO 27001 | Yes | IT, data-heavy companies | — |
| ISO 37001 | Yes | SOEs, government contractors | — |
| ISO 39001 | Yes | Transport, logistics | — |
| MHSA/DMRE | Yes | Mining operations | — |
| POPIA | Yes | All | — |
| ECSA | Yes | Engineering firms | — |
| SACPCMP | Yes | Construction project managers | — |
| **OHS Act (Act 85/1993)** | **NO** | **ALL non-mining companies** | **CRITICAL** |
| **Carbon Tax Act** | **NO** | Heavy industry, JSE-listed | **HIGH** |
| **National Water Act** | **NO** | ALL manufacturing | **HIGH** |
| **NEMA Air Quality Act** | **NO** | Smelters, manufacturers | **MEDIUM** |
| **NEMA Waste Act** | **NO** | ALL manufacturing | **MEDIUM** |
| **FSSC 22000 / ISO 22000 / HACCP** | **NO** | Food manufacturers | **CRITICAL (sector)** |
| **IATF 16949** | **NO** | Automotive supply chain | **MEDIUM** |
| **King IV Governance** | **NO** | ALL JSE-listed | **LOW-MEDIUM** |
| **ISSB IFRS S1/S2** | **NO** | ALL JSE-listed (mandatory soon) | **LOW (future)** |
| **ASI Performance Standard** | **NO** | Aluminium industry | **LOW (niche)** |
| **NRCS Compulsory Specs** | **NO** | Food, canned goods | **MEDIUM (sector)** |
| **Construction Regulations** | **NO** | Construction companies | **MEDIUM** |

### 2.3 Functional Modules — Current vs Required

| Module | In ConformEdge? | Who Needs It | Priority |
|---|---|---|---|
| AI Document Classification | Yes | All | — |
| Audit Pack Generation | Yes | All | — |
| IMS Cross-Standard Engine | Yes | All multi-standard | — |
| Incident Management (Advanced) | Yes | All | — |
| Work Permits (7 types) | Yes | Construction, industrial | — |
| Equipment & Calibration | Yes | Manufacturing, construction | — |
| Subcontractor Portal | Yes | All with contractors | — |
| Document Approval Workflows | Yes | All | — |
| **Environmental Monitoring Dashboard** | **NO** | All heavy industry | **HIGH** |
| **Carbon/GHG Emissions Tracking** | **NO** | JSE-listed industrials | **HIGH** |
| **BBBEE Scorecard Management** | **Partial** | ALL SA companies | **HIGH** |
| **Multi-Site Hierarchy** | **NO** | Tiger Brands (40+ sites), multi-plant | **HIGH** |
| **Section 37(2) Tracking** | **NO** | ALL non-mining | **CRITICAL** |
| **Training Records Module** | **Partial** | All | **MEDIUM** |
| **Supplier Qualification** | **NO** | Food, manufacturing | **MEDIUM** |
| **Product Recall/Traceability** | **NO** | Food manufacturers | **MEDIUM (sector)** |
| **Regulatory Change Tracking** | **NO** | All enterprise | **LOW-MEDIUM** |
| **ESG/Sustainability Reporting** | **NO** | JSE-listed | **LOW (future)** |
| **Offline Incident Logging + GPS** | **Partial** | Field operations | **MEDIUM** |
| **Vendor Compliance Export** | **NO** | Procurement teams | **MEDIUM** |

---

## Part 3: Competitive Landscape

### 3.1 Key Competitors

| Competitor | HQ | Strengths | Weaknesses |
|---|---|---|---|
| **IsoMetrix** | SA | 25+ years, 100+ countries, 95% retention, mining/metals focus | Expensive (six-figure contracts), opaque pricing, desktop-first, slow innovation |
| **SAP EHS** | Germany | Deep ERP integration (Sasol, ArcelorMittal) | Massively complex, requires SAP ecosystem, R millions to implement |
| **Enablon** (Wolters Kluwer) | France | Global ESG/EHS, enterprise scale | Not SA-focused, no local regulatory knowledge, USD pricing |
| **SafetyCulture/iAuditor** | Australia | Mobile-first, good UX, inspection focus | No SA frameworks, no IMS, no BBBEE, no COIDA |
| **Ariscu** | SA | Contractor management, legal compliance, 18 countries | Narrower scope, no AI, no IMS engine |

### 3.2 ConformEdge Competitive Moats

1. **SA regulatory knowledge built-in** — MHSA, POPIA, ECSA, SACPCMP, COIDA W.Cl.2 native to platform
2. **AI document classification** — unique in SA market, auto-files to standards/clauses
3. **Union-Find IMS engine** — cross-standard gap analysis, shared clause deduplication
4. **Transparent ZAR pricing** — vs IsoMetrix's opaque enterprise-only quotes
5. **Mobile/PWA with offline** — vs desktop-first incumbents
6. **Modern tech stack** — Next.js 15, React, TypeScript vs legacy Java/C#
7. **Rapid iteration** — single developer shipping 36 modules in months vs enterprise vendor timelines

### 3.3 The Sweet Spot — Underserved Mid-Market

> **Companies with R500M–R5B revenue, 500–5,000 employees, 5–20 sites**
> Too big for spreadsheets, too small (or too cost-conscious) for IsoMetrix/SAP EHS

Examples: Hulamin, PPC Cement, Barloworld divisions, mid-tier food manufacturers, Stefanutti Stocks

**SA EHS software market:** ~USD 55.92M (~R1B), growing at 6.3% CAGR. Cloud deployment represents 63% of new implementations globally.

---

## Part 4: Revenue Opportunity

| Segment | Target Companies | Contract Size | Priority |
|---|---|---|---|
| **Transnet** (SOE) | 1 entity, 6 divisions | R40K–R80K/mo | Immediate |
| **SA Construction** (existing focus) | WBHO, Stefanutti, Aveng, M&R | R8.5K–R17K/mo each | Current |
| **Mid-Market Manufacturing** | Hulamin, PPC, Barloworld divisions | R17K–R50K/mo each | Phase B |
| **Food Manufacturing** | Tiger Brands divisions, RCL, Pioneer | R50K–R150K/mo (multi-site) | Phase C |
| **Mining Majors** (via MHSA) | Already positioned | R17K–R50K/mo each | Current |

---

## Part 5: Prioritised Roadmap

### Phase A — Transnet Demo-Ready (Immediate)
1. Section 37(2) Agreement Tracking — model, UI, expiry alerts
2. Cross-Divisional Dashboard Enhancement — compliance drill-downs, cross-org LTIFR, export
3. Vendor Email Alerts — send expiry notifications to vendor contactEmail
4. SHE File Template — audit pack variant for SA SHE file format

### Phase B — Enterprise SA Industrial (Next)
5. OHS Act (Act 85/1993) as a standalone compliance framework
6. Environmental Module — NEMA permits, water use licences, emissions licences, waste licences
7. Carbon Tax / GHG Module — Scope 1/2/3, carbon budget calculations, SAGERS reporting prep
8. Multi-Site Hierarchy — corporate → division → site data model
9. BBBEE Scorecard Enhancement — element tracking, verification evidence, supplier monitoring

### Phase C — Sector Expansion (Later)
10. FSSC 22000 / ISO 22000 / HACCP — food safety framework
11. Offline Incident Logging + GPS — extend offline sync
12. Training Records Module — per-person induction, competency matrix
13. Supplier Qualification Management — bulk onboarding, tiered pre-qual
14. IATF 16949 — automotive supply chain quality

### Phase D — Differentiation (Future)
15. Regulatory Change Tracking with AI — monitor SA regulation changes
16. ISSB/ESG Disclosure Builder — IFRS S1/S2 data collection
17. King IV Compliance Evidence — principle application tracking

---

## Part 6: Key Research Sources

### Tiger Brands
- 2018 listeriosis crisis (Enterprise Foods) — 200+ deaths, R2B+ losses, class action ongoing
- 40–50 manufacturing sites across SA
- FSSC 22000 / HACCP / NRCS are primary compliance drivers
- Food safety is board-level priority post-crisis

### Hulamin
- JSE-listed, PMB + Richards Bay operations
- Holds ISO 9001, 14001, 45001, IATF 16949, ASI Performance Standard (Provisional)
- ASI provisional status due to OHS management system non-conformance
- Falls under OHS Act (not MHSA) — critical regulatory distinction for manufacturers vs miners
- Carbon Tax Phase 2 (Jan 2026) directly impacts aluminium operations

### SA Regulatory Environment
- OHS Act: New Noise Exposure Regulations (2025), Physical Agents Regulations (2025), draft General Machinery Regulations (Aug 2025)
- Carbon Tax Phase 2: R308/tCO2e from Jan 2026, rising to R462/tCO2e by 2030. Exceeding carbon budgets = R640/tCO2e
- JSE moving toward mandatory ISSB IFRS S1/S2 adoption (2-3 year timeline)
- CIPC Notice 6 of 2025: public consultation on mandatory sustainability reporting

### Competitive Intelligence
- IsoMetrix: SA incumbent, 95% retention, six-figure contracts, desktop-first
- SA EHS market: ~R1B, 6.3% CAGR
- Cloud deployment: 63% of new implementations globally
- On-premises still 71.7% in oil/gas/chemicals (data control preferences)

---

*ConformEdge Enterprise Gap Analysis | 29 March 2026 | ISU Technologies (Pty) Ltd*
