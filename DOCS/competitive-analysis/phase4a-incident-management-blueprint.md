# Phase 4A — Incident & Near-Miss Management — Architecture Blueprint

**Date:** 2026-03-09
**Priority:** CRITICAL — Build Now
**Billing Tier:** Professional+
**ISO Clauses:** ISO 45001 §9.1, SA Construction Regulations 2014, OHS Act

---

## Architecture Decision

The module is a first-class feature section parallel to CAPAs — not a sub-feature. The incident-CAPA relationship is many-to-one optional: an incident can spawn a CAPA, but incidents exist independently with their own lifecycle. This matches SA regulatory requirements where incident records must be standalone legal documents (W.Cl.2 form requires incident record independent of corrective action).

- **5-Whys root cause** reused from CAPAs: same `RootCauseData` type and `rootCauseData Json?` pattern
- **Statutory PDF forms** (W.Cl.2, SAPS 277) via dedicated API routes — standalone legal documents
- **LTI Rate** shown as raw count in Phase 1 (formula requires hours worked data — field reserved for future)

---

## Prisma Schema Additions

### New Enums

```prisma
enum IncidentStatus {
  REPORTED
  INVESTIGATING
  CORRECTIVE_ACTION
  CLOSED
}

enum IncidentType {
  NEAR_MISS
  FIRST_AID
  MEDICAL
  LOST_TIME
  FATALITY
  ENVIRONMENTAL
  PROPERTY_DAMAGE
}
```

### New Model

```prisma
model Incident {
  id               String         @id @default(uuid())
  title            String
  description      String?
  incidentType     IncidentType   @map("incident_type")
  status           IncidentStatus @default(REPORTED) @map("status")
  severity         RiskLevel      @default(MEDIUM)
  incidentDate     DateTime       @map("incident_date")
  location         String?
  injuredParty     String?        @map("injured_party")
  witnesses        String?
  immediateAction  String?        @map("immediate_action")
  rootCause        String?        @map("root_cause")
  rootCauseData    Json?          @map("root_cause_data")
  investigationDue DateTime?      @map("investigation_due")
  closedDate       DateTime?      @map("closed_date")
  organizationId   String         @map("organization_id")
  projectId        String?        @map("project_id")
  reportedById     String         @map("reported_by_id")
  investigatorId   String?        @map("investigator_id")
  capaId           String?        @map("capa_id")
  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  project      Project?     @relation(fields: [projectId], references: [id], onDelete: SetNull)
  reportedBy   User         @relation("IncidentReporter", fields: [reportedById], references: [id])
  investigator User?        @relation("IncidentInvestigator", fields: [investigatorId], references: [id])
  capa         Capa?        @relation(fields: [capaId], references: [id], onDelete: SetNull)

  @@index([organizationId, createdAt(sort: Desc)], map: "idx_incident_org_created")
  @@index([organizationId, status], map: "idx_incident_org_status")
  @@index([organizationId, incidentType], map: "idx_incident_org_type")
  @@index([organizationId, incidentDate(sort: Desc)], map: "idx_incident_org_date")
  @@index([projectId], map: "idx_incident_project")
  @@map("incidents")
}
```

### Back-References on Existing Models

- **Organization:** `incidents Incident[]`
- **User:** `reportedIncidents Incident[] @relation("IncidentReporter")` and `investigatedIncidents Incident[] @relation("IncidentInvestigator")`
- **Project:** `incidents Incident[]`
- **Capa:** `incidents Incident[]`

---

## State Machine

Legal transitions enforced by `transitionIncident`:

```
REPORTED         → INVESTIGATING
REPORTED         → CLOSED           (near-miss, no injury — can close directly)
INVESTIGATING    → CORRECTIVE_ACTION
INVESTIGATING    → CLOSED
CORRECTIVE_ACTION → CLOSED
```

Any other transition returns `{ success: false, error: "Invalid status transition" }`.

---

## Files to Create

```
src/app/(app)/(dashboard)/incidents/
  actions.ts                          — all server actions
  page.tsx                            — list page (Server Component)
  incident-table.tsx                  — client table with status/type badges
  incident-form-trigger.tsx           — "Report Incident" button
  incident-form.tsx                   — react-hook-form form (client)
  incidents-help-panel.tsx            — HelpPanel component
  [id]/
    page.tsx                          — detail page (Server Component)
    incident-detail.tsx               — client detail tabs component
    investigate-dialog.tsx            — set investigator + investigation due date
    close-incident-dialog.tsx         — transition to CLOSED with notes
    link-capa-dialog.tsx              — select existing CAPA or create new

src/app/api/incidents/[id]/pdf/
  route.ts                            — W.Cl.2 form PDF generation
  wcl2-pdf.tsx                        — @react-pdf/renderer component

src/app/api/incidents/[id]/saps277/
  route.ts                            — SAPS 277 fatality notice PDF
  saps277-pdf.tsx                     — @react-pdf/renderer component (FATALITY only)

src/components/dashboard/
  open-incidents-widget.tsx           — dashboard widget
```

## Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add 2 enums, 1 model, back-refs on 4 existing models |
| `src/lib/constants.ts` | Add `INCIDENT_STATUSES`, `INCIDENT_TYPES`, `INCIDENT_REPORTED` notification, NAV_ITEMS entry |
| `src/types/index.ts` | Add `IncidentStatus`, `IncidentType`, update `NotificationType` |
| `src/lib/billing/plans.ts` | Add `incidentManagement` to `FeatureGates` and all 4 plans |
| `src/lib/billing/limit-checks.ts` | Add `incidentManagement` to `formatFeatureName` |
| `src/middleware.ts` | Add `"/incidents(.*)"` to protected routes |
| `src/components/shared/status-badge.tsx` | Register `incident` type |
| `src/app/(app)/(dashboard)/dashboard/page.tsx` | Add `OpenIncidentsWidget` |
| `src/app/(app)/(dashboard)/reports/actions.ts` | Add incident queries |
| `src/app/(app)/(dashboard)/reports/page.tsx` | Add incident metric card |
| `src/app/(app)/(dashboard)/reports/report-charts.tsx` | Add incident trend + severity charts |
| `src/app/api/cron/check-expiries/route.ts` | Add section 9: overdue investigation alerts |

---

## Server Actions

| Function | RBAC | Description |
|----------|------|-------------|
| `getIncidents(page)` | Any role | Paginated list with project, reportedBy, investigator |
| `getIncident(id)` | Any role | Single incident with all relations |
| `createIncident(values)` | canCreate | Create + notify org members (INCIDENT_REPORTED) |
| `updateIncident(id, values)` | canEdit | Update fields |
| `deleteIncident(id)` | canDelete | MANAGER+ only |
| `transitionIncident(id, status)` | canEdit | State machine enforcement |
| `linkIncidentToCapa(incidentId, capaId)` | canEdit | Set capaId FK, validate same org |
| `unlinkIncidentFromCapa(incidentId)` | canEdit | Remove capaId link |
| `getOpenIncidentsSummary()` | Any role | Dashboard widget data |
| `getIncidentTrend(months)` | Any role | Monthly counts by type for reports |

---

## FATALITY Handling

When `incidentType === "FATALITY"` and transitions to `INVESTIGATING`:
1. Immediately `await` notify all OWNER/ADMIN users (not fire-and-forget — legal certainty)
2. SAPS 277 PDF route returns 403 if `incident.incidentType !== "FATALITY"`
3. Detail page shows SAPS 277 download button only for FATALITY type

---

## Build Sequence

1. **Schema & Types** — enums, model, migration, types, constants
2. **Billing Gate** — FeatureGates, plan objects, formatFeatureName
3. **Server Actions** — all 10 functions with Zod validation
4. **List Page** — help panel, form, table, page, middleware, nav
5. **Detail Page** — tabs, investigate dialog, close dialog, link CAPA
6. **PDF Generation** — W.Cl.2 and SAPS 277 routes
7. **Dashboard Widget** — OpenIncidentsWidget
8. **Reports Integration** — queries, metric cards, charts
9. **Cron Notifications** — overdue investigation alerts
10. **Verification** — tsc, build, manual testing

---

*Blueprint prepared 2026-03-09 for implementation.*
