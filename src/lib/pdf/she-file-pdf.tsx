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

  // TOC
  tocItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: `1px solid ${colors.border}` },
  tocLabel: { fontSize: 10 },
  tocPage: { fontSize: 10, color: colors.textMuted },

  // Section headers
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.primary, marginBottom: 8, paddingBottom: 4, borderBottom: `2px solid ${colors.primary}` },
  subTitle: { fontSize: 11, fontWeight: "bold", color: colors.primaryLight, marginTop: 10, marginBottom: 4 },

  // Stats
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

  // Misc
  text: { marginBottom: 3 },
  emptyText: { fontSize: 9, color: colors.textMuted, fontStyle: "italic", marginVertical: 8 },
  summaryBox: { backgroundColor: colors.bgAccent, padding: 12, borderRadius: 4, border: `1px solid ${colors.border}`, marginBottom: 10 },
  regulatoryRef: { fontSize: 7, color: colors.textMuted, fontStyle: "italic", marginBottom: 6 },
  signatureLine: { borderTop: `1px solid ${colors.textDark}`, width: 200, marginTop: 40, paddingTop: 4 },
  sectionSpacer: { height: 8 },
})

// ── Types ─────────────────────────────────────

export interface SHEFilePDFProps {
  organizationName: string
  projectName: string
  projectDescription?: string
  projectLocation?: string
  generatedDate: string
  generatedBy: string

  // Section 2: Legal standing
  obligations: Array<{
    title: string
    obligationType: string
    status: string
    effectiveDate: string | null
    expiryDate: string | null
    vendorName: string | null
    responsiblePerson: string | null
  }>

  // Section 7: Team / organogram
  members: Array<{
    name: string
    role: string
    email: string
  }>

  // Section 9: Risk assessments
  assessments: Array<{
    title: string
    score: number | null
    riskLevel: string | null
    standard: string
    completedDate: string | null
  }>

  // Section 10–11: Work permits
  permits: Array<{
    permitNumber: string | null
    permitType: string
    title: string
    status: string
    location: string | null
    riskLevel: string | null
    validFrom: string | null
    validTo: string | null
  }>

  // Section 12: Incidents
  incidents: Array<{
    title: string
    incidentType: string
    severity: string | null
    status: string
    incidentDate: string | null
    location: string | null
    lostDays: number | null
    isReportable: boolean
  }>

  // Section 17: Inspection checklists
  checklists: Array<{
    title: string
    completion: number
    status: string
    standard: string
  }>

  // Section 19: CAPAs
  capas: Array<{
    title: string
    type: string
    status: string
    priority: string
    dueDate: string | null
    rootCause: string | null
  }>

  // Section 20: Sub-contractors
  vendors: Array<{
    name: string
    tier: string
    beeLevel: number | string | null
    beeRecognition: number | null
    safetyRating: number | null
    certCount: number
    expiredCerts: number
  }>

  // Training records
  trainingRecords: Array<{
    title: string
    category: string
    status: string
    traineeName: string
    trainingDate: string | null
    expiryDate: string | null
    certificateNumber: string | null
    assessmentResult: string | null
  }>

  // Documents by classification (used across multiple sections)
  documents: Array<{
    title: string
    status: string
    fileType: string | null
    classifications: string[]
  }>

  // Safety statistics
  stats: {
    totalIncidents: number
    lostTimeInjuries: number
    totalLostDays: number
    nearMisses: number
    fatalities: number
    reportableIncidents: number
    openCapas: number
    overdueCapas: number
    activePermits: number
    activeObligations: number
    expiringObligations: number
    overallChecklistCompliance: number
  }
}

// ── Helpers ───────────────────────────────────

function statusLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function riskColor(level: string | null): string {
  switch (level) {
    case "LOW": return colors.green
    case "MEDIUM": return colors.yellow
    case "HIGH": return colors.orange
    case "CRITICAL": return colors.red
    default: return colors.textMuted
  }
}

function PageFooter() {
  return (
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
  )
}

// ── Obligation type grouping ─────────────────
const LEGAL_STANDING_TYPES = ["COIDA_LOG", "TAX_CLEARANCE", "CIDB_GRADING", "BBBEE_CERTIFICATE"]
const SECTION_37_TYPES = ["SECTION_37_2"]
const APPOINTMENT_TYPES = ["COMPETENT_PERSON"]
const ENVIRONMENTAL_TYPES = ["WATER_USE_LICENCE", "AEL", "WASTE_LICENCE", "CEMP"]

// ── TOC sections ─────────────────────────────
const TOC_SECTIONS = [
  "Project Information",
  "Legal Standing & Registration",
  "OHS Policy & Commitment",
  "Section 37(2) Agreements",
  "Health & Safety Plan",
  "Site Organogram & Appointments",
  "Risk Assessments",
  "Safe Work Procedures",
  "Permits to Work",
  "Incident Register",
  "Inspection & Checklists",
  "Training Records",
  "Environmental Compliance",
  "Sub-Contractor Register",
  "Corrective Actions (CAPAs)",
  "Safety Statistics",
  "Document Register",
  "Sign-Off",
]

// ── Main Component ────────────────────────────

export function SHEFilePDF(props: SHEFilePDFProps) {
  const {
    organizationName, projectName, projectDescription, projectLocation,
    generatedDate, generatedBy,
    obligations, members, assessments, permits, incidents,
    checklists, capas, vendors, trainingRecords, documents, stats,
  } = props

  const legalObligations = obligations.filter((o) => LEGAL_STANDING_TYPES.includes(o.obligationType))
  const section37Obligations = obligations.filter((o) => SECTION_37_TYPES.includes(o.obligationType))
  const appointmentObligations = obligations.filter((o) => APPOINTMENT_TYPES.includes(o.obligationType))
  const environmentalObligations = obligations.filter((o) => ENVIRONMENTAL_TYPES.includes(o.obligationType))

  return (
    <Document>
      {/* ═══════════════════ COVER PAGE ═══════════════════ */}
      <Page size="A4" style={{ ...styles.page, padding: 0 }}>
        <View style={{ flex: 1 }}>
          <View style={{ height: 120 }} />
          <View style={styles.coverBrand}>
            <Text style={styles.coverTitle}>SHE File</Text>
            <Text style={styles.coverSubtitle}>Safety, Health & Environment</Text>
            <Text style={{ fontSize: 12, color: "#a0c4e8", textAlign: "center", marginTop: 12 }}>{organizationName}</Text>
          </View>
          <View style={{ alignItems: "center", padding: 40 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.textDark }}>{projectName}</Text>
            {projectLocation && <Text style={styles.coverMeta}>Location: {projectLocation}</Text>}
            <Text style={styles.coverMeta}>Prepared by: {generatedBy}</Text>
            <Text style={styles.coverMeta}>Generated: {generatedDate}</Text>
            {projectDescription && (
              <Text style={{ ...styles.coverMeta, marginTop: 16, maxWidth: 400, textAlign: "center" }}>{projectDescription}</Text>
            )}
          </View>
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <View style={styles.summaryBox}>
              <Text style={{ fontSize: 8, color: colors.textMuted, textAlign: "center" }}>
                Compiled in terms of the Occupational Health and Safety Act 85 of 1993{"\n"}
                and Construction Regulations 2014 (Regulation 7)
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.coverFooter}>ConformEdge — AI-Powered SHEQ & Compliance Management</Text>
      </Page>

      {/* ═══════════════════ TABLE OF CONTENTS ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Table of Contents</Text>
        {TOC_SECTIONS.map((label, i) => (
          <View key={i} style={styles.tocItem}>
            <Text style={styles.tocLabel}>{i + 1}. {label}</Text>
          </View>
        ))}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.regulatoryRef}>
            This file is maintained in accordance with the OHS Act 85 of 1993, Construction Regulations 2014,
            and applicable environmental legislation including NEMA, NWA, and NEM:AQA.
          </Text>
        </View>
        <PageFooter />
      </Page>

      {/* ═══════════════════ 1. PROJECT INFORMATION ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>1. Project Information</Text>
        <View style={styles.summaryBox}>
          <Text style={{ ...styles.text, fontSize: 10, fontWeight: "bold" }}>{projectName}</Text>
          {projectDescription && <Text style={styles.text}>{projectDescription}</Text>}
          {projectLocation && <Text style={styles.text}>Location: {projectLocation}</Text>}
          <Text style={styles.text}>Organisation: {organizationName}</Text>
          <Text style={styles.text}>Date generated: {generatedDate}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalIncidents}</Text>
            <Text style={styles.statLabel}>Total Incidents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activePermits}</Text>
            <Text style={styles.statLabel}>Active Permits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeObligations}</Text>
            <Text style={styles.statLabel}>Active Obligations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.overallChecklistCompliance.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Checklist Compliance</Text>
          </View>
        </View>

        {stats.overdueCapas > 0 && (
          <View style={{ backgroundColor: "#fef2f2", padding: 8, borderRadius: 4, border: `1px solid ${colors.red}` }}>
            <Text style={{ fontSize: 9, color: colors.red, fontWeight: "bold" }}>
              ATTENTION: {stats.overdueCapas} overdue CAPA{stats.overdueCapas > 1 ? "s" : ""} require immediate action.
            </Text>
          </View>
        )}
        {stats.expiringObligations > 0 && (
          <View style={{ backgroundColor: "#fffbeb", padding: 8, borderRadius: 4, border: `1px solid ${colors.yellow}`, marginTop: 6 }}>
            <Text style={{ fontSize: 9, color: colors.yellow, fontWeight: "bold" }}>
              WARNING: {stats.expiringObligations} obligation{stats.expiringObligations > 1 ? "s" : ""} expiring within 30 days.
            </Text>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ═══════════════════ 2. LEGAL STANDING ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>2. Legal Standing & Registration</Text>
        <Text style={styles.regulatoryRef}>Ref: OHS Act s8, CIDB Act, COIDA Act 130/1993, B-BBEE Act</Text>

        {legalObligations.length === 0 ? (
          <Text style={styles.emptyText}>No legal standing documents tracked. Add COIDA, Tax Clearance, CIDB, and B-BBEE obligations.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Document</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Type</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Expiry</Text>
            </View>
            {legalObligations.map((ob, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 3 }}>{ob.title}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{statusLabel(ob.obligationType)}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: ob.status === "ACTIVE" ? colors.green : ob.status === "EXPIRED" ? colors.red : colors.yellow }}>
                  {statusLabel(ob.status)}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{ob.expiryDate ?? "No expiry"}</Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 3. OHS POLICY ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>3. OHS Policy & Commitment</Text>
        <Text style={styles.regulatoryRef}>Ref: OHS Act s7 — Written policy required. Must be signed by CEO (s16(1) designee).</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.text}>
            The organisation&apos;s Health, Safety and Environmental policies should be filed in this section.
            Policies must be signed by the CEO or Section 16(1) appointee, reviewed annually, and displayed at the workplace.
          </Text>
        </View>

        {(() => {
          const policyDocs = documents.filter((d) =>
            d.classifications.some((c) => c.toLowerCase().includes("policy") || c.toLowerCase().includes("4.1") || c.toLowerCase().includes("5.2"))
          )
          return policyDocs.length > 0 ? (
            <>
              <Text style={styles.subTitle}>Policy Documents on File</Text>
              <View style={styles.headerRow}>
                <Text style={{ ...styles.headerCell, flex: 3 }}>Document</Text>
                <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
                <Text style={{ ...styles.headerCell, flex: 2 }}>Classifications</Text>
              </View>
              {policyDocs.map((d, i) => (
                <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                  <Text style={{ ...styles.cell, flex: 3 }}>{d.title}</Text>
                  <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(d.status)}</Text>
                  <Text style={{ ...styles.cell, flex: 2 }}>{d.classifications.join(", ")}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.emptyText}>No policy documents classified in the system.</Text>
          )
        })()}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 4. SECTION 37(2) AGREEMENTS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>4. Section 37(2) Agreements</Text>
        <Text style={styles.regulatoryRef}>Ref: OHS Act s37(2) — Mandatory written agreement between client/principal contractor and each contractor.</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.text}>
            Section 37(2) of the OHS Act requires a mandatory agreement between the mandator (client) and the mandatory (contractor)
            whereby the contractor undertakes to comply with all OHS requirements. Without this agreement, the client remains liable
            for contractor safety.
          </Text>
        </View>

        {section37Obligations.length === 0 ? (
          <Text style={styles.emptyText}>No Section 37(2) agreements tracked.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Agreement</Text>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Contractor/Vendor</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Effective</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Expiry</Text>
            </View>
            {section37Obligations.map((ob, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 3 }}>{ob.title}</Text>
                <Text style={{ ...styles.cell, flex: 2 }}>{ob.vendorName ?? "—"}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: ob.status === "ACTIVE" ? colors.green : colors.red }}>
                  {statusLabel(ob.status)}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{ob.effectiveDate ?? "—"}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{ob.expiryDate ?? "No expiry"}</Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 5. H&S PLAN ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>5. Health & Safety Plan</Text>
        <Text style={styles.regulatoryRef}>Ref: Construction Reg 7(1)(a) — Site-specific H&S plan required before construction commences.</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.text}>
            The site-specific Health and Safety Plan must address all identified hazards, describe control measures,
            and include the Fall Protection Plan (work at height above 2m), Traffic Management Plan, and Emergency
            Preparedness and Response Plan.
          </Text>
        </View>

        {(() => {
          const planDocs = documents.filter((d) =>
            d.title.toLowerCase().includes("plan") ||
            d.title.toLowerCase().includes("emergency") ||
            d.title.toLowerCase().includes("fall protection") ||
            d.classifications.some((c) => c.toLowerCase().includes("8.2") || c.toLowerCase().includes("6.1"))
          )
          return planDocs.length > 0 ? (
            <>
              <Text style={styles.subTitle}>Plans on File</Text>
              <View style={styles.headerRow}>
                <Text style={{ ...styles.headerCell, flex: 3 }}>Document</Text>
                <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
                <Text style={{ ...styles.headerCell, flex: 1 }}>Type</Text>
              </View>
              {planDocs.map((d, i) => (
                <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                  <Text style={{ ...styles.cell, flex: 3 }}>{d.title}</Text>
                  <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(d.status)}</Text>
                  <Text style={{ ...styles.cell, flex: 1 }}>{d.fileType ?? "N/A"}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.emptyText}>No health and safety plan documents classified in the system.</Text>
          )
        })()}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 6. ORGANOGRAM & APPOINTMENTS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>6. Site Organogram & Appointments</Text>
        <Text style={styles.regulatoryRef}>Ref: OHS Act s16(1), s16(2), s17, s18; Construction Reg 6(6), 8(1)</Text>

        <Text style={styles.subTitle}>Team Members</Text>
        {members.length === 0 ? (
          <Text style={styles.emptyText}>No team members recorded.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Name</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Role</Text>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Email</Text>
            </View>
            {members.map((m, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 2 }}>{m.name}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{statusLabel(m.role)}</Text>
                <Text style={{ ...styles.cell, flex: 2 }}>{m.email}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.subTitle}>Legal Appointments (Competent Persons)</Text>
        {appointmentObligations.length === 0 ? (
          <Text style={styles.emptyText}>No competent person appointments tracked. Add via Obligations module.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Appointment</Text>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Responsible Person</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Expiry</Text>
            </View>
            {appointmentObligations.map((ob, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 3 }}>{ob.title}</Text>
                <Text style={{ ...styles.cell, flex: 2 }}>{ob.responsiblePerson ?? "—"}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: ob.status === "ACTIVE" ? colors.green : colors.red }}>
                  {statusLabel(ob.status)}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{ob.expiryDate ?? "No expiry"}</Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 7. RISK ASSESSMENTS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>7. Risk Assessments</Text>
        <Text style={styles.regulatoryRef}>Ref: OHS Act s8; Construction Reg 9 — Baseline, issue-based, and continuous risk assessments required.</Text>

        {assessments.length === 0 ? (
          <Text style={styles.emptyText}>No risk assessments conducted.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Assessment</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Standard</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Score</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Risk Level</Text>
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
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 8. SAFE WORK PROCEDURES ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>8. Safe Work Procedures</Text>
        <Text style={styles.regulatoryRef}>Ref: Construction Reg 9(2) — Safe work procedures for all identified hazards.</Text>

        {(() => {
          const swpDocs = documents.filter((d) =>
            d.title.toLowerCase().includes("procedure") ||
            d.title.toLowerCase().includes("swp") ||
            d.title.toLowerCase().includes("method statement") ||
            d.title.toLowerCase().includes("sop") ||
            d.classifications.some((c) => c.toLowerCase().includes("8.1") || c.toLowerCase().includes("operational"))
          )
          return swpDocs.length > 0 ? (
            <>
              <View style={styles.headerRow}>
                <Text style={{ ...styles.headerCell, flex: 3 }}>Document</Text>
                <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
                <Text style={{ ...styles.headerCell, flex: 2 }}>Classifications</Text>
              </View>
              {swpDocs.map((d, i) => (
                <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                  <Text style={{ ...styles.cell, flex: 3 }}>{d.title}</Text>
                  <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(d.status)}</Text>
                  <Text style={{ ...styles.cell, flex: 2 }}>{d.classifications.join(", ") || "—"}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.emptyText}>No safe work procedures classified in the system.</Text>
          )
        })()}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 9. PERMITS TO WORK ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>9. Permits to Work</Text>
        <Text style={styles.regulatoryRef}>Ref: Construction Reg 10 (heights), 13 (excavation), 16 (scaffolding); General Safety Reg (hot work, confined space)</Text>

        {permits.length === 0 ? (
          <Text style={styles.emptyText}>No work permits issued.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Permit #</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Type</Text>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Title</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Risk</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Valid Period</Text>
            </View>
            {permits.map((p, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 1 }}>{p.permitNumber ?? "—"}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{statusLabel(p.permitType)}</Text>
                <Text style={{ ...styles.cell, flex: 2 }}>{p.title}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: p.status === "ACTIVE" ? colors.green : p.status === "EXPIRED" ? colors.red : colors.textMuted }}>
                  {statusLabel(p.status)}
                </Text>
                <Text style={{ ...styles.cell, flex: 1, color: riskColor(p.riskLevel) }}>
                  {p.riskLevel ?? "—"}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>
                  {p.validFrom && p.validTo ? `${p.validFrom} – ${p.validTo}` : "—"}
                </Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 10. INCIDENT REGISTER ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>10. Incident Register</Text>
        <Text style={styles.regulatoryRef}>Ref: OHS Act s24 — Reportable incidents to Provincial Director within 3 days; GAR 9(3) — Incident records.</Text>

        {incidents.length === 0 ? (
          <Text style={styles.emptyText}>No incidents recorded.</Text>
        ) : (
          <>
            <View style={styles.summaryBox}>
              <Text style={{ ...styles.text, fontWeight: "bold" }}>Incident Summary</Text>
              <Text style={styles.text}>Total incidents: {stats.totalIncidents} | Lost time injuries: {stats.lostTimeInjuries} | Total lost days: {stats.totalLostDays}</Text>
              <Text style={styles.text}>Near misses: {stats.nearMisses} | Fatalities: {stats.fatalities} | Reportable: {stats.reportableIncidents}</Text>
            </View>

            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 2.5 }}>Incident</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Type</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Severity</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Date</Text>
              <Text style={{ ...styles.headerCell, flex: 0.5 }}>s24</Text>
            </View>
            {incidents.map((inc, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 2.5 }}>{inc.title}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{statusLabel(inc.incidentType)}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: riskColor(inc.severity) }}>
                  {inc.severity ?? "—"}
                </Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(inc.status)}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{inc.incidentDate ?? "—"}</Text>
                <Text style={{ ...styles.cell, flex: 0.5, color: inc.isReportable ? colors.red : colors.textMuted }}>
                  {inc.isReportable ? "Yes" : "No"}
                </Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 11. INSPECTIONS & CHECKLISTS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>11. Inspection & Checklists</Text>
        <Text style={styles.regulatoryRef}>Ref: Construction Reg 14 (daily inspections); General Safety Reg 2 (fire equipment); various equipment regs.</Text>

        {checklists.length === 0 ? (
          <Text style={styles.emptyText}>No inspection checklists completed.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Checklist</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Standard</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Completion</Text>
            </View>
            {checklists.map((cl, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 3 }}>{cl.title}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{cl.standard}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(cl.status)}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: cl.completion >= 80 ? colors.green : cl.completion >= 50 ? colors.yellow : colors.red }}>
                  {cl.completion.toFixed(0)}%
                </Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 12. TRAINING RECORDS ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>12. Training Records</Text>
        <Text style={styles.regulatoryRef}>Ref: OHS Act s8(2)(e) — employers must provide training; Construction Reg 9 — competency certificates required.</Text>

        {trainingRecords.length === 0 ? (
          <Text style={styles.emptyText}>No training records captured. Add records via the Training module.</Text>
        ) : (
          <>
            <View style={styles.summaryBox}>
              <Text style={styles.text}>Total training records: {trainingRecords.length}</Text>
              <Text style={styles.text}>
                Completed: {trainingRecords.filter((t) => t.status === "COMPLETED").length} |
                Expired: {trainingRecords.filter((t) => t.status === "EXPIRED").length} |
                Planned: {trainingRecords.filter((t) => t.status === "PLANNED").length}
              </Text>
            </View>

            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 2.5 }}>Training</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Category</Text>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Trainee</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Date</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Expiry</Text>
            </View>
            {trainingRecords.map((t, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 2.5 }}>{t.title}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{statusLabel(t.category)}</Text>
                <Text style={{ ...styles.cell, flex: 2 }}>{t.traineeName}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: t.status === "COMPLETED" ? colors.green : t.status === "EXPIRED" ? colors.red : colors.yellow }}>
                  {statusLabel(t.status)}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{t.trainingDate ?? "—"}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{t.expiryDate ?? "No expiry"}</Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 13. ENVIRONMENTAL COMPLIANCE ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>13. Environmental Compliance</Text>
        <Text style={styles.regulatoryRef}>Ref: NEMA s24; NWA s21; NEM:AQA s22; NEM:WA s20 — Environmental authorisations and licences.</Text>

        {environmentalObligations.length === 0 ? (
          <Text style={styles.emptyText}>No environmental obligations tracked. Add water use licences, AELs, waste licences, and CEMPs via Obligations module.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Obligation</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Type</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1.5 }}>Expiry</Text>
            </View>
            {environmentalObligations.map((ob, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 3 }}>{ob.title}</Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{statusLabel(ob.obligationType)}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: ob.status === "ACTIVE" ? colors.green : ob.status === "EXPIRED" ? colors.red : colors.yellow }}>
                  {statusLabel(ob.status)}
                </Text>
                <Text style={{ ...styles.cell, flex: 1.5 }}>{ob.expiryDate ?? "No expiry"}</Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 13. SUB-CONTRACTOR REGISTER ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>14. Sub-Contractor Register</Text>
        <Text style={styles.regulatoryRef}>Ref: OHS Act s37(2); Construction Reg 7(1)(e) — Contractor management and file verification.</Text>

        {vendors.length === 0 ? (
          <Text style={styles.emptyText}>No sub-contractors registered.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 2.5 }}>Contractor</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Tier</Text>
              <Text style={{ ...styles.headerCell, flex: 0.8 }}>BEE</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Safety %</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Certs</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Expired</Text>
            </View>
            {vendors.map((v, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 2.5 }}>{v.name}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(v.tier)}</Text>
                <Text style={{ ...styles.cell, flex: 0.8 }}>{v.beeLevel ? `L${v.beeLevel}${v.beeRecognition ? ` (${v.beeRecognition}%)` : ""}` : "—"}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: (v.safetyRating ?? 0) >= 80 ? colors.green : (v.safetyRating ?? 0) >= 50 ? colors.yellow : colors.red }}>
                  {v.safetyRating !== null ? `${v.safetyRating}%` : "—"}
                </Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{v.certCount}</Text>
                <Text style={{ ...styles.cell, flex: 1, color: v.expiredCerts > 0 ? colors.red : colors.green }}>
                  {v.expiredCerts}
                </Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 14. CAPAs ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>15. Corrective Actions (CAPAs)</Text>
        <Text style={styles.regulatoryRef}>Ref: ISO 45001 §10.2; OHS Act s8(2)(d) — Corrective and preventive measures.</Text>

        {capas.length === 0 ? (
          <Text style={styles.emptyText}>No corrective or preventive actions raised.</Text>
        ) : (
          <>
            <View style={styles.summaryBox}>
              <Text style={styles.text}>Open: {stats.openCapas} | Overdue: {stats.overdueCapas}</Text>
            </View>
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
                  <Text style={{ ...styles.cell, flex: 1, color: riskColor(c.priority) }}>{c.priority}</Text>
                  <Text style={{ ...styles.cell, flex: 1.5 }}>{c.dueDate ?? "—"}</Text>
                </View>
                {c.rootCause && (
                  <View style={{ paddingLeft: 12, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 7, color: colors.textMuted }}>Root Cause: {c.rootCause}</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 15. SAFETY STATISTICS ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>16. Safety Statistics</Text>
        <Text style={styles.regulatoryRef}>Ref: Construction Reg 7(1)(e) — Monthly safety statistics. LTIFR = (LTIs × 200,000) / hours worked.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={{ ...styles.statValue, color: stats.fatalities > 0 ? colors.red : colors.green }}>{stats.fatalities}</Text>
            <Text style={styles.statLabel}>Fatalities</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={{ ...styles.statValue, color: stats.lostTimeInjuries > 0 ? colors.orange : colors.green }}>{stats.lostTimeInjuries}</Text>
            <Text style={styles.statLabel}>Lost Time Injuries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalLostDays}</Text>
            <Text style={styles.statLabel}>Total Lost Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.nearMisses}</Text>
            <Text style={styles.statLabel}>Near Misses</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalIncidents}</Text>
            <Text style={styles.statLabel}>Total Incidents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.reportableIncidents}</Text>
            <Text style={styles.statLabel}>Reportable (s24)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activePermits}</Text>
            <Text style={styles.statLabel}>Active Permits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.overallChecklistCompliance.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Checklist Compliance</Text>
          </View>
        </View>

        <PageFooter />
      </Page>

      {/* ═══════════════════ 16. DOCUMENT REGISTER ═══════════════════ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>17. Document Register</Text>

        {documents.length === 0 ? (
          <Text style={styles.emptyText}>No documents on file.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.headerCell, flex: 3 }}>Document</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Status</Text>
              <Text style={{ ...styles.headerCell, flex: 1 }}>Type</Text>
              <Text style={{ ...styles.headerCell, flex: 2 }}>Classifications</Text>
            </View>
            {documents.map((d, i) => (
              <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt} wrap={false}>
                <Text style={{ ...styles.cell, flex: 3 }}>{d.title}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{statusLabel(d.status)}</Text>
                <Text style={{ ...styles.cell, flex: 1 }}>{d.fileType ?? "N/A"}</Text>
                <Text style={{ ...styles.cell, flex: 2 }}>{d.classifications.join(", ") || "—"}</Text>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* ═══════════════════ 17. SIGN-OFF ═══════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>18. Sign-Off</Text>

        <View style={styles.summaryBox}>
          <Text style={{ ...styles.text, fontSize: 10 }}>
            This SHE File for &quot;{projectName}&quot; contains {documents.length} document{documents.length !== 1 ? "s" : ""},
            {" "}{assessments.length} risk assessment{assessments.length !== 1 ? "s" : ""},
            {" "}{incidents.length} incident{incidents.length !== 1 ? "s" : ""},
            {" "}{permits.length} work permit{permits.length !== 1 ? "s" : ""},
            {" "}{obligations.length} obligation{obligations.length !== 1 ? "s" : ""},
            {" "}{checklists.length} checklist{checklists.length !== 1 ? "s" : ""},
            {" "}{capas.length} CAPA{capas.length !== 1 ? "s" : ""}, and
            {" "}{vendors.length} sub-contractor{vendors.length !== 1 ? "s" : ""}.
          </Text>
          <Text style={{ ...styles.text, fontSize: 10, marginTop: 4 }}>
            Overall checklist compliance: {stats.overallChecklistCompliance.toFixed(1)}%
          </Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 16 }}>Reviewed and approved by:</Text>

          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9, color: colors.textMuted }}>Construction Manager / Signature / Date</Text>
          </View>
          <View style={{ ...styles.signatureLine, marginTop: 30 }}>
            <Text style={{ fontSize: 9, color: colors.textMuted }}>Construction Safety Officer / Signature / Date</Text>
          </View>
          <View style={{ ...styles.signatureLine, marginTop: 30 }}>
            <Text style={{ fontSize: 9, color: colors.textMuted }}>Client / Agent Representative / Signature / Date</Text>
          </View>
        </View>

        <View style={{ position: "absolute", bottom: 60, left: 40, right: 40 }}>
          <View style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <Text style={{ fontSize: 8, color: colors.textMuted, textAlign: "center" }}>
              Generated by ConformEdge — AI-Powered SHEQ & Compliance Management
            </Text>
            <Text style={{ fontSize: 8, color: colors.textMuted, textAlign: "center", marginTop: 2 }}>
              {organizationName} • {generatedDate}
            </Text>
            <Text style={{ fontSize: 7, color: colors.textMuted, textAlign: "center", marginTop: 4 }}>
              Compiled in terms of OHS Act 85/1993 and Construction Regulations 2014
            </Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </Document>
  )
}
