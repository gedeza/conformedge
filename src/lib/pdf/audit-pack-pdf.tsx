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
  // ── Page ──
  page: { padding: 40, paddingBottom: 60, fontFamily: "Helvetica", fontSize: 9, color: colors.textDark },
  pageNumber: { position: "absolute", bottom: 25, left: 0, right: 0, textAlign: "center", fontSize: 8, color: colors.textMuted },

  // ── Cover ──
  cover: { flex: 1, justifyContent: "center", alignItems: "center" },
  coverBrand: { backgroundColor: colors.primary, width: "100%", padding: 40, marginBottom: 40 },
  coverTitle: { fontSize: 28, fontWeight: "bold", color: colors.white, textAlign: "center" },
  coverSubtitle: { fontSize: 14, color: "#a0c4e8", textAlign: "center", marginTop: 8 },
  coverMeta: { textAlign: "center", fontSize: 11, color: colors.textMuted, marginTop: 6 },
  coverFooter: { position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", fontSize: 9, color: colors.textMuted },

  // ── TOC ──
  tocItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottom: `1px solid ${colors.border}` },
  tocLabel: { fontSize: 11 },
  tocPage: { fontSize: 11, color: colors.textMuted },

  // ── Section ──
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.primary, marginBottom: 8, paddingBottom: 4, borderBottom: `2px solid ${colors.primary}` },
  subTitle: { fontSize: 11, fontWeight: "bold", color: colors.primaryLight, marginTop: 10, marginBottom: 4 },

  // ── Summary cards ──
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.bgLight, borderRadius: 4, padding: 10, border: `1px solid ${colors.border}` },
  statValue: { fontSize: 20, fontWeight: "bold", color: colors.primary },
  statLabel: { fontSize: 8, color: colors.textMuted, marginTop: 2 },

  // ── Tables ──
  headerRow: { flexDirection: "row", backgroundColor: colors.primary, paddingVertical: 5, paddingHorizontal: 4, borderRadius: 2 },
  headerCell: { fontWeight: "bold", color: colors.white, fontSize: 8, paddingHorizontal: 3 },
  row: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottom: `1px solid ${colors.border}` },
  rowAlt: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bgLight },
  cell: { fontSize: 8, paddingHorizontal: 3, color: colors.textDark },

  // ── Misc ──
  text: { marginBottom: 3 },
  emptyText: { fontSize: 9, color: colors.textMuted, fontStyle: "italic", marginVertical: 8 },
  badge: { fontSize: 7, borderRadius: 3, paddingVertical: 1, paddingHorizontal: 5, color: colors.white },
  summaryBox: { backgroundColor: colors.bgAccent, padding: 12, borderRadius: 4, border: `1px solid ${colors.border}`, marginBottom: 10 },
  signatureLine: { borderTop: `1px solid ${colors.textDark}`, width: 200, marginTop: 40, paddingTop: 4 },
})

// ── Types ─────────────────────────────────────

export interface AuditPackPDFProps {
  title: string
  description?: string
  organizationName: string
  projectName: string
  generatedDate: string
  createdBy: string
  documents: Array<{
    title: string
    status: string
    fileType: string | null
    version: number
    classifications: Array<{ clauseNumber: string; standard: string }>
  }>
  assessments: Array<{
    title: string
    score: number | null
    riskLevel: string | null
    standard: string
    completedDate: string | null
    questions: Array<{
      question: string
      answer: string | null
      score: number | null
    }>
  }>
  capas: Array<{
    title: string
    type: string
    status: string
    priority: string
    rootCause: string | null
    dueDate: string | null
    actions: Array<{
      description: string
      isCompleted: boolean
      dueDate: string | null
    }>
  }>
  checklists: Array<{
    title: string
    completion: number
    standard: string
    status: string
    items: Array<{
      description: string
      isCompliant: boolean | null
      clauseNumber: string | null
    }>
  }>
}

// ── Helpers ───────────────────────────────────

function riskColor(level: string | null): string {
  switch (level) {
    case "LOW": return colors.green
    case "MEDIUM": return colors.yellow
    case "HIGH": return colors.orange
    case "CRITICAL": return colors.red
    default: return colors.textMuted
  }
}

function priorityColor(p: string): string {
  switch (p) {
    case "LOW": return colors.green
    case "MEDIUM": return colors.yellow
    case "HIGH": return colors.orange
    case "CRITICAL": return colors.red
    default: return colors.textMuted
  }
}

function statusLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Page footer component ─────────────────────
function PageFooter() {
  return (
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
  )
}

// ── Main Component ────────────────────────────

export function AuditPackPDF({
  title,
  description,
  organizationName,
  projectName,
  generatedDate,
  createdBy,
  documents,
  assessments,
  capas,
  checklists,
}: AuditPackPDFProps) {
  // ── Compute summary stats ──
  const avgScore = assessments.length > 0
    ? assessments.filter((a) => a.score !== null).reduce((sum, a) => sum + (a.score ?? 0), 0) /
      (assessments.filter((a) => a.score !== null).length || 1)
    : null

  const openCapas = capas.filter((c) => c.status !== "CLOSED").length
  const overdueCapas = capas.filter((c) => c.status === "OVERDUE").length
  const totalChecklistItems = checklists.reduce((sum, cl) => sum + cl.items.length, 0)
  const compliantItems = checklists.reduce((sum, cl) => sum + cl.items.filter((i) => i.isCompliant === true).length, 0)
  const overallCompliance = totalChecklistItems > 0 ? (compliantItems / totalChecklistItems) * 100 : 0

  return (
    <Document>
      {/* ═══════════════════ COVER PAGE ═══════════════════ */}
      <Page size="A4" style={{ ...styles.page, padding: 0 }}>
        <View style={{ flex: 1 }}>
          <View style={{ height: 180 }} />
          <View style={styles.coverBrand}>
            <Text style={styles.coverTitle}>{title}</Text>
            <Text style={styles.coverSubtitle}>{organizationName}</Text>
          </View>
          <View style={{ alignItems: "center", padding: 40 }}>
            <Text style={styles.coverMeta}>Project: {projectName}</Text>
            <Text style={styles.coverMeta}>Prepared by: {createdBy}</Text>
            <Text style={styles.coverMeta}>Generated: {generatedDate}</Text>
            {description && (
              <Text style={{ ...styles.coverMeta, marginTop: 16, maxWidth: 400, textAlign: "center" }}>{description}</Text>
            )}
          </View>
        </View>
        <Text style={styles.coverFooter}>ConformEdge — AI-Powered ISO Compliance Management</Text>
      </Page>

      {/* ═══════════════════ TABLE OF CONTENTS ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Table of Contents</Text>
        {[
          { label: "Executive Summary", page: "3" },
          { label: "Document Index", page: "4" },
          { label: "Assessment Results", page: "5" },
          { label: "Corrective & Preventive Actions", page: "6" },
          { label: "Compliance Checklists", page: "7" },
          { label: "Sign-Off", page: "8" },
        ].map((item, i) => (
          <View key={i} style={styles.tocItem}>
            <Text style={styles.tocLabel}>{i + 1}. {item.label}</Text>
            <Text style={styles.tocPage}>{item.page}</Text>
          </View>
        ))}
        <PageFooter />
      </Page>

      {/* ═══════════════════ EXECUTIVE SUMMARY ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>1. Executive Summary</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{documents.length}</Text>
            <Text style={styles.statLabel}>Documents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{assessments.length}</Text>
            <Text style={styles.statLabel}>Assessments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{capas.length}</Text>
            <Text style={styles.statLabel}>CAPAs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{checklists.length}</Text>
            <Text style={styles.statLabel}>Checklists</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.subTitle}>Key Metrics</Text>
          <Text style={styles.text}>
            Average Assessment Score: {avgScore !== null ? `${avgScore.toFixed(1)}%` : "No assessments scored"}
          </Text>
          <Text style={styles.text}>
            Open CAPAs: {openCapas} {overdueCapas > 0 ? `(${overdueCapas} overdue)` : ""}
          </Text>
          <Text style={styles.text}>
            Overall Compliance: {overallCompliance.toFixed(1)}% ({compliantItems}/{totalChecklistItems} items)
          </Text>
        </View>

        {assessments.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.subTitle}>Risk Distribution</Text>
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((level) => {
              const count = assessments.filter((a) => a.riskLevel === level).length
              if (count === 0) return null
              return (
                <Text key={level} style={{ ...styles.text, fontSize: 9 }}>
                  {level}: {count} assessment{count > 1 ? "s" : ""}
                </Text>
              )
            })}
          </View>
        )}

        {capas.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.subTitle}>CAPA Status Breakdown</Text>
            {(["OPEN", "IN_PROGRESS", "VERIFICATION", "CLOSED", "OVERDUE"] as const).map((s) => {
              const count = capas.filter((c) => c.status === s).length
              if (count === 0) return null
              return (
                <Text key={s} style={{ ...styles.text, fontSize: 9 }}>
                  {statusLabel(s)}: {count}
                </Text>
              )
            })}
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ═══════════════════ DOCUMENTS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>2. Document Index</Text>
        {documents.length === 0 ? (
          <Text style={styles.emptyText}>No documents in this project.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Title</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Type</Text>
              <Text style={{ ...styles.headerCell, flex: 0.5 }}>Ver.</Text>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Classifications</Text>
            </View>
            {documents.map((doc, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 3 }}>{doc.title}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(doc.status)}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{doc.fileType ?? "N/A"}</Text>
                <Text style={{ ...styles.cell, flex: 0.5 }}>v{doc.version}</Text>
                <Text style={{ ...styles.cell, flex: 2 }}>
                  {doc.classifications.length > 0
                    ? doc.classifications.map((c) => `${c.standard} §${c.clauseNumber}`).join(", ")
                    : "—"}
                </Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ ASSESSMENTS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>3. Assessment Results</Text>
        {assessments.length === 0 ? (
          <Text style={styles.emptyText}>No assessments conducted.</Text>
        ) : (
          <>
            {/* Summary table */}
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Title</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Standard</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Score</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Risk</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Completed</Text>
            </View>
            {assessments.map((a, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 3 }}>{a.title}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{a.standard}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{a.score !== null ? `${a.score.toFixed(1)}%` : "—"}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: riskColor(a.riskLevel) }}>
                  {a.riskLevel ?? "—"}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{a.completedDate ?? "Pending"}</Text>
              </View>
            ))}

            {/* Question-level detail per assessment */}
            {assessments.filter((a) => a.questions.length > 0).map((a, ai) => (
              <View key={ai} style={{ marginTop: 12 }} wrap={false}>
                <Text style={styles.subTitle}>{a.title} — Question Detail</Text>
                <View style={styles.headerRow}>
                  <Text style={{ ...styles.headerCell, flex: 4 }}>Question</Text>
                  <Text style={{ ...styles.headerCell, flex: 2 }}>Answer</Text>
                  <Text style={{ ...styles.headerCell, flex: 1 }}>Score</Text>
                </View>
                {a.questions.map((q, qi) => (
                  <View key={qi} style={qi % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                    <Text style={{ ...styles.cell, flex: 4 }}>{q.question}</Text>
                    <Text style={{ ...styles.cell, flex: 2 }}>{q.answer ?? "—"}</Text>
                    <Text style={{ ...styles.cell, flex: 1 }}>{q.score !== null ? q.score.toFixed(1) : "—"}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ CAPAs ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>4. Corrective & Preventive Actions</Text>
        {capas.length === 0 ? (
          <Text style={styles.emptyText}>No CAPAs raised.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Title</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Type</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Priority</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Due Date</Text>
            </View>
            {capas.map((c, i) => (
              <View key={i} wrap={false}>
                <View style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                  <Text style={{ ...styles.cell, flex: 3 }}>{c.title}</Text>
                  <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(c.type)}</Text>
                  <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(c.status)}</Text>
                  <Text style={{ ...styles.cell, flex: 1, color: priorityColor(c.priority) }}>{c.priority}</Text>
                  <Text style={{ ...styles.cell, flex: 1.5 }}>{c.dueDate ?? "—"}</Text>
                </View>
                {c.rootCause && (
                  <View style={{ paddingLeft: 12, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 7, color: colors.textMuted }}>Root Cause: {c.rootCause}</Text>
                  </View>
                )}
                {c.actions.length > 0 && (
                  <View style={{ paddingLeft: 12, paddingVertical: 2, paddingBottom: 4 }}>
                    <Text style={{ fontSize: 7, fontWeight: "bold", marginBottom: 2 }}>Actions:</Text>
                    {c.actions.map((a, ai) => (
                      <Text key={ai} style={{ fontSize: 7, color: colors.textMuted, marginBottom: 1 }}>
                        {a.isCompleted ? "✓" : "○"} {a.description} {a.dueDate ? `(due: ${a.dueDate})` : ""}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ CHECKLISTS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>5. Compliance Checklists</Text>
        {checklists.length === 0 ? (
          <Text style={styles.emptyText}>No checklists created.</Text>
        ) : (
          <>
            {/* Summary table */}
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Title</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Standard</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Completion</Text>
            </View>
            {checklists.map((cl, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 3 }}>{cl.title}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{cl.standard}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(cl.status)}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{cl.completion.toFixed(0)}%</Text>
              </View>
            ))}

            {/* Item-level detail per checklist */}
            {checklists.filter((cl) => cl.items.length > 0).map((cl, ci) => (
              <View key={ci} style={{ marginTop: 12 }} wrap={false}>
                <Text style={styles.subTitle}>{cl.title} — Item Detail</Text>
                <View style={styles.headerRow}>
                  <Text style={{ ...styles.headerCell, flex: 4 }}>Requirement</Text>
                  <Text style={{ ...styles.headerCell, flex: 1.5 }}>Clause</Text>
                  <Text style={{ ...styles.headerCell, flex: 1 }}>Compliant</Text>
                </View>
                {cl.items.map((item, ii) => (
                  <View key={ii} style={ii % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                    <Text style={{ ...styles.cell, flex: 4 }}>{item.description}</Text>
                    <Text style={{ ...styles.cell, flex: 1.5 }}>{item.clauseNumber ?? "—"}</Text>
                    <Text style={{
                      ...styles.cell,
                      flex: 1,
                      color: item.isCompliant === true ? colors.green : item.isCompliant === false ? colors.red : colors.textMuted,
                    }}>
                      {item.isCompliant === true ? "Yes" : item.isCompliant === false ? "No" : "N/A"}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ SIGN-OFF ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>6. Sign-Off</Text>
        <View style={styles.summaryBox}>
          <Text style={{ ...styles.text, fontSize: 10 }}>
            This audit pack contains {documents.length} document{documents.length !== 1 ? "s" : ""},
            {" "}{assessments.length} assessment{assessments.length !== 1 ? "s" : ""},
            {" "}{capas.length} CAPA{capas.length !== 1 ? "s" : ""}, and
            {" "}{checklists.length} compliance checklist{checklists.length !== 1 ? "s" : ""}.
          </Text>
          <Text style={{ ...styles.text, fontSize: 10, marginTop: 4 }}>
            Overall compliance rate: {overallCompliance.toFixed(1)}%
          </Text>
        </View>

        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 10, marginBottom: 4 }}>Reviewed and approved by:</Text>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9, color: colors.textMuted }}>Name / Signature / Date</Text>
          </View>
          <View style={{ ...styles.signatureLine, marginTop: 30 }}>
            <Text style={{ fontSize: 9, color: colors.textMuted }}>Management Representative / Signature / Date</Text>
          </View>
        </View>

        <View style={{ position: "absolute", bottom: 60, left: 40, right: 40 }}>
          <View style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
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
