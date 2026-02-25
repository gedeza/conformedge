import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
  cover: { flex: 1, justifyContent: "center", alignItems: "center" },
  coverTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  coverSubtitle: { fontSize: 16, color: "#666", marginBottom: 30 },
  coverDate: { fontSize: 12, color: "#999" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, borderBottom: "2px solid #333", paddingBottom: 5 },
  subTitle: { fontSize: 12, fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  row: { flexDirection: "row", borderBottom: "1px solid #eee", paddingVertical: 4 },
  cell: { flex: 1, paddingHorizontal: 4 },
  headerRow: { flexDirection: "row", borderBottom: "2px solid #333", paddingVertical: 4, marginBottom: 2 },
  headerCell: { flex: 1, fontWeight: "bold", paddingHorizontal: 4 },
  text: { marginBottom: 4 },
  badge: { backgroundColor: "#f0f0f0", borderRadius: 4, padding: "2px 6px", fontSize: 8 },
  summaryBox: { backgroundColor: "#f8f8f8", padding: 10, borderRadius: 4, marginBottom: 10 },
})

interface AuditPackPDFProps {
  title: string
  projectName: string
  generatedDate: string
  documents: Array<{ title: string; status: string; fileType: string | null }>
  assessments: Array<{ title: string; score: number | null; riskLevel: string | null; standard: string }>
  capas: Array<{ title: string; type: string; status: string; priority: string }>
  checklists: Array<{ title: string; completion: number; standard: string }>
}

export function AuditPackPDF({
  title,
  projectName,
  generatedDate,
  documents,
  assessments,
  capas,
  checklists,
}: AuditPackPDFProps) {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverTitle}>{title}</Text>
          <Text style={styles.coverSubtitle}>Project: {projectName}</Text>
          <Text style={styles.coverDate}>Generated: {generatedDate}</Text>
          <Text style={{ ...styles.coverDate, marginTop: 10 }}>ConformEdge — AI-Powered ISO Compliance Management</Text>
        </View>
      </Page>

      {/* Documents Index */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Document Index</Text>
        {documents.length === 0 ? (
          <Text style={styles.text}>No documents in this project.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Title</Text>
              <Text style={styles.headerCell}>Status</Text>
              <Text style={styles.headerCell}>Type</Text>
            </View>
            {documents.map((doc, i) => (
              <View key={i} style={styles.row}>
                <Text style={{ ...styles.cell, flex: 3 }}>{doc.title}</Text>
                <Text style={styles.cell}>{doc.status}</Text>
                <Text style={styles.cell}>{doc.fileType ?? "N/A"}</Text>
              </View>
            ))}
          </>
        )}
      </Page>

      {/* Assessments */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Assessment Results</Text>
        {assessments.length === 0 ? (
          <Text style={styles.text}>No assessments conducted.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Title</Text>
              <Text style={styles.headerCell}>Standard</Text>
              <Text style={styles.headerCell}>Score</Text>
              <Text style={styles.headerCell}>Risk</Text>
            </View>
            {assessments.map((a, i) => (
              <View key={i} style={styles.row}>
                <Text style={{ ...styles.cell, flex: 3 }}>{a.title}</Text>
                <Text style={styles.cell}>{a.standard}</Text>
                <Text style={styles.cell}>{a.score !== null ? `${a.score.toFixed(1)}%` : "—"}</Text>
                <Text style={styles.cell}>{a.riskLevel ?? "—"}</Text>
              </View>
            ))}
          </>
        )}
      </Page>

      {/* CAPAs */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Corrective & Preventive Actions</Text>
        {capas.length === 0 ? (
          <Text style={styles.text}>No CAPAs raised.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Title</Text>
              <Text style={styles.headerCell}>Type</Text>
              <Text style={styles.headerCell}>Status</Text>
              <Text style={styles.headerCell}>Priority</Text>
            </View>
            {capas.map((c, i) => (
              <View key={i} style={styles.row}>
                <Text style={{ ...styles.cell, flex: 3 }}>{c.title}</Text>
                <Text style={styles.cell}>{c.type}</Text>
                <Text style={styles.cell}>{c.status}</Text>
                <Text style={styles.cell}>{c.priority}</Text>
              </View>
            ))}
          </>
        )}
      </Page>

      {/* Checklists */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Compliance Checklists</Text>
        {checklists.length === 0 ? (
          <Text style={styles.text}>No checklists created.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Title</Text>
              <Text style={styles.headerCell}>Standard</Text>
              <Text style={styles.headerCell}>Completion</Text>
            </View>
            {checklists.map((cl, i) => (
              <View key={i} style={styles.row}>
                <Text style={{ ...styles.cell, flex: 3 }}>{cl.title}</Text>
                <Text style={styles.cell}>{cl.standard}</Text>
                <Text style={styles.cell}>{cl.completion.toFixed(0)}%</Text>
              </View>
            ))}
          </>
        )}
      </Page>

      {/* Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.text}>Total Documents: {documents.length}</Text>
          <Text style={styles.text}>Total Assessments: {assessments.length}</Text>
          <Text style={styles.text}>Total CAPAs: {capas.length}</Text>
          <Text style={styles.text}>Total Checklists: {checklists.length}</Text>
        </View>
        <Text style={{ ...styles.text, color: "#999", marginTop: 20 }}>
          This audit pack was generated by ConformEdge on {generatedDate}.
        </Text>
      </Page>
    </Document>
  )
}
