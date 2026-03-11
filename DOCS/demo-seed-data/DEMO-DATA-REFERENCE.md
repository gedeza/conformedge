# ConformEdge — Demo Seed Data Reference

**Script:** `npm run seed:maziya` (`prisma/scripts/seed-maziya-demo.ts`)
**Target Org:** ConformEdge Systems (override with `SEED_ORG_NAME` env var)
**Idempotent:** Checks for sentinel project "PRASA Western Cape Re-Signalling" before running

---

## Pre-Seed Requirements

1. Main seed completed (`npx prisma db seed` — loads 9 standards + 340+ sub-clauses)
2. Active org with OWNER or ADMIN user in database
3. Database accessible (local Docker or production VPS)

## How to Run

```bash
# Production (VPS)
ssh root@46.224.40.5
cd /var/www/conformedge
npx tsx prisma/scripts/seed-maziya-demo.ts

# Local development
npm run seed:maziya

# Target a different org
SEED_ORG_NAME="My Organization" npm run seed:maziya
```

## How to Reset

Delete the sentinel project "PRASA Western Cape Re-Signalling" from the database, or delete all org data and re-run. A cleanup pattern is available in the git history (commit `4824577`).

---

## Projects (5)

| # | Name | Status | Region | Division |
|---|------|--------|--------|----------|
| 1 | **PRASA Western Cape Re-Signalling** | COMPLETED | Western Cape | Telecom & Signalling |
| 2 | **PRASA PTCS Signalling — KwaZulu-Natal** | ACTIVE | KZN | Telecom & Signalling |
| 3 | **PRASA Traction Substations — Gauteng** | ACTIVE | Gauteng | Electrical Construction |
| 4 | **Mining Rehabilitation — Mpumalanga** | ACTIVE | Mpumalanga | Mining |
| 5 | **Bulk Water Infrastructure — eThekwini** | ACTIVE | KZN | Civil Engineering |

**Demo narrative:** Maziya operates simultaneously across 4 provinces. Projects span their 6 business divisions — exactly what a Grade 9 CIDB contractor manages.

---

## Documents (24)

### ISO 9001 — Quality (6 docs)
| Title | Status | Clause | Confidence |
|-------|--------|--------|------------|
| Integrated Quality Policy | APPROVED | 5.2, 5.1 | 95%, 88% |
| Document Control Procedure — IMS | APPROVED | 7.5 (x3 standards) | 92%, 87%, 86% |
| Internal Audit Procedure | APPROVED | 9.2 | 93% |
| Management Review Minutes — Q4 2025 | APPROVED | 9.3 | 91% |
| Risk & Opportunity Register — PRASA Projects | APPROVED | 6.1 | 89% |
| Supplier Evaluation Procedure | APPROVED | 8.4 | 87% |

### ISO 14001 — Environmental (3 docs)
| Title | Status | Clause | Confidence |
|-------|--------|--------|------------|
| Environmental Management Policy | APPROVED | 5.2 | 94% |
| Environmental Aspects & Impacts Register | APPROVED | 6.1.2 | 90% |
| Waste Management Plan — Mpumalanga Sites | APPROVED | 8.1 | 88% |

### ISO 45001 — OHS (6 docs)
| Title | Status | Clause | Confidence |
|-------|--------|--------|------------|
| OHS Policy — All Divisions | APPROVED | 5.2 | 95% |
| Hazard Identification & Risk Assessment — Rail Signalling | APPROVED | 6.1.2 | 92% |
| Emergency Preparedness Plan — Construction Sites | APPROVED | 8.2 | 91% |
| Safety Management Plan — 3kV Substations | APPROVED | 8.1 | 93% |
| PPE Requirements Matrix — All Sites | APPROVED | 8.1.2 | 87% |
| Incident Investigation Procedure | APPROVED | 10.2 | 90% |

### DMRE/MHSA — Mining (4 docs)
| Title | Status | Clause | Confidence |
|-------|--------|--------|------------|
| Mine Health and Safety Policy | APPROVED | 2.6 | 92% |
| Competency Register — Mining Personnel | APPROVED | 2.5 | 89% |
| Code of Practice — Ground Control | APPROVED | 6.3 | 88% |
| Occupational Health Surveillance Records — Q1 2026 | APPROVED | 2.7 | 86% |

### POPIA — Data Protection (3 docs)
| Title | Status | Clause | Confidence |
|-------|--------|--------|------------|
| Employee Privacy Policy | APPROVED | 2.1 | 90% |
| Data Processing Impact Assessment | APPROVED | 8.2 | 87% |
| Breach Notification Procedure | DRAFT | — | Unclassified |

### Unclassified / Live Demo (2 docs)
| Title | Status | Purpose |
|-------|--------|---------|
| Training Records Q1 2026 | PENDING_REVIEW | Expiry demo (14 days) |
| Method Statement — ETCS Level 2 Installation | DRAFT | **Live AI classification demo** |

**Demo tip:** The Method Statement is intentionally unclassified — use it for the live AI classification during the demo. Upload a real PDF or click classify to show the AI in action.

---

## Incidents (7)

| # | Title | Type | Severity | Status | Region | Project |
|---|-------|------|----------|--------|--------|---------|
| 1 | Scaffolding collapse — Cape Town Signal Box 7 | PROPERTY_DAMAGE | **HIGH** | CORRECTIVE_ACTION | WC | PRASA WC |
| 2 | Electrical shock — Langlaagte Traction Substation | MEDICAL | **HIGH** | INVESTIGATING | Gauteng | Substations GP |
| 3 | Near-miss: crane load shift during signalling mast lift | NEAR_MISS | MEDIUM | CORRECTIVE_ACTION | KZN | PRASA KZN |
| 4 | Near-miss: unsecured harness at signal tower | NEAR_MISS | MEDIUM | CLOSED | WC | PRASA WC |
| 5 | Environmental: dust exceedance at Mine Site B | ENVIRONMENTAL | MEDIUM | CORRECTIVE_ACTION | Mpumalanga | Mining Rehab |
| 6 | First aid: minor cut during cable termination | FIRST_AID | LOW | CLOSED | KZN | PRASA KZN |
| 7 | Vehicle struck barrier at substation access road | PROPERTY_DAMAGE | LOW | CLOSED | Gauteng | Substations GP |

### 5-Whys Root Cause Analysis (Incident #1)

The scaffolding collapse includes a complete 5-Whys analysis:

1. **Why did the scaffolding collapse?** → Inadequate wind bracing on the north face exposure
2. **Why was wind bracing inadequate?** → Erected without site-specific wind assessment for coastal conditions
3. **Why was no wind assessment done?** → Subcontractor followed standard inland spec
4. **Why wasn't the spec adjusted?** → No pre-erection engineering review required by PTW checklist
5. **Why isn't engineering review on the checklist?** → PTW checklist was generic, not updated for high-wind sites

**Root cause:** PTW checklist lacked site-specific engineering review requirement for high-wind zones
**Containment:** All WC scaffolding suspended until engineering review. Emergency bracing installed.
**Linked CAPA:** Scaffolding Inspection Gaps — Western Cape Signal Boxes

**Demo tip:** Walk through the 5-Whys timeline on the incident detail page. Then click through to the linked CAPA to show the closed-loop corrective action workflow.

---

## Work Permits (7 — all types)

| # | Type | Title | Status | Risk | Region |
|---|------|-------|--------|------|--------|
| 1 | **HOT_WORK** | MIG Welding on Signalling Mast Brackets | ACTIVE | HIGH | KZN |
| 2 | **ELECTRICAL** | 3kV Traction Substation Bay 5 Isolation | PENDING_APPROVAL | **CRITICAL** | Gauteng |
| 3 | **CONFINED_SPACE** | Storm Water Culvert, PTCS Route | ACTIVE | **CRITICAL** | KZN |
| 4 | **WORKING_AT_HEIGHTS** | Signal Tower Antenna Installation | CLOSED | HIGH | WC |
| 5 | **LIFTING** | Signalling Mast Installation (800kg crane lift) | PENDING_APPROVAL | HIGH | KZN |
| 6 | **EXCAVATION** | Fibre-Optic Cable Trench, River Crossing 3 | ACTIVE | HIGH | eThekwini |
| 7 | **GENERAL** | Site Establishment & Mobilisation | CLOSED | MEDIUM | Mpumalanga |

### Safety Checklists on Permits

- **Hot Work (#1):** 6 items — 4 checked, 2 pending (welder cert verified, fire watch assigned)
- **Electrical (#2):** 7 items — all pending (LOTO plan, voltage testing, arc flash PPE, PRASA confirmation)
- **Lifting (#5):** 6 items — all pending (crane cert, lift plan, ground bearing, rigging inspection)

**Demo tip:** The ELECTRICAL permit is the showstopper for Maziya — they work on 3kV DC traction substations daily. Show the LOTO checklist, arc flash PPE requirements, and PRASA coordination requirement. The PENDING_APPROVAL status demonstrates the system enforces management sign-off before CRITICAL work begins.

---

## Objectives (5)

| # | Title | Standard | Target | Current | Trend |
|---|-------|----------|--------|---------|-------|
| 1 | Reduce site incident rate by 30% | ISO 45001 | 30% | 12% | 5% → 8% → 12% ↗ |
| 2 | Achieve 100% work permit closure within 48h | ISO 45001 | 100% | 82% | 65% → 74% → 82% ↗ |
| 3 | Maintain 95% subcontractor cert compliance | ISO 9001 | 95% | 78% | 62% → 71% → 78% ↗ |
| 4 | Achieve 95% checklist completion rate | ISO 9001 | 95% | 72% | 58% → 72% ↗ |
| 5 | Zero environmental NCRs at mining sites | ISO 14001 | 0 NCRs | 2 NCRs | 4 → 3 → 2 ↘ |

Each objective has 2-3 monthly measurements showing a clear trend. All are ON_TRACK or AT_RISK — realistic for a growing compliance programme.

**Demo tip:** Click into Objective #1 to show the Recharts trend chart. Point out: "January baseline, February after training rollout, March trending upward. When the auditor asks 'show me your objectives', you click one button."

---

## CAPAs (8)

| # | Title | Type | Priority | Status | Project |
|---|-------|------|----------|--------|---------|
| 1 | LOTO Procedure Non-Compliance — Langlaagte | CORRECTIVE | **CRITICAL** | IN_PROGRESS | Substations GP |
| 2 | Scaffolding Inspection Gaps — WC Signal Boxes | CORRECTIVE | HIGH | VERIFICATION | PRASA WC |
| 3 | Subcontractor Welding Cert Lapse — KZN | CORRECTIVE | HIGH | OPEN | PRASA KZN |
| 4 | Dust Suppression Failure — Mpumalanga | CORRECTIVE | **CRITICAL** | OPEN | Mining Rehab |
| 5 | Waste Segregation Non-Compliance | CORRECTIVE | **CRITICAL** | IN_PROGRESS | Mining Rehab |
| 6 | Document Control — Outdated Method Statements | CORRECTIVE | MEDIUM | IN_PROGRESS | PRASA KZN |
| 7 | Emergency Drill Deficiency — eThekwini | PREVENTIVE | MEDIUM | OPEN | Civil KZN |
| 8 | Risk Assessment Review — Annual Update | PREVENTIVE | LOW | CLOSED | PRASA KZN |

All CAPAs have:
- 2-3 action items with due dates and completion status
- Clause links to ISO 9001/14001/45001/DMRE standards
- Root cause analysis where applicable

**Demo tip:** CAPA #1 (LOTO) is linked to the electrical shock incident. Walk through: incident → root cause → CAPA raised → corrective actions in progress. This is the closed-loop compliance narrative auditors want to see.

---

## Assessments (6)

### Completed (3)
| Title | Standard | Score | Risk | Project |
|-------|----------|-------|------|---------|
| ISO 45001 Internal Audit — Traction Substations Gauteng | ISO 45001 | **78** | HIGH | Substations GP |
| ISO 9001 Quality Audit — PTCS Signalling KZN | ISO 9001 | **85** | MEDIUM | PRASA KZN |
| ISO 14001 Environmental Audit — Mining Rehabilitation | ISO 14001 | **72** | HIGH | Mining Rehab |

The Gauteng audit has **6 Q&A pairs** with scores (65-88), including questions on LOTO compliance, emergency drills, and subcontractor cert verification.

### Scheduled (3)
| Title | Standard | Date | Project |
|-------|----------|------|---------|
| ISO 45001 Surveillance Audit — All Sites | ISO 45001 | +14 days | PRASA KZN |
| ISO 9001 Stage 2 Certification — eThekwini | ISO 9001 | +45 days | Civil KZN |
| DMRE Compliance Inspection — Mpumalanga | DMRE/MHSA | +30 days | Mining Rehab |

**Demo tip:** Show the calendar view — 3 upcoming assessments with colour-coded dots. Click into the completed Gauteng audit to show the Q&A scoring with clause guidance.

---

## Management Review (1)

**Title:** Q1 2026 Management Review — All Divisions
**Status:** IN_PROGRESS
**Standards:** ISO 9001 + ISO 14001 + ISO 45001 + DMRE/MHSA
**Location:** Boardroom, 56 3rd Avenue, Johannesburg

### Agenda Items (8)
| # | Type | Title |
|---|------|-------|
| 1 | AUDIT_RESULTS | Q4 2025 Internal Audit Findings — All Standards |
| 2 | INCIDENT_TRENDS | Incident Analysis — Multi-Site Q1 2026 |
| 3 | CAPA_STATUS | Open CAPA Review |
| 4 | OBJECTIVES_PERFORMANCE | KPI Dashboard Review — Construction Metrics |
| 5 | RISK_OPPORTUNITIES | Subcontractor Compliance & Supply Chain Risk |
| 6 | CHANGES_CONTEXT | Regulatory Environment Updates |
| 7 | RESOURCE_NEEDS | SHEQ Staffing & Technology Investment |
| 8 | IMPROVEMENT_OPPORTUNITIES | Digital Transformation Progress |

### Action Items (5)
| Description | Status | Due |
|-------------|--------|-----|
| Update LOTO procedure for secondary circuit isolation | IN_PROGRESS | +10 days |
| Complete subcontractor portal rollout — all Tier 1 | IN_PROGRESS | +20 days |
| Upgrade dust monitoring at Mpumalanga (real-time alerts) | OPEN | +30 days |
| Schedule external ISO 45001 surveillance audit prep meeting | COMPLETED | Yesterday |
| Recruit regional SHEQ coordinator for KZN | OPEN | +45 days |

**Demo tip:** This is ISO 9.3 compliance in action. Point out how the incident trends agenda item links to the objectives, how the CAPA status connects to the audit findings — "everything is connected in one platform."

---

## Subcontractors (7)

| # | Name | Tier | Safety | BEE | Key Cert | Cert Status |
|---|------|------|--------|-----|----------|-------------|
| 1 | Thabiso Electrical Contractors | GOLD | 82% | Level 1 | Medical Fitness Certificate | **PENDING_REVIEW** |
| 2 | Ngwenya Scaffolding & Rigging | **BRONZE** | 65% | Level 3 | Safety Competency Card | **REJECTED (expired)** |
| 3 | Precision Welding Services SA | GOLD | 91% | Level 2 | SAIW Welding Cert — MIG/TIG | Expires in **10 days** |
| 4 | KZN Crane & Rigging Services | **PLATINUM** | 95% | Level 2 | Crane Operator COC | APPROVED |
| 5 | EnviroRehab Solutions | GOLD | 88% | Level 1 | Asbestos Removal Registration | APPROVED |
| 6 | ProSignal Communications | SILVER | 86% | Level 2 | ICASA Frequency Licence — GSM-R | APPROVED |
| 7 | Makhubu Civil Works | SILVER | 74% | Level 1 | Safety Competency Card | Expires in **15 days** |

### Demo Highlights
- **Precision Welding** cert expires in 10 days — shows the expiry alert system
- **Ngwenya Scaffolding** has a REJECTED cert — demonstrates enforcement (no site access until renewed)
- **Thabiso Electrical** has a PENDING_REVIEW cert — shows the review workflow
- **Makhubu Civil Works** cert expires in 15 days — another upcoming alert
- Tier distribution: 1 Platinum, 3 Gold, 2 Silver, 1 Bronze — shows risk differentiation

**Demo tip:** "You have dozens of subcontractors across PRASA projects. This welding cert expires in 10 days — our system flags it. No more lost emails, no more expired certs discovered during an audit."

---

## Checklists (3 templates + 2 instances)

### Templates
| # | Name | Standard | Recurring | Field Types |
|---|------|----------|-----------|-------------|
| 1 | Weekly Site Safety Inspection | ISO 45001 | WEEKLY (due in 3 days) | COMPLIANCE, BOOLEAN, NUMBER (dB, mg/m³), RATING, SELECT |
| 2 | Monthly Equipment Maintenance Check | ISO 9001 | MONTHLY (due in 12 days) | COMPLIANCE, BOOLEAN, NUMBER (°C, mm) |
| 3 | **3kV Substation Pre-Start Safety Checklist** | ISO 45001 | One-time | COMPLIANCE, BOOLEAN, NUMBER (minutes) |

### Instances
| Title | Template | Status | Completion | Project |
|-------|----------|--------|------------|---------|
| Weekly Site Safety — KZN PTCS, Week 10 | #1 | IN_PROGRESS | 60% (6/10 items) | PRASA KZN |
| Equipment Maintenance — Gauteng Fleet, Feb 2026 | #2 | COMPLETED | 100% (8/8 items) | Substations GP |

**Demo tip:** Template #3 (3kV Substation Pre-Start) is Maziya-specific — LOTO verification, voltage testing, arc flash PPE, PRASA control room confirmation. Show how custom checklists match their exact operational procedures.

---

## Audit Trail (61 events)

Events span **60 days** and cover:
- Project creation (5 events)
- Document uploads and AI classifications (18 events)
- Document status changes (3 events)
- Assessment creation and completion (5 events)
- CAPA raises and status changes (7 events)
- Incident reports (6 events)
- Work permit lifecycle (4 events)
- Objective tracking (5 events)
- Management review (2 events)
- Checklist activity (2 events)
- Audit pack compilation (2 events)
- Subcontractor cert uploads and reviews (3 events)

**Demo tip:** Filter by `AI_CLASSIFY` to show all AI classifications are logged. Filter by `CAPA_RAISE` to show corrective actions are traceable. "Every action is timestamped and immutable — exactly what auditors want to see."

---

## Audit Pack (1)

**Title:** ISO 45001 Surveillance Audit Pack — All Sites Q1 2026
**Status:** READY
**Generated:** 2 days ago

**Demo tip:** "When the auditor arrives, you click 'Generate Audit Pack', select the standard, and the system compiles everything into one professional PDF. That's your audit in a box."

---

## Data Relationships (Demo Flow)

The seed data is interconnected to tell a cohesive compliance story:

```
Scaffolding Collapse (Incident #1)
  └─→ linked to CAPA #2 (Scaffolding Inspection Gaps)
       └─→ actions: standardise checklist, retag scaffolding, spot checks
       └─→ clause links: ISO 45001 §8.1, ISO 9001 §8.5

Electrical Shock (Incident #2)
  └─→ related to CAPA #1 (LOTO Non-Compliance) — same project
       └─→ clause links: ISO 45001 §8.1.2, §8.1
       └─→ Management Review Action: "Update LOTO procedure"

Subcontractor Welding Cert Lapse
  └─→ CAPA #3 raised (Subcontractor Welding Cert Lapse)
       └─→ action: "Onboard all subcontractors onto ConformEdge portal"
       └─→ Objective #3 (95% subcontractor cert compliance) tracks progress

Dust Exceedance (Incident #5)
  └─→ CAPA #4 (Dust Suppression Failure) — same project
       └─→ Objective #5 (Zero environmental NCRs) tracks progress
       └─→ Management Review Agenda: Regulatory Environment Updates
```

**Demo tip:** Walk through one complete loop: Incident → Investigation → CAPA → Actions → Objective tracking → Management Review. This is the "compliance lifecycle" that differentiates ConformEdge from spreadsheets.

---

## Standards Coverage

| Standard | Documents | Assessments | CAPAs | Objectives |
|----------|-----------|-------------|-------|------------|
| ISO 9001 | 6 | 2 | 3 | 2 |
| ISO 14001 | 3 | 1 | 3 | 1 |
| ISO 45001 | 6 | 2 | 4 | 2 |
| DMRE/MHSA | 4 | 1 | 2 | 0 |
| POPIA | 3 | 0 | 0 | 0 |
| **Total** | **24** (2 unclassified) | **6** | **8** | **5** |

---

## Regional Distribution

| Region | Projects | Incidents | Permits | Subcontractors |
|--------|----------|-----------|---------|----------------|
| Western Cape | 1 | 2 | 1 | 1 |
| KwaZulu-Natal | 2 | 2 | 3 | 2 |
| Gauteng | 1 | 2 | 1 | 1 |
| Mpumalanga | 1 | 1 | 1 | 1 |
| eThekwini | — (within KZN) | — | 1 | 2 |

---

## Updating This Data

To modify the seed data:

1. Edit `prisma/scripts/seed-maziya-demo.ts`
2. Delete the sentinel project from the database (or run full cleanup)
3. Re-run `npm run seed:maziya`

The script is **idempotent** — it checks for the sentinel project "PRASA Western Cape Re-Signalling" and exits if it already exists. Delete that project to allow re-seeding.

To seed into a different org, set the environment variable:
```bash
SEED_ORG_NAME="My Other Org" npm run seed:maziya
```
