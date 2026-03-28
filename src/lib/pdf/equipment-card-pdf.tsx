import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// ── Brand colors ──────────────────────────────
const colors = {
  primary: "#1e3a5f",
  primaryLight: "#2d5a8e",
  textDark: "#1f2937",
  textMuted: "#6b7280",
  bgLight: "#f8fafc",
  bgAccent: "#f0f9ff",
  border: "#e2e8f0",
  white: "#ffffff",
  green: "#16a34a",
  red: "#dc2626",
  yellow: "#ca8a04",
  orange: "#ea580c",
}

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 60, fontFamily: "Helvetica", fontSize: 9, color: colors.textDark },
  pageNumber: { position: "absolute", bottom: 25, left: 0, right: 0, textAlign: "center", fontSize: 8, color: colors.textMuted },

  // Header band
  headerBand: { backgroundColor: colors.primary, padding: 20, marginHorizontal: -40, marginTop: -40, marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.white },
  headerSubtitle: { fontSize: 10, color: "#a0c4e8", marginTop: 4 },
  headerMeta: { fontSize: 8, color: "#8ab4d8", marginTop: 2 },

  // Section
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: colors.primary, marginBottom: 8, paddingBottom: 4, borderBottom: `2px solid ${colors.primary}`, marginTop: 16 },
  subTitle: { fontSize: 11, fontWeight: "bold", color: colors.primaryLight, marginTop: 10, marginBottom: 4 },

  // Field
  fieldRow: { flexDirection: "row", paddingVertical: 3, borderBottom: `1px solid ${colors.border}` },
  fieldLabel: { flex: 1, fontSize: 9, color: colors.textMuted, fontWeight: "bold" },
  fieldValue: { flex: 2, fontSize: 9, color: colors.textDark },

  // Tables
  headerRow: { flexDirection: "row", backgroundColor: colors.primary, paddingVertical: 5, paddingHorizontal: 4, borderRadius: 2 },
  headerCell: { fontWeight: "bold", color: colors.white, fontSize: 8, paddingHorizontal: 3 },
  row: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottom: `1px solid ${colors.border}` },
  rowAlt: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bgLight },
  cell: { fontSize: 8, paddingHorizontal: 3, color: colors.textDark },

  // Stats
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: colors.bgLight, borderRadius: 4, padding: 10, border: `1px solid ${colors.border}` },
  statValue: { fontSize: 18, fontWeight: "bold", color: colors.primary },
  statLabel: { fontSize: 8, color: colors.textMuted, marginTop: 2 },

  badge: { fontSize: 8, fontWeight: "bold", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  emptyText: { fontSize: 9, color: colors.textMuted, fontStyle: "italic", marginTop: 6 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: colors.textMuted },
})

// ── Types ─────────────────────────────────────

interface CalibrationRecord {
  calibrationDate: Date
  nextDueDate: Date
  certificateNumber: string | null
  calibratedBy: string
  result: string
  deviation: string | null
  notes: string | null
  recordedBy: { firstName: string | null; lastName: string | null }
}

interface MaintenanceRecord {
  scheduledDate: Date
  maintenanceType: string
  description: string | null
  performedBy: string | null
  cost: { toNumber(): number } | number | null
  status: string
  completedDate: Date | null
  recordedBy: { firstName: string | null; lastName: string | null }
}

interface RepairRecord {
  repairDate: Date
  description: string | null
  supplierName: string | null
  priority: string
  cost: { toNumber(): number } | number | null
  returnToServiceDate: Date | null
  recordedBy: { firstName: string | null; lastName: string | null }
  capa: { title: string; status: string } | null
}

export interface EquipmentCardPDFProps {
  organizationName: string
  generatedDate: string
  equipment: {
    assetNumber: string
    name: string
    description: string | null
    category: string
    status: string
    manufacturer: string | null
    model: string | null
    serialNumber: string | null
    location: string | null
    swl: string | null
    ceMarking: boolean
    purchaseDate: Date | null
    commissionDate: Date | null
    warrantyExpiry: Date | null
    nextCalibrationDue: Date | null
    notes: string | null
    project: { name: string } | null
    calibrationRecords: CalibrationRecord[]
    maintenanceRecords: MaintenanceRecord[]
    repairRecords: RepairRecord[]
  }
}

// ── Helpers ───────────────────────────────────

function statusLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function statusColor(s: string): string {
  switch (s) {
    case "ACTIVE": case "PASS": case "COMPLETED": return colors.green
    case "INACTIVE": case "SCHEDULED": return colors.textMuted
    case "UNDER_REPAIR": case "CONDITIONAL": case "IN_PROGRESS": return colors.orange
    case "QUARANTINED": case "FAIL": case "EMERGENCY": return colors.red
    case "DECOMMISSIONED": return colors.textMuted
    default: return colors.textDark
  }
}

function fmt(d: Date | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
}

function userName(u: { firstName: string | null; lastName: string | null }): string {
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || "—"
}

function currency(n: { toNumber(): number } | number | null): string {
  if (n === null || n === undefined) return "—"
  const val = typeof n === "number" ? n : n.toNumber()
  return `R ${val.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  )
}

function PageFooter({ assetNumber }: { assetNumber: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{assetNumber} — Equipment Card</Text>
      <Text>ConformEdge</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
    </View>
  )
}

// ── Main Component ────────────────────────────

export function EquipmentCardPDF({ organizationName, generatedDate, equipment: e }: EquipmentCardPDFProps) {
  const calCount = e.calibrationRecords.length
  const maintCount = e.maintenanceRecords.length
  const repairCount = e.repairRecords.length
  const totalCost = [...e.maintenanceRecords, ...e.repairRecords].reduce(
    (sum, r) => {
      if (!r.cost) return sum
      const val = typeof r.cost === "number" ? r.cost : r.cost.toNumber()
      return sum + val
    }, 0,
  )

  return (
    <Document>
      {/* ═══════════════════ EQUIPMENT DETAILS ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.headerTitle}>{e.name}</Text>
          <Text style={styles.headerSubtitle}>
            {e.assetNumber} — {e.category}
          </Text>
          <Text style={styles.headerMeta}>
            {organizationName} | Generated: {generatedDate}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={{ ...styles.badge, color: statusColor(e.status) }}>{statusLabel(e.status)}</Text>
            <Text style={styles.statLabel}>Current Status</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{calCount}</Text>
            <Text style={styles.statLabel}>Calibrations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{maintCount}</Text>
            <Text style={styles.statLabel}>Maintenance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{repairCount}</Text>
            <Text style={styles.statLabel}>Repairs</Text>
          </View>
        </View>

        {/* Identity & Specifications */}
        <Text style={styles.sectionTitle}>Equipment Details</Text>
        <Field label="Manufacturer" value={e.manufacturer || "—"} />
        <Field label="Model" value={e.model || "—"} />
        <Field label="Serial Number" value={e.serialNumber || "—"} />
        <Field label="Location" value={e.location || "—"} />
        <Field label="Project" value={e.project?.name || "—"} />
        <Field label="Safe Working Load" value={e.swl || "—"} />
        <Field label="CE Marking" value={e.ceMarking ? "Yes" : "No"} />
        <Field label="Purchase Date" value={fmt(e.purchaseDate)} />
        <Field label="Commission Date" value={fmt(e.commissionDate)} />
        <Field label="Warranty Expiry" value={fmt(e.warrantyExpiry)} />
        <Field label="Next Calibration Due" value={fmt(e.nextCalibrationDue)} />
        {totalCost > 0 && <Field label="Total Recorded Costs" value={currency(totalCost)} />}

        {e.description && (
          <>
            <Text style={styles.subTitle}>Description</Text>
            <Text style={{ fontSize: 9, marginBottom: 4 }}>{e.description}</Text>
          </>
        )}

        {e.notes && (
          <>
            <Text style={styles.subTitle}>Notes</Text>
            <Text style={{ fontSize: 9, marginBottom: 4 }}>{e.notes}</Text>
          </>
        )}

        <PageFooter assetNumber={e.assetNumber} />
      </Page>

      {/* ═══════════════════ CALIBRATION HISTORY ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>Calibration History ({calCount})</Text>

        {calCount === 0 ? (
          <Text style={styles.emptyText}>No calibration records.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Date</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Next Due</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Certificate #</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Calibrated By</Text>
              <Text style={{ ...styles.headerCell, flex: 0.6 }}>Result</Text>
              <Text style={{ ...styles.headerCell, flex: 1.2 }}>Deviation / Notes</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Recorded By</Text>
            </View>
            {e.calibrationRecords.map((r, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{fmt(r.calibrationDate)}</Text>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{fmt(r.nextDueDate)}</Text>
                <Text style={{ ...styles.cell, flex: 0.8, fontFamily: "Courier", fontSize: 7 }}>{r.certificateNumber || "—"}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{r.calibratedBy}</Text>
                <Text style={{ ...styles.cell, flex: 0.6, color: statusColor(r.result), fontWeight: "bold" }}>
                  {r.result}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.2 }}>
                  {[r.deviation, r.notes].filter(Boolean).join(" — ") || "—"}
                </Text>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{userName(r.recordedBy)}</Text>
              </View>
            ))}
          </>
        )}

        <PageFooter assetNumber={e.assetNumber} />
      </Page>

      {/* ═══════════════════ MAINTENANCE HISTORY ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>Maintenance History ({maintCount})</Text>

        {maintCount === 0 ? (
          <Text style={styles.emptyText}>No maintenance records.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Scheduled</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Completed</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Type</Text>
              <Text style={{ ...styles.headerCell, flex: 0.6 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1.2 }}>Description</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Performed By</Text>
              <Text style={{ ...styles.headerCell, flex: 0.5 }}>Cost</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Recorded By</Text>
            </View>
            {e.maintenanceRecords.map((r, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{fmt(r.scheduledDate)}</Text>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{fmt(r.completedDate)}</Text>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{statusLabel(r.maintenanceType)}</Text>
                <Text style={{ ...styles.cell, flex: 0.6, color: statusColor(r.status), fontWeight: "bold" }}>
                  {statusLabel(r.status)}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.2 }}>{r.description || "—"}</Text>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{r.performedBy || "—"}</Text>
                <Text style={{ ...styles.cell, flex: 0.5 }}>{currency(r.cost)}</Text>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{userName(r.recordedBy)}</Text>
              </View>
            ))}
          </>
        )}

        <PageFooter assetNumber={e.assetNumber} />
      </Page>

      {/* ═══════════════════ REPAIR HISTORY ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>Repair History ({repairCount})</Text>

        {repairCount === 0 ? (
          <Text style={styles.emptyText}>No repair records.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Date</Text>
              <Text style={{ ...styles.headerCell, flex: 0.6 }}>Priority</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Description</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Supplier</Text>
              <Text style={{ ...styles.headerCell, flex: 0.5 }}>Cost</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>Return to Service</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>CAPA</Text>
            </View>
            {e.repairRecords.map((r, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{fmt(r.repairDate)}</Text>
                <Text style={{ ...styles.cell, flex: 0.6, color: statusColor(r.priority), fontWeight: "bold" }}>
                  {r.priority}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{r.description || "—"}</Text>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{r.supplierName || "—"}</Text>
                <Text style={{ ...styles.cell, flex: 0.5 }}>{currency(r.cost)}</Text>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{fmt(r.returnToServiceDate)}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>
                  {r.capa ? `${r.capa.title} (${statusLabel(r.capa.status)})` : "—"}
                </Text>
              </View>
            ))}
          </>
        )}

        <PageFooter assetNumber={e.assetNumber} />
      </Page>
    </Document>
  )
}
