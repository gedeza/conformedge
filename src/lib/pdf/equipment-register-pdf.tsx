import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// ── Brand colors ──────────────────────────────
const colors = {
  primary: "#1e3a5f",
  primaryLight: "#2d5a8e",
  accent: "#0d9488",
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

  // Cover
  coverBrand: { backgroundColor: colors.primary, width: "100%", padding: 40, marginBottom: 40 },
  coverTitle: { fontSize: 28, fontWeight: "bold", color: colors.white, textAlign: "center" },
  coverSubtitle: { fontSize: 14, color: "#a0c4e8", textAlign: "center", marginTop: 8 },
  coverMeta: { textAlign: "center", fontSize: 11, color: colors.textMuted, marginTop: 6 },
  coverFooter: { position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", fontSize: 9, color: colors.textMuted },

  // Section
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.primary, marginBottom: 8, paddingBottom: 4, borderBottom: `2px solid ${colors.primary}` },

  // Summary cards
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.bgLight, borderRadius: 4, padding: 10, border: `1px solid ${colors.border}` },
  statValue: { fontSize: 20, fontWeight: "bold", color: colors.primary },
  statLabel: { fontSize: 8, color: colors.textMuted, marginTop: 2 },

  // Tables
  headerRow: { flexDirection: "row", backgroundColor: colors.primary, paddingVertical: 5, paddingHorizontal: 4, borderRadius: 2 },
  headerCell: { fontWeight: "bold", color: colors.white, fontSize: 8, paddingHorizontal: 3 },
  row: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottom: `1px solid ${colors.border}` },
  rowAlt: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bgLight },
  cell: { fontSize: 8, paddingHorizontal: 3, color: colors.textDark },

  summaryBox: { backgroundColor: colors.bgAccent, padding: 12, borderRadius: 4, border: `1px solid ${colors.border}`, marginBottom: 10 },
})

// ── Types ─────────────────────────────────────

export interface EquipmentItem {
  assetNumber: string
  name: string
  category: string
  status: string
  manufacturer: string | null
  model: string | null
  serialNumber: string | null
  location: string | null
  swl: string | null
  ceMarking: boolean
  nextCalibrationDue: Date | null
  project: { name: string } | null
  _count: { calibrationRecords: number; maintenanceRecords: number; repairRecords: number }
}

export interface EquipmentRegisterPDFProps {
  organizationName: string
  generatedDate: string
  equipment: EquipmentItem[]
  metrics: {
    totalActive: number
    underRepair: number
    quarantined: number
    overdueCalibrations: number
    upcomingMaintenance: number
  }
}

// ── Helpers ───────────────────────────────────

function statusLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function statusColor(s: string): string {
  switch (s) {
    case "ACTIVE": return colors.green
    case "INACTIVE": return colors.textMuted
    case "UNDER_REPAIR": return colors.orange
    case "QUARANTINED": return colors.red
    case "DECOMMISSIONED": return colors.textMuted
    default: return colors.textDark
  }
}

function formatDate(d: Date | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
}

function PageFooter() {
  return (
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
  )
}

// ── Main Component ────────────────────────────

export function EquipmentRegisterPDF({ organizationName, generatedDate, equipment, metrics }: EquipmentRegisterPDFProps) {
  const total = equipment.length
  const byCategory: Record<string, number> = {}
  const byStatus: Record<string, number> = {}
  for (const e of equipment) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1
    byStatus[e.status] = (byStatus[e.status] || 0) + 1
  }

  return (
    <Document>
      {/* ═══════════════════ COVER PAGE ═══════════════════ */}
      <Page size="A4" style={{ ...styles.page, padding: 0 }}>
        <View style={{ flex: 1 }}>
          <View style={{ height: 180 }} />
          <View style={styles.coverBrand}>
            <Text style={styles.coverTitle}>Equipment Register</Text>
            <Text style={styles.coverSubtitle}>{organizationName}</Text>
          </View>
          <View style={{ alignItems: "center", padding: 40 }}>
            <Text style={styles.coverMeta}>Total Assets: {total}</Text>
            <Text style={styles.coverMeta}>Generated: {generatedDate}</Text>
          </View>
        </View>
        <Text style={styles.coverFooter}>ConformEdge — AI-Powered SHEQ & Compliance Management</Text>
      </Page>

      {/* ═══════════════════ SUMMARY ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>1. Fleet Summary</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Total Equipment</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{metrics.totalActive}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{metrics.underRepair}</Text>
            <Text style={styles.statLabel}>Under Repair</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{metrics.quarantined}</Text>
            <Text style={styles.statLabel}>Quarantined</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={{ ...styles.statValue, color: metrics.overdueCalibrations > 0 ? colors.red : colors.green }}>
              {metrics.overdueCalibrations}
            </Text>
            <Text style={styles.statLabel}>Overdue Calibrations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{metrics.upcomingMaintenance}</Text>
            <Text style={styles.statLabel}>Upcoming Maintenance (30d)</Text>
          </View>
        </View>

        {/* By Status */}
        <View style={styles.summaryBox}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: colors.primaryLight, marginBottom: 6 }}>
            Equipment by Status
          </Text>
          {Object.entries(byStatus).map(([status, count]) => (
            <Text key={status} style={{ fontSize: 9, marginBottom: 2 }}>
              {statusLabel(status)}: {count} ({total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)
            </Text>
          ))}
        </View>

        {/* By Category */}
        <View style={styles.summaryBox}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: colors.primaryLight, marginBottom: 6 }}>
            Equipment by Category
          </Text>
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <Text key={cat} style={{ fontSize: 9, marginBottom: 2 }}>
              {cat}: {count}
            </Text>
          ))}
        </View>

        <PageFooter />
      </Page>

      {/* ═══════════════════ ASSET REGISTER TABLE ═══════════════════ */}
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>2. Asset Register</Text>

        <View style={styles.headerRow}>
          <Text style={{ ...styles.headerCell, flex: 0.8 }}>Asset #</Text>
          <Text style={{ ...styles.headerCell, flex: 1.5 }}>Name</Text>
          <Text style={{ ...styles.headerCell, flex: 1 }}>Category</Text>
          <Text style={{ ...styles.headerCell, flex: 0.7 }}>Status</Text>
          <Text style={{ ...styles.headerCell, flex: 1 }}>Manufacturer</Text>
          <Text style={{ ...styles.headerCell, flex: 0.8 }}>Serial #</Text>
          <Text style={{ ...styles.headerCell, flex: 0.8 }}>Location</Text>
          <Text style={{ ...styles.headerCell, flex: 0.6 }}>SWL</Text>
          <Text style={{ ...styles.headerCell, flex: 0.3 }}>CE</Text>
          <Text style={{ ...styles.headerCell, flex: 0.8 }}>Next Cal.</Text>
        </View>

        {equipment.map((e, i) => (
          <View key={e.assetNumber} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
            <Text style={{ ...styles.cell, flex: 0.8, fontFamily: "Helvetica-Bold", fontSize: 7 }}>{e.assetNumber}</Text>
            <Text style={{ ...styles.cell, flex: 1.5 }}>{e.name}</Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{e.category}</Text>
            <Text style={{ ...styles.cell, flex: 0.7, color: statusColor(e.status), fontWeight: "bold" }}>
              {statusLabel(e.status)}
            </Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{e.manufacturer || "—"}</Text>
            <Text style={{ ...styles.cell, flex: 0.8, fontFamily: "Courier", fontSize: 7 }}>{e.serialNumber || "—"}</Text>
            <Text style={{ ...styles.cell, flex: 0.8 }}>{e.location || "—"}</Text>
            <Text style={{ ...styles.cell, flex: 0.6 }}>{e.swl || "—"}</Text>
            <Text style={{ ...styles.cell, flex: 0.3 }}>{e.ceMarking ? "Yes" : "No"}</Text>
            <Text style={{
              ...styles.cell,
              flex: 0.8,
              color: e.nextCalibrationDue && new Date(e.nextCalibrationDue) < new Date() ? colors.red : colors.textDark,
            }}>
              {formatDate(e.nextCalibrationDue)}
            </Text>
          </View>
        ))}

        {equipment.length === 0 && (
          <Text style={{ fontSize: 9, color: colors.textMuted, fontStyle: "italic", marginTop: 10, textAlign: "center" }}>
            No equipment registered.
          </Text>
        )}

        <PageFooter />
      </Page>
    </Document>
  )
}
