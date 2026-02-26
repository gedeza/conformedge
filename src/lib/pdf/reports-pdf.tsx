import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { ReportData } from "@/app/(dashboard)/reports/actions"

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
  subTitle: { fontSize: 11, fontWeight: "bold", color: colors.primaryLight, marginTop: 10, marginBottom: 4 },

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

  text: { marginBottom: 3 },
  summaryBox: { backgroundColor: colors.bgAccent, padding: 12, borderRadius: 4, border: `1px solid ${colors.border}`, marginBottom: 10 },
})

// ── Types ─────────────────────────────────────

export interface ReportsPDFProps {
  organizationName: string
  dateRangeLabel: string
  generatedDate: string
  data: ReportData
}

// ── Helpers ───────────────────────────────────

function statusLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function PageFooter() {
  return (
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
  )
}

// ── Main Component ────────────────────────────

export function ReportsPDF({ organizationName, dateRangeLabel, generatedDate, data }: ReportsPDFProps) {
  const s = data.summary

  return (
    <Document>
      {/* ═══════════════════ COVER PAGE ═══════════════════ */}
      <Page size="A4" style={{ ...styles.page, padding: 0 }}>
        <View style={{ flex: 1 }}>
          <View style={{ height: 180 }} />
          <View style={styles.coverBrand}>
            <Text style={styles.coverTitle}>Compliance Report</Text>
            <Text style={styles.coverSubtitle}>{organizationName}</Text>
          </View>
          <View style={{ alignItems: "center", padding: 40 }}>
            <Text style={styles.coverMeta}>Period: {dateRangeLabel}</Text>
            <Text style={styles.coverMeta}>Generated: {generatedDate}</Text>
          </View>
        </View>
        <Text style={styles.coverFooter}>ConformEdge — AI-Powered ISO Compliance Management</Text>
      </Page>

      {/* ═══════════════════ EXECUTIVE SUMMARY ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>1. Executive Summary</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{s.totalProjects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{s.totalDocuments}</Text>
            <Text style={styles.statLabel}>Documents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{s.totalAssessments}</Text>
            <Text style={styles.statLabel}>Assessments</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{s.totalCapas}</Text>
            <Text style={styles.statLabel}>CAPAs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{s.totalChecklists}</Text>
            <Text style={styles.statLabel}>Checklists</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{s.totalSubcontractors}</Text>
            <Text style={styles.statLabel}>Subcontractors</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.subTitle}>Key Metrics</Text>
          <Text style={styles.text}>
            Average Compliance Score: {s.avgComplianceScore !== null ? `${s.avgComplianceScore.toFixed(1)}%` : "No assessments scored"}
          </Text>
          <Text style={styles.text}>Overdue CAPAs: {s.overdueCapas}</Text>
          <Text style={styles.text}>Expired Documents: {s.expiringDocs}</Text>
        </View>

        <PageFooter />
      </Page>

      {/* ═══════════════════ COMPLIANCE BY STANDARD ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>2. Compliance by Standard</Text>

        {data.complianceByStandard.length === 0 ? (
          <Text style={{ fontSize: 9, color: colors.textMuted, fontStyle: "italic" }}>No compliance data available.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Standard</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Checklist Completion</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Assessment Score</Text>
            </View>
            {data.complianceByStandard.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                <Text style={{ ...styles.cell, flex: 2 }}>{row.standard}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{row.checklistCompletion}%</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{row.assessmentScore}%</Text>
              </View>
            ))}
          </>
        )}

        <PageFooter />
      </Page>

      {/* ═══════════════════ COMPLIANCE TREND ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>3. Compliance Trend (Last 12 Months)</Text>

        <View style={styles.headerRow}>
          <Text style={{ ...styles.headerCell, flex: 2 }}>Month</Text>
          <Text style={{ ...styles.headerCell, flex: 1.5 }}>Assessment Score</Text>
          <Text style={{ ...styles.headerCell, flex: 1.5 }}>Checklist Completion</Text>
        </View>
        {data.complianceTrend.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
            <Text style={{ ...styles.cell, flex: 2 }}>{row.month}</Text>
            <Text style={{ ...styles.cell, flex: 1.5 }}>{row.assessmentScore !== null ? `${row.assessmentScore}%` : "—"}</Text>
            <Text style={{ ...styles.cell, flex: 1.5 }}>{row.checklistCompletion !== null ? `${row.checklistCompletion}%` : "—"}</Text>
          </View>
        ))}

        <PageFooter />
      </Page>

      {/* ═══════════════════ CAPA & DOCUMENT STATUS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>4. CAPA & Document Status</Text>

        <Text style={styles.subTitle}>CAPA Status</Text>
        <View style={styles.headerRow}>
          <Text style={{ ...styles.headerCell, flex: 2 }}>Status</Text>
          <Text style={{ ...styles.headerCell, flex: 1 }}>Count</Text>
        </View>
        {data.capasByStatus.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
            <Text style={{ ...styles.cell, flex: 2 }}>{statusLabel(row.status)}</Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{row.count}</Text>
          </View>
        ))}

        <Text style={styles.subTitle}>CAPA Priority</Text>
        <View style={styles.headerRow}>
          <Text style={{ ...styles.headerCell, flex: 2 }}>Priority</Text>
          <Text style={{ ...styles.headerCell, flex: 1 }}>Count</Text>
        </View>
        {data.capasByPriority.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
            <Text style={{ ...styles.cell, flex: 2 }}>{statusLabel(row.priority)}</Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{row.count}</Text>
          </View>
        ))}

        <Text style={styles.subTitle}>Document Status</Text>
        <View style={styles.headerRow}>
          <Text style={{ ...styles.headerCell, flex: 2 }}>Status</Text>
          <Text style={{ ...styles.headerCell, flex: 1 }}>Count</Text>
        </View>
        {data.documentsByStatus.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
            <Text style={{ ...styles.cell, flex: 2 }}>{statusLabel(row.status)}</Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{row.count}</Text>
          </View>
        ))}

        <PageFooter />
      </Page>

      {/* ═══════════════════ RISK DISTRIBUTION ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>5. Risk Distribution</Text>

        <View style={styles.headerRow}>
          <Text style={{ ...styles.headerCell, flex: 2 }}>Risk Level</Text>
          <Text style={{ ...styles.headerCell, flex: 1 }}>Count</Text>
        </View>
        {data.riskDistribution.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
            <Text style={{ ...styles.cell, flex: 2 }}>{statusLabel(row.level)}</Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{row.count}</Text>
          </View>
        ))}

        <PageFooter />
      </Page>

      {/* ═══════════════════ SUBCONTRACTOR METRICS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>6. Subcontractor Metrics</Text>

        <Text style={styles.subTitle}>BEE Level Distribution</Text>
        {data.subcontractorMetrics.beeDistribution.length === 0 ? (
          <Text style={{ fontSize: 9, color: colors.textMuted, fontStyle: "italic" }}>No BEE data available.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 2 }}>BEE Level</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Count</Text>
            </View>
            {data.subcontractorMetrics.beeDistribution.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                <Text style={{ ...styles.cell, flex: 2 }}>{row.level}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{row.count}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.subTitle}>Compliance Score Rankings</Text>
        {data.subcontractorMetrics.scoredSubcontractors.length === 0 ? (
          <Text style={{ fontSize: 9, color: colors.textMuted, fontStyle: "italic" }}>No subcontractors to score.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Name</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Score</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Tier</Text>
            </View>
            {data.subcontractorMetrics.scoredSubcontractors.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                <Text style={{ ...styles.cell, flex: 3 }}>{row.name}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{row.score}%</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{row.tier}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.subTitle}>Certifications Expiring (Next 90 Days)</Text>
        {data.subcontractorMetrics.certExpiryCountdown.length === 0 ? (
          <Text style={{ fontSize: 9, color: colors.textMuted, fontStyle: "italic" }}>No certifications expiring soon.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Subcontractor</Text>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Certification</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Expires</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Days</Text>
            </View>
            {data.subcontractorMetrics.certExpiryCountdown.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                <Text style={{ ...styles.cell, flex: 2 }}>{row.subcontractorName}</Text>
                <Text style={{ ...styles.cell, flex: 2 }}>{row.certName}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{row.expiresAt}</Text>
                <Text style={{
                  ...styles.cell,
                  flex: 1,
                  color: row.daysUntilExpiry < 14 ? colors.red : row.daysUntilExpiry < 30 ? colors.orange : colors.textDark,
                }}>
                  {row.daysUntilExpiry}
                </Text>
              </View>
            ))}
          </>
        )}

        <PageFooter />
      </Page>

      {/* ═══════════════════ FOOTER PAGE ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 8, width: "100%" }}>
            <Text style={{ fontSize: 8, color: colors.textMuted, textAlign: "center" }}>
              Generated by ConformEdge — AI-Powered ISO Compliance Management
            </Text>
            <Text style={{ fontSize: 8, color: colors.textMuted, textAlign: "center", marginTop: 2 }}>
              {organizationName} • {generatedDate}
            </Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </Document>
  )
}
