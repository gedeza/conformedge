# ConformEdge — Demo Seed Data Reference

This document describes all demo data seeded for presentation purposes.
Run with: `npx tsx prisma/seed-demo.ts`

---

## Incidents

| # | Title | Type | Severity | Status | Location |
|---|-------|------|----------|--------|----------|
| 1 | Scaffolding collapse on Site B | Property Damage | HIGH | Investigating | North face, Building B - Level 3 |
| 2 | Near-miss: unsecured load on crane | Near Miss | MEDIUM | Corrective Action | Main site - Loading bay |

### Incident 1: Scaffolding collapse on Site B
- **Description:** A section of scaffolding on the north face of Building B collapsed during high winds. Two workers were in the area but evacuated safely.
- **Immediate Action:** Area cordoned off, all workers evacuated, site manager notified

### Incident 2: Near-miss: unsecured load on crane
- **Description:** An unsecured load shifted during crane operation. No injuries, but the load came within 2 metres of a worker below.
- **Immediate Action:** Crane operations suspended pending inspection. All rigging equipment checked.
- **Root Cause:** Rigging procedure not followed. Operator bypassed pre-lift checklist.

---

## Objectives

| # | Title | Standard | Target | Current | Frequency | Status |
|---|-------|----------|--------|---------|-----------|--------|
| 1 | Reduce site incident rate by 30% | ISO 45001 | 30% | 8% | Monthly | Active |
| 2 | Achieve 95% checklist completion rate | ISO 9001 | 95% | 72% | Monthly | Active |

### Objective 1: Reduce site incident rate by 30%
**Measurements:**
- Jan: 3% — Baseline measurement
- Feb: 5% — Safety training rollout started
- Mar: 8% — 8% reduction achieved from safety training

### Objective 2: Achieve 95% checklist completion rate
**Measurements:**
- Feb: 60% — Initial tracking
- Mar: 72% — Improved with recurring checklists feature

---

## Management Review

| Field | Value |
|-------|-------|
| Title | Q1 2026 Management Review |
| Status | In Progress |
| Location | Boardroom A, Head Office |
| Review Date | 3 days ago (relative) |
| Next Review | 3 months from now (relative) |
| Standards | ISO 9001, ISO 45001 |
| Facilitator | Nhlanhla Mnyandu |

### Meeting Minutes
> Meeting opened at 09:00. Reviewed Q4 2025 audit findings and current CAPA status. Discussed incident trends and safety training effectiveness. Action items assigned for safety induction update and PPE procurement review.

### Agenda Items

| # | Type | Title | Notes |
|---|------|-------|-------|
| 1 | Audit Results | Q4 2025 Internal Audit Findings | 3 minor non-conformities identified. 2 closed, 1 pending corrective action on document control. |
| 2 | CAPA Status | Open CAPA Review | 5 open CAPAs. 2 overdue — escalation plan discussed. |
| 3 | Process Performance | Safety KPI Dashboard Review | Incident rate down 8% since safety training rollout. Target is 30% reduction by Q4. |
| 4 | Improvement Opportunities | Digital Checklist Adoption | 72% completion rate on recurring checklists. Recommend mandatory mobile app usage on-site. |

### Action Items

| # | Description | Status | Due |
|---|-------------|--------|-----|
| 1 | Update safety induction training to include scaffolding collapse lessons learned | Open | 2 weeks from now |
| 2 | Review and approve updated PPE procurement policy | In Progress | 1 week from now |
| 3 | Schedule external audit preparation meeting | Completed | Yesterday |

---

## Work Permits

| # | Permit # | Title | Type | Risk | Status | Location |
|---|----------|-------|------|------|--------|----------|
| 1 | PTW-2026-001 | Hot Work - Welding on Steel Frame Level 4 | Hot Work | HIGH | Active | Building A - Level 4, Steel Structure |
| 2 | PTW-2026-002 | Confined Space Entry - Storm Water Culvert Inspection | Confined Space | CRITICAL | Pending Approval | Site C - Underground culvert network |
| 3 | PTW-2026-003 | Working at Heights - Roof Waterproofing | Working at Heights | HIGH | Closed | Building B - Rooftop |

### Permit 1: Hot Work - Welding on Steel Frame Level 4 (ACTIVE)
- **Description:** MIG welding operations on the main steel frame connections at Level 4. Work involves joining primary beams to column brackets per structural drawing SD-104.
- **Hazards:** Fire risk from sparks and molten metal, Burns from hot surfaces, Fume inhalation, Falling objects from height, Electric shock from welding equipment
- **Precautions:** Fire blankets deployed below work area, Fire extinguisher within 5m, Spotter assigned for duration, All combustibles removed from 10m radius
- **PPE:** Welding helmet with auto-darkening lens, Flame-resistant coveralls, Welding gloves, Safety boots with metatarsal guards, Fall arrest harness
- **Emergency:** In case of fire: Activate nearest fire alarm, use extinguisher if safe. Evacuate via stairwell B. In case of injury: Call site first aider (ext 555). Assembly point: Car park A.
- **Safety Checklist (3/5 completed):**
  - [x] Area cleared of combustible materials
  - [x] Fire extinguisher positioned within 5m
  - [x] Fire watch spotter assigned
  - [ ] Welding equipment inspected and earthed
  - [ ] Gas cylinders secured upright

### Permit 2: Confined Space Entry - Storm Water Culvert Inspection (PENDING APPROVAL)
- **Description:** Entry into storm water culvert for structural integrity inspection. Two-person team with standby rescue. Atmospheric monitoring required throughout.
- **Hazards:** Oxygen deficiency, Toxic gas accumulation (H2S, CO), Flash flooding, Structural collapse, Limited egress
- **Precautions:** Continuous atmospheric monitoring (4-gas detector), Standby rescue team at entry point, Communication check every 15 minutes, Weather forecast confirmed - no rain expected
- **PPE:** Self-contained breathing apparatus (SCBA), Full body harness with retrieval line, Hard hat with headlamp, Rubber boots, Gas detector (personal)
- **Emergency:** DO NOT enter to rescue without SCBA. Activate rescue winch at entry point. Call emergency services: 10111. Site emergency number: ext 999

### Permit 3: Working at Heights - Roof Waterproofing (CLOSED)
- **Description:** Application of torch-on waterproofing membrane to Building B flat roof. Work completed over 3 days.
- **Hazards:** Fall from height (12m), Burns from gas torch, Slip hazard on membrane surface
- **Precautions:** Edge protection barriers installed on all sides, Safety nets below work area, Non-slip footwear required, Work suspended if wind > 40 km/h
- **PPE:** Full body harness, Hard hat, Safety boots, Heat-resistant gloves
- **Closure Notes:** All waterproofing work completed successfully. Area cleaned and barriers removed. No incidents reported.

---

## Data Interconnections (Presentation Narrative)

The demo data tells a cohesive SA construction safety story:

1. **Incidents** drive **Objectives** — the scaffolding collapse and crane near-miss led to the "Reduce incident rate by 30%" objective
2. **Objectives** feed into **Management Review** — the safety KPI agenda item references the 8% reduction progress, and the checklist adoption item references the 72% completion rate
3. **Management Review actions** connect back — "Update safety induction to include scaffolding collapse lessons learned" directly references Incident 1
4. **Work Permits** demonstrate operational controls — the active hot work permit shows real-time safety checklist completion, the confined space entry awaits approval (CRITICAL risk), and the closed heights permit shows completed lifecycle
5. **Standards alignment** — Incidents + Permits tie to ISO 45001 (OHS), Checklists tie to ISO 9001 (QMS), Management Review covers both
