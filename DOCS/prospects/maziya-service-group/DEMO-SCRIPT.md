# ConformEdge — Live Demo Script
## Maziya Service Group | Friday, 13 March 2026

**Duration:** 45 minutes (30 min demo + 15 min Q&A)
**Presenter:** Nhlanhla Mnyandu, ISU Technologies
**Platform:** Live production at conformedge.isutech.co.za

---

## Pre-Demo Checklist

- [ ] Demo seed data loaded (`npm run seed:maziya`)
- [ ] Browser: Chrome, incognito, 100% zoom, bookmarks hidden
- [ ] Second tab: Landing page (conformedge.co.za or localhost:3000)
- [ ] Screen resolution: 1920x1080 minimum
- [ ] Stable internet connection (Clerk auth + AI classification need network)
- [ ] Test AI classification with a sample document beforehand
- [ ] Close all notifications/Slack/email
- [ ] Have a PDF document ready for live upload (e.g., Safety Management Plan)

---

## PART 1: Opening (3 minutes)

### Slide/Talk Track

> "Good morning. Thank you for making time — I know Fridays on a construction project are busy days.
>
> Last time Vela presented the vision for what AI-powered compliance could look like for Maziya. Today, I'm going to show you the real thing. Every screen you'll see is live. Every feature works. Let's jump in."

**Transition:** Open browser → Navigate to landing page

---

## PART 2: Landing Page Walkthrough (3 minutes)

### What to Show

1. **Hero section** — "ISO Compliance Simplified by AI"
   - Point out: 9001, 14001, 45001 — "These are the three standards you already hold"

2. **Standards bar** — "9 Compliance Frameworks · 340+ Sub-Clauses"
   - Highlight: "We also cover DMRE/MHSA for your mining rehabilitation division, and POPIA for data protection"

3. **Feature cards** — Quick scroll through the 8 features
   - "AI Document Classification, Gap Assessments, CAPA Management, Checklists, Subcontractor Management, Audit Packs, Document Management, Reports"

4. **Deep Dive mockups** — Pause on the AI Classification mockup
   - "This is what it looks like when AI classifies a document — ISO 45001, Clause 6.1.2, 94% confidence, in 3 seconds"

5. **IMS mockup** — Pause briefly
   - "This is the integrated view — one document can satisfy multiple standards simultaneously"

### Talk Track

> "ConformEdge covers 9 compliance frameworks with over 340 sub-clauses. For Maziya, the immediate value is managing your ISO 9001, 14001, and 45001 from a single dashboard — instead of three separate filing systems."

**Transition:** Click "Sign In" → Log into dashboard

---

## PART 3: Dashboard Overview (3 minutes)

### What to Show

1. **11 dashboard widgets** — Give the audience 10 seconds to absorb the overview
2. **Metric cards** — Active Projects, Documents, Assessments, Open CAPAs
3. **Compliance Overview** — Progress bar with checklist/assessment counts
4. **AI Classification widget** — Accuracy %, pending reviews
5. **Open Incidents widget** — Severity badges (HIGH in red)
6. **Work Permits widget** — Active/Pending/Closed summary
7. **Recent Activity** — Colour-coded timeline

### Talk Track

> "This is your command centre. Every widget is live data. At a glance, you can see how many incidents are open, which work permits need attention, and your overall compliance posture across all standards.
>
> Let me show you how each of these works, starting with the scenario Vela outlined — a construction site with real safety challenges."

**Transition:** Click on Incidents in sidebar

---

## PART 4: Incident Management (5 minutes) ★ HIGH IMPACT

### What to Show

1. **Incidents list** — Show the scaffolding collapse (HIGH severity, red badge)
2. **Click into detail** — Full incident report
   - Type: PROPERTY_DAMAGE
   - Severity: HIGH
   - Location: North face, Building B — Level 3
   - Description: "Section of scaffolding collapsed during high winds"
3. **5-Whys Root Cause Analysis** — Scroll to the timeline visualization
   - "Why did it collapse? → Inadequate bracing. Why? → Not inspected after wind warning..."
4. **Statutory Form button** — Click to generate SA DHET compliance form
   - "One click — your legally required incident report, formatted for the Department of Higher Education and Training"
5. **Show the near-miss** (crane load) — "Near-misses are just as important to track"

### Talk Track

> "On a rail signalling project, your teams deal with real hazards every day. When an incident happens — scaffolding collapse, welding flash, crane near-miss — ConformEdge captures everything: who, what, where, when, and most importantly, WHY.
>
> The 5-Whys analysis is built in. No separate spreadsheet. And the statutory form? One click. Your safety officer doesn't spend 2 hours formatting a PDF — the system generates it instantly, compliant with SA regulations."

**Transition:** Click on Work Permits in sidebar

---

## PART 5: Work Permits / PTW (4 minutes) ★ HIGH IMPACT

### What to Show

1. **Permits list** — 3 permits in different states (Active, Pending, Closed)
2. **Hot Work permit (ACTIVE)** — Click into detail
   - Type: Hot Work — "MIG welding on steel frame"
   - Risk: HIGH (amber badge)
   - Hazards: Fire, burns, fume inhalation, falling objects
   - PPE requirements listed
   - Emergency procedures
3. **Safety checklist** — Show 3/5 items completed
   - ✅ Area cleared of combustibles
   - ✅ Fire extinguisher positioned
   - ✅ Fire watch spotter assigned
   - ⬜ Welding equipment inspected
   - ⬜ Gas cylinders secured
4. **Confined Space permit (PENDING_APPROVAL)** — Show CRITICAL risk badge
   - "This one requires management approval before entry — the system enforces the workflow"
5. **Closed permit** — Show completed record with closure notes

### Talk Track

> "Vela mentioned the rail signalling demo scenario — welding certifications, subcontractor compliance. Here it is, live.
>
> This hot work permit tracks everything: hazards identified, PPE required, emergency procedures, and a safety checklist that must be completed before work begins. Right now, 3 of 5 items are done — your site manager can see this in real-time from any device.
>
> The confined space entry? That's flagged CRITICAL. It won't proceed until a manager approves it. No more verbal sign-offs that get lost."

**Transition:** Click on Objectives in sidebar

---

## PART 6: Objectives & KPI Tracking (3 minutes)

### What to Show

1. **Objectives list** — Show "Reduce site incident rate by 30%" with progress bar
2. **Click into detail** — Show the Recharts trend chart
   - January: 3% (baseline)
   - February: 5% (after training rollout)
   - March: 8% (current)
   - Target: 30%
3. **Measurement history** — Show monthly data points with notes
4. **ISO clause linking** — "This objective maps to ISO 45001, Clause 6.2"

### Talk Track

> "ISO requires you to set measurable objectives and track them. Most companies do this in Excel and update it the week before the audit. ConformEdge tracks it continuously.
>
> This objective — reduce incident rate by 30% — shows real progress. January baseline, February after your training programme, March trending upward. When the auditor asks 'show me your objectives', you click one button."

**Transition:** Click on Management Reviews in sidebar

---

## PART 7: Management Review (2 minutes)

### What to Show

1. **Q1 2026 Management Review** — Click into detail
2. **Agenda items** — Show the 4 categories:
   - Q4 Internal Audit Findings (3 NCRs, 2 closed, 1 pending)
   - Open CAPA Review (5 open, 2 overdue)
   - Safety KPI Dashboard (8% reduction progress)
   - Digital Checklist Adoption (72% completion)
3. **Action items** — Show OPEN/IN_PROGRESS/COMPLETED statuses with due dates
4. **Meeting minutes** — Captured digitally, timestamped

### Talk Track

> "Clause 9.3 — Management Review. The auditor always checks this. ConformEdge structures your reviews with agenda items, action tracking, and meeting minutes. Notice how the safety KPI review links directly to the objective we just saw — everything is connected."

**Transition:** Click on Documents in sidebar

---

## PART 8: AI Document Classification (5 minutes) ★ SHOWSTOPPER

### What to Show

1. **Documents list** — Show existing classified documents with AI badges
2. **LIVE UPLOAD** — Upload a prepared PDF (Safety Management Plan or similar)
   - Click "Upload Document"
   - Select the file
   - Watch the AI classification happen in real-time
3. **Classification result** — Show:
   - Standard: ISO 45001:2018
   - Clause: Specific clause identified
   - Confidence: 85-95%
4. **Gap insights panel** — "Based on this upload, Clause 6.1.3 has only 23% coverage"
5. **Cross-standard suggestions** — "This document also partially covers ISO 14001 Clause 8.1"

### Talk Track

> "This is where AI changes everything. I'm going to upload a safety management plan right now — live.
>
> [Upload document, wait 3 seconds]
>
> Done. The AI identified this as ISO 45001, mapped it to the correct clause, and gave us a 92% confidence score. It also flagged that Clause 6.1.3 — Risk Assessment — has low coverage. That's a gap insight your team can act on immediately.
>
> Doing this manually? Your SHEQ officer reads the document, cross-references the standard, decides which clause it maps to. That takes 15 to 30 minutes per document. We just did it in 3 seconds."

**Transition:** Click on Gap Analysis in sidebar

---

## PART 9: Gap Analysis & IMS (3 minutes)

### What to Show

1. **Gap Analysis dashboard** — 5 metric cards (Total Clauses, Evidenced, Partial, Gaps, Objectives)
2. **Standard filter** — Select ISO 45001, show clause-by-clause coverage bars
3. **Expand a standard card** — Show COVERED (green), PARTIAL (amber), GAP (red) per clause
4. **Navigate to IMS** — Show Integration Score (78%)
5. **Cross-Standard Equivalences** — "ISO 9001 §4.1 maps to ISO 14001 §4.1 — Context of the Organization. One document covers both."

### Talk Track

> "This is your compliance radar. Green means you have evidence. Amber means partial coverage. Red means a gap. No surprises at audit time.
>
> And this is where it gets powerful for Maziya — you hold three standards. The IMS engine finds where clauses overlap. Clause 4.1 in 9001 is equivalent to Clause 4.1 in 14001 and 45001. One document satisfies three standards. That's not just efficiency — that's how integrated management systems are supposed to work."

**Transition:** Click on Subcontractors in sidebar

---

## PART 10: Subcontractor Compliance (3 minutes)

### What to Show

1. **Subcontractor list** — Show tier ratings (Platinum/Gold/Silver)
2. **Click into a subcontractor** — Show certifications with expiry dates
3. **Expiry alerts** — "This welding certificate expires in 14 days"
4. **Portal link** — Show the "Invite to Portal" button
   - "This generates a secure link — your subcontractor uploads their certs directly, no login required"
5. **Approval workflow** — "Uploaded certs are PENDING_REVIEW until your team approves them"

### Talk Track

> "On a R1.8 billion signalling project, you have dozens of subcontractors. One expired welding certificate can halt work. ConformEdge tracks every cert, sends expiry alerts 30 and 7 days before, and gives your subcontractors a self-service portal to upload renewals.
>
> No more chasing suppliers via email. No more certificates lost in someone's inbox."

**Transition:** Click on Reports in sidebar

---

## PART 11: Reports & Audit Pack (3 minutes)

### What to Show

1. **Reports page** — Show the 11 Recharts charts
   - Compliance trend line
   - CAPA status pie chart
   - Incident severity distribution
   - Monthly activity timeline
2. **Date range filter** — Switch between Month/Quarter/Year
3. **Export buttons** — "Export to PDF" and "Export to CSV"
4. **Navigate to Audit Packs** — Show an audit pack with compiled evidence
5. **One-click PDF generation** — "This compiles all relevant documents, assessments, and CAPAs into a single PDF"

### Talk Track

> "When the auditor arrives, you don't scramble. You click 'Generate Audit Pack', select the standard, and the system compiles everything — classified documents, completed checklists, closed CAPAs, incident reports — into one professional PDF.
>
> That's your audit in a box."

---

## PART 12: Mobile & Field Access (1 minute)

### What to Show (if time permits)

1. **Open on phone** (or resize browser to mobile width)
2. Show the PWA — "Add to Home Screen" capability
3. **Offline indicator** — "Your field teams can capture incidents and checklist items even without signal — it syncs when they're back online"

### Talk Track

> "Your teams aren't sitting at desks. They're on scaffolding in Maraisburg, in culverts in KZN, on rooftops in Cape Town. ConformEdge works on any phone, offline, with camera access for evidence photos and signature capture for sign-offs."

---

## PART 13: Audit Trail (1 minute)

### What to Show

1. **Audit Trail page** — Show the immutable log
2. **Filter by AI_CLASSIFY** — "Every AI classification is logged"
3. **Filter by CREATE** — "Every document upload, every incident report — timestamped and traceable"

### Talk Track

> "Everything is logged. Every upload, every classification, every approval, every status change. This is your evidence that the system is being used — which is exactly what auditors want to see."

---

## PART 14: Pricing & Close (3 minutes)

### What to Present

| | Business Tier (Recommended) |
|---|---|
| **Monthly** | R8,499/mo |
| **Annual** | R7,054/mo (save 17%) |
| **Users** | Up to 25 (+R199/additional) |
| **Standards** | All 9 frameworks |
| **AI Credits** | 500/month |
| **Includes** | Work permits, incident management, subcontractor portal, statutory forms, API access |

### Talk Track

> "For Maziya's scale — multi-site, three ISO standards, subcontractor management — the Business tier at R8,499 per month covers everything you've seen today. That's less than 15% of what a single SHEQ officer costs.
>
> Annual billing brings it to R7,054 per month — a 17% saving.
>
> We include a 14-day free trial with 100 AI classification credits to get you started. No credit card required."

### Closing

> "What questions do you have?"

---

## Q&A Preparation — Likely Questions

### "How does the AI classification work?"
> "We use Anthropic's Claude AI. Your document is sent to the AI engine, which reads the content, identifies the relevant ISO standard and clause, and returns a confidence score. All processing is encrypted in transit. Documents are stored on Cloudflare R2 with South African data residency options."

### "Can we use this for all our projects across regions?"
> "Yes. ConformEdge is multi-tenant — you set up one organisation, add your team members with role-based access (Owner, Admin, Manager, Auditor, Viewer), and everyone works from the same platform. Your KZN team sees KZN projects, your Western Cape team sees theirs, but management gets the full picture."

### "What about our existing documents?"
> "You can bulk upload your existing document library. The AI will classify each one — we've seen libraries of 800+ documents classified in under an hour. Your existing ISO evidence doesn't go to waste."

### "How long to implement?"
> "You can be operational in a day. Sign up, invite your team, upload your first documents. The platform is SaaS — no installation, no servers to manage. For a structured rollout, we recommend a 30-day pilot with one project, then expand."

### "What about data security?"
> "Clerk authentication with multi-factor, role-based access control, encrypted file storage on Cloudflare R2, full audit trail of every action. We're building toward ISO 27001 compliance for the platform itself."

### "Can our subcontractors use it?"
> "Yes — without creating accounts. You generate a secure portal link, send it to your subcontractor, and they can upload certificates directly. Your team reviews and approves. The link expires automatically."

### "What if we need custom standards or frameworks?"
> "The Business tier supports custom standards. You can define your own clause structures — useful if you have internal quality frameworks beyond ISO."

### "How does this compare to IsoMetrix / SHEQX / MyEasyISO?"
> "Those are established tools, but they come with higher per-user costs (IsoMetrix at R1,850/user) and none of them offer AI document classification. ConformEdge is purpose-built for South African construction with DMRE/MHSA and POPIA frameworks included. And at R340-460 per user, we're 60-80% more affordable."

---

## Post-Demo Follow-Up Actions

- [ ] Send thank-you email within 2 hours
- [ ] Attach: Pricing one-pager + platform overview PDF
- [ ] Offer: 14-day free trial setup assistance
- [ ] Schedule: Follow-up call for week of 17 March
- [ ] Create: Maziya-specific trial organisation with their 3 ISO standards pre-configured
- [ ] Prepare: Pilot proposal for one active project (suggest a current PRASA project)
