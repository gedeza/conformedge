# Phase 4B — Objectives, Targets & KPI Tracking — Architecture Blueprint

**Date:** 2026-03-09
**Priority:** HIGH — Build Now
**Billing Tier:** Professional+
**ISO Clauses:** ISO 9001 §6.2, ISO 45001 §6.2
**Estimated Effort:** 2-3 weeks

---

## Architecture Decision

Objectives are standalone entities linked optionally to ISO standard clauses. Each objective has periodic measurements that build a trend history, rendered as a Recharts line chart. Status is **dynamically derived** from time-proportional progress — not manually set (except DRAFT/CANCELLED).

Key design: `deriveObjectiveStatus()` is a pure utility (no DB imports) that computes ON_TRACK/AT_RISK/BEHIND based on `currentValue / targetValue` vs `elapsed time / total time`. This mirrors the `assessment-status.ts` pattern.

---

## Prisma Schema Additions

### New Enums

```prisma
enum ObjectiveStatus {
  DRAFT
  ACTIVE
  ON_TRACK
  AT_RISK
  BEHIND
  ACHIEVED
  CANCELLED
}

enum MeasurementFrequency {
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
}
```

Add `OBJECTIVE_DUE` to `NotificationType` enum.

### New Models

```prisma
model Objective {
  id                   String               @id @default(uuid())
  title                String
  description          String?
  status               ObjectiveStatus      @default(DRAFT)
  targetValue          Float                @map("target_value")
  currentValue         Float                @default(0) @map("current_value")
  unit                 String?
  measurementFrequency MeasurementFrequency @map("measurement_frequency")
  dueDate              DateTime?            @map("due_date")
  organizationId       String               @map("organization_id")
  standardId           String?              @map("standard_id")
  standardClauseId     String?              @map("standard_clause_id")
  ownerId              String               @map("owner_id")
  createdAt            DateTime             @default(now()) @map("created_at")
  updatedAt            DateTime             @updatedAt @map("updated_at")

  organization   Organization          @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  standard       Standard?             @relation(fields: [standardId], references: [id], onDelete: SetNull)
  standardClause StandardClause?       @relation(fields: [standardClauseId], references: [id], onDelete: SetNull)
  owner          User                  @relation("ObjectiveOwner", fields: [ownerId], references: [id])
  measurements   ObjectiveMeasurement[]

  @@index([organizationId, createdAt(sort: Desc)], map: "idx_objective_org_created")
  @@index([organizationId, status], map: "idx_objective_org_status")
  @@index([standardClauseId], map: "idx_objective_clause")
  @@map("objectives")
}

model ObjectiveMeasurement {
  id           String   @id @default(uuid())
  value        Float
  notes        String?
  objectiveId  String   @map("objective_id")
  recordedById String   @map("recorded_by_id")
  measuredAt   DateTime @default(now()) @map("measured_at")
  createdAt    DateTime @default(now()) @map("created_at")

  objective  Objective @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  recordedBy User      @relation("MeasurementRecorder", fields: [recordedById], references: [id])

  @@index([objectiveId, measuredAt(sort: Desc)], map: "idx_objective_measurement_obj_date")
  @@map("objective_measurements")
}
```

### Back-References on Existing Models

- **Organization:** `objectives Objective[]`
- **User:** `ownedObjectives Objective[] @relation("ObjectiveOwner")` and `recordedMeasurements ObjectiveMeasurement[] @relation("MeasurementRecorder")`
- **Standard:** `objectives Objective[]`
- **StandardClause:** `objectives Objective[]`

---

## Status Derivation Logic

Pure utility at `src/lib/objective-status.ts`:

```typescript
export function deriveObjectiveStatus(input: StatusInput): ObjectiveStatusValue {
  const { currentValue, targetValue, dueDate, createdAt, status } = input
  if (status === "CANCELLED" || status === "DRAFT") return status
  if (targetValue > 0 && currentValue >= targetValue) return "ACHIEVED"
  if (!dueDate) return "ACTIVE"

  const now = new Date()
  const totalMs = dueDate.getTime() - createdAt.getTime()
  const elapsedMs = now.getTime() - createdAt.getTime()
  const progressRatio = totalMs > 0 ? Math.min(elapsedMs / totalMs, 1) : 1
  const achievementRatio = targetValue > 0 ? currentValue / targetValue : 0

  if (achievementRatio >= progressRatio * 0.9) return "ON_TRACK"
  if (achievementRatio >= progressRatio * 0.6) return "AT_RISK"
  return "BEHIND"
}
```

---

## Constants & Types

### `src/lib/constants.ts`

```typescript
export const OBJECTIVE_STATUSES = {
  DRAFT:     { label: "Draft",     color: "bg-gray-100 text-gray-800" },
  ACTIVE:    { label: "Active",    color: "bg-blue-100 text-blue-800" },
  ON_TRACK:  { label: "On Track",  color: "bg-green-100 text-green-800" },
  AT_RISK:   { label: "At Risk",   color: "bg-yellow-100 text-yellow-800" },
  BEHIND:    { label: "Behind",    color: "bg-red-100 text-red-800" },
  ACHIEVED:  { label: "Achieved",  color: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
} as const

export const MEASUREMENT_FREQUENCIES = {
  WEEKLY:    { label: "Weekly",    days: 7 },
  MONTHLY:   { label: "Monthly",   days: 30 },
  QUARTERLY: { label: "Quarterly", days: 90 },
  ANNUALLY:  { label: "Annually",  days: 365 },
} as const
```

NAV_ITEMS: `{ title: "Objectives", href: "/objectives", icon: "Target" }`

---

## Files to Create

```
src/lib/objective-status.ts                    — pure status derivation utility
src/app/(app)/(dashboard)/objectives/
  actions.ts                                   — server actions (CRUD + measurements + summary)
  page.tsx                                     — list page
  objective-table.tsx                          — client table with progress bars
  objective-form-trigger.tsx                   — "Add Objective" button
  objective-form.tsx                           — react-hook-form with standard/clause pickers
  objectives-help-panel.tsx                    — HelpPanel component
  [id]/
    page.tsx                                   — detail page
    objective-detail.tsx                       — tabs: Overview, Measurements, Trend Chart
    add-measurement-dialog.tsx                 — record new measurement value
    measurement-trend-chart.tsx                — Recharts LineChart of measurement history
src/components/dashboard/
  objectives-widget.tsx                        — dashboard widget (on-track vs at-risk)
```

## Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | 2 enums, 2 models, OBJECTIVE_DUE notification, back-refs on 4 models |
| `src/lib/constants.ts` | OBJECTIVE_STATUSES, MEASUREMENT_FREQUENCIES, OBJECTIVE_DUE notification, NAV_ITEMS |
| `src/types/index.ts` | ObjectiveStatus, MeasurementFrequency types, NotificationType |
| `src/lib/billing/plans.ts` | Add `objectivesTracking` to FeatureGates (Professional+) |
| `src/lib/billing/limit-checks.ts` | Add formatFeatureName entry |
| `src/middleware.ts` | Add `"/objectives(.*)"` to protected routes |
| `src/components/shared/status-badge.tsx` | Register `objective` type |
| `src/app/(app)/(dashboard)/dashboard/page.tsx` | Add ObjectivesWidget |
| `src/app/(app)/(dashboard)/reports/actions.ts` | Add objective achievement queries |
| `src/app/(app)/(dashboard)/reports/report-charts.tsx` | Add objective achievement chart |
| `src/lib/gap-detection.ts` | Flag clauses with objectives but no recent measurements |
| `src/app/api/cron/check-expiries/route.ts` | Add section: OBJECTIVE_DUE reminders |

---

## Server Actions

| Function | RBAC | Description |
|----------|------|-------------|
| `getObjectives(page)` | Any | Paginated list with standard, clause, owner, measurement count |
| `getObjective(id)` | Any | Single objective with all measurements |
| `getObjectiveOptions()` | Any | Simple id/title list for selectors |
| `getStandardsForObjectives()` | Any | Standards the org uses |
| `getClausesForStandard(standardId)` | Any | Sub-clauses for picker |
| `getMembers()` | Any | Active org members for owner picker |
| `createObjective(data)` | canCreate | Create + audit log |
| `updateObjective(id, data)` | canEdit | Update + audit log |
| `deleteObjective(id)` | canDelete | Delete + audit log |
| `addMeasurement(objectiveId, data)` | canCreate | Record value, update currentValue, audit log |
| `getObjectiveSummary()` | Any | Status breakdown + recent measurements |
| `getObjectivesForWidget()` | Any | Top 5 active objectives for dashboard |

---

## Recharts Integration (Measurement Trend)

`measurement-trend-chart.tsx` — Client component:
- `LineChart` with `XAxis` (dates), `YAxis` (values), `Line` (measurements), `ReferenceLine` (target)
- Data: measurements array sorted by `measuredAt`
- Target line: horizontal `ReferenceLine` at `objective.targetValue` (dashed, red)
- Unit shown on YAxis label
- Tooltip shows date, value, notes

---

## Gap Analysis Integration

In `src/lib/gap-detection.ts`, add to clause coverage computation:
- If a clause has linked objectives but none have been measured in the last `MEASUREMENT_FREQUENCIES[frequency].days`, flag it as a gap insight: "Objective '{title}' exists but has no recent measurement data"
- This surfaces in the gap analysis dashboard and per-clause drill-down

---

## Cron Integration

In `check-expiries/route.ts`, add section for OBJECTIVE_DUE:
- Find objectives where `dueDate` is within 7 days AND status is ACTIVE/ON_TRACK/AT_RISK/BEHIND
- Notify owner with OBJECTIVE_DUE type (deduplicated daily)
- Also find objectives where measurement is overdue based on `measurementFrequency` (last measurement older than frequency interval)

---

## Build Sequence

1. **Schema & Types** — enums, models, migration, types, constants, objective-status.ts
2. **Billing Gate** — FeatureGates, plan objects
3. **Server Actions** — all 12 functions with Zod validation
4. **List Page** — help panel, form, table, page, middleware, nav, StatusBadge
5. **Detail Page** — tabs, measurement dialog, trend chart
6. **Dashboard Widget** — ObjectivesWidget
7. **Reports Integration** — achievement queries + chart
8. **Gap Analysis Integration** — unmeasured objective flagging
9. **Cron Notifications** — OBJECTIVE_DUE reminders
10. **Verification** — tsc, build, manual testing

---

## Dashboard Widget Design

`ObjectivesWidget` (async Server Component):
- Header: Target icon + "Objectives"
- Large number: total active objectives
- Row: On Track (green badge + count), At Risk (yellow), Behind (red)
- Mini progress bars for top 3 objectives (currentValue/targetValue)
- "View all" link → /objectives

---

*Blueprint prepared 2026-03-09 for implementation.*
*Full implementation code available in agent output archive.*
