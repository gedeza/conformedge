import React from "react"
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer"
import { LOGO_PATH } from "./shared-pdf-styles"

const c = {
  navy: "#1e3a5f",
  navyLight: "#2d5a8e",
  teal: "#0d9488",
  tealLight: "#14b8a6",
  textDark: "#1f2937",
  textMuted: "#6b7280",
  bgLight: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
  accent: "#f59e0b",
}

const st = StyleSheet.create({
  // ---- Cover page ----
  coverPage: {
    backgroundColor: c.navy,
    padding: 0,
    fontFamily: "Helvetica",
    position: "relative",
  },
  coverContent: {
    paddingHorizontal: 50,
    paddingTop: 120,
    flex: 1,
  },
  coverLogo: {
    width: 50,
    height: 50,
    marginBottom: 16,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: c.white,
    lineHeight: 1.2,
  },
  coverTitleAccent: {
    fontSize: 36,
    fontWeight: "bold",
    color: c.tealLight,
    lineHeight: 1.2,
  },
  coverTagline: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 16,
    lineHeight: 1.5,
  },
  coverStats: {
    flexDirection: "row",
    marginTop: 50,
    gap: 40,
  },
  coverStat: {
    alignItems: "center",
  },
  coverStatNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: c.tealLight,
  },
  coverStatLabel: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  coverFooter: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coverFooterText: {
    fontSize: 9,
    color: "#64748b",
  },
  coverAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: c.teal,
  },

  // ---- Content pages ----
  page: {
    padding: 40,
    paddingBottom: 70,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: c.textDark,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 12,
    borderBottom: `2px solid ${c.teal}`,
  },
  pageHeaderBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pageHeaderLogo: {
    width: 20,
    height: 20,
  },
  pageHeaderName: {
    fontSize: 12,
    fontWeight: "bold",
    color: c.navy,
  },
  pageHeaderTitle: {
    fontSize: 9,
    color: c.textMuted,
  },

  // ---- Section headings ----
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: c.navy,
    marginBottom: 8,
    marginTop: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: c.navyLight,
    marginBottom: 6,
    marginTop: 14,
  },
  bodyText: {
    fontSize: 10,
    color: c.textDark,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  bodyTextMuted: {
    fontSize: 9,
    color: c.textMuted,
    lineHeight: 1.5,
    marginBottom: 6,
  },

  // ---- Feature cards ----
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  featureCard: {
    width: "48%",
    padding: 8,
    backgroundColor: c.bgLight,
    borderRadius: 4,
    border: `1px solid ${c.border}`,
    marginBottom: 0,
  },
  featureCardTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: c.navy,
    marginBottom: 2,
  },
  featureCardText: {
    fontSize: 7.5,
    color: c.textMuted,
    lineHeight: 1.4,
  },

  // ---- Tables ----
  table: { marginTop: 6, marginBottom: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: c.navy,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: {
    fontWeight: "bold",
    color: c.white,
    fontSize: 8.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${c.border}`,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${c.border}`,
    backgroundColor: c.bgLight,
  },
  tableCell: { fontSize: 9, color: c.textDark },
  tableCellBold: { fontSize: 9, fontWeight: "bold", color: c.textDark },
  tableCellMuted: { fontSize: 8.5, color: c.textMuted },

  // ---- Highlight box ----
  highlightBox: {
    backgroundColor: c.bgLight,
    border: `1px solid ${c.teal}`,
    borderLeftWidth: 3,
    borderLeftColor: c.teal,
    padding: 14,
    borderRadius: 4,
    marginVertical: 10,
  },
  highlightTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: c.teal,
    marginBottom: 4,
  },
  highlightText: {
    fontSize: 9,
    color: c.textDark,
    lineHeight: 1.5,
  },

  // ---- Bullet list ----
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 9,
    color: c.teal,
    marginRight: 6,
    width: 10,
  },
  bulletText: {
    fontSize: 9,
    color: c.textDark,
    lineHeight: 1.5,
    flex: 1,
  },

  // ---- Standards bar ----
  standardsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    marginBottom: 12,
  },
  standardBadge: {
    backgroundColor: c.navy,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  standardBadgeText: {
    fontSize: 7.5,
    color: c.white,
    fontWeight: "bold",
  },

  // ---- CTA / Contact ----
  ctaBox: {
    backgroundColor: c.navy,
    padding: 24,
    borderRadius: 6,
    marginTop: 16,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: c.white,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 10,
    color: "#94a3b8",
    marginBottom: 4,
    textAlign: "center",
  },
  ctaHighlight: {
    fontSize: 11,
    fontWeight: "bold",
    color: c.tealLight,
    marginTop: 8,
  },

  // ---- Footer ----
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1px solid ${c.border}`,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: c.textMuted,
  },
})

// ---- Components ----

function PageHeader({ title }: { title: string }) {
  return (
    <View style={st.pageHeader}>
      <View style={st.pageHeaderBrand}>
        <Image src={LOGO_PATH} style={st.pageHeaderLogo} />
        <Text style={st.pageHeaderName}>ConformEdge</Text>
      </View>
      <Text style={st.pageHeaderTitle}>{title}</Text>
    </View>
  )
}

function PageFooter() {
  return (
    <View style={st.footer} fixed>
      <Text style={st.footerText}>ConformEdge — AI-Powered SHEQ & Compliance Management</Text>
      <Text style={st.footerText}>conformedge.isutech.co.za | nhlanhla@isutech.co.za</Text>
      <Text style={st.footerText} render={({ pageNumber }) => `Page ${pageNumber}`} />
    </View>
  )
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={st.bulletRow}>
      <Text style={st.bulletDot}>{"\u2022"}</Text>
      <Text style={st.bulletText}>{children}</Text>
    </View>
  )
}

// ---- Main Document ----

export function BrochurePDF() {
  const standards = [
    "ISO 9001", "ISO 14001", "ISO 45001", "ISO 22301",
    "ISO 27001", "ISO 37001", "ISO 39001", "MHSA/DMRE",
    "POPIA", "ECSA", "SACPCMP",
  ]

  const features = [
    {
      title: "AI Document Classification",
      text: "Upload any document — our AI reads it, identifies the relevant ISO clauses, and files it automatically. No manual tagging.",
    },
    {
      title: "Audit Packs in One Click",
      text: "Generate branded, audit-ready PDF packs with cover page, executive summary, evidence, and sign-off — in minutes.",
    },
    {
      title: "Incident Management",
      text: "Full investigation workflow with evidence capture, fishbone analysis, COIDA W.Cl.2 export, LTIFR dashboards, and MHSA forms.",
    },
    {
      title: "Vendor Portal",
      text: "Vendors upload their own certificates via a secure portal. Expiry alerts notify you 30 days before any cert lapses.",
    },
    {
      title: "Equipment Register",
      text: "Asset lifecycle management with maintenance schedules, calibration tracking, and automatic CAPA escalation from failed inspections.",
    },
    {
      title: "Integrated Management System",
      text: "Cross-standard gap analysis, shared clause mapping, and consolidated readiness scoring across all your active standards.",
    },
    {
      title: "Custom Form Builder",
      text: "Build inspection checklists with 5 field types. Schedule recurring checklists and track completion across teams.",
    },
    {
      title: "Mobile-Ready (PWA)",
      text: "Works on any device — capture data on-site with camera integration, digital signatures, and offline sync.",
    },
  ]

  return (
    <Document title="ConformEdge — Product Brochure" author="ISU Technologies">
      {/* ===================== COVER PAGE ===================== */}
      <Page size="A4" style={st.coverPage}>
        <View style={st.coverAccentBar} />
        <View style={st.coverContent}>
          <Image src={LOGO_PATH} style={st.coverLogo} />
          <Text style={st.coverTitle}>AI-Powered SHEQ</Text>
          <Text style={st.coverTitleAccent}>Compliance Management</Text>
          <Text style={st.coverTagline}>
            Stop losing tenders to disorganised compliance.{"\n"}
            Start winning them in minutes.
          </Text>
          <View style={st.coverStats}>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>36</Text>
              <Text style={st.coverStatLabel}>Modules</Text>
            </View>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>11</Text>
              <Text style={st.coverStatLabel}>Standards</Text>
            </View>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>534+</Text>
              <Text style={st.coverStatLabel}>Sub-clauses</Text>
            </View>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>AI</Text>
              <Text style={st.coverStatLabel}>Powered</Text>
            </View>
          </View>
        </View>
        <View style={st.coverFooter}>
          <Text style={st.coverFooterText}>ISU Technologies (Pty) Ltd</Text>
          <Text style={st.coverFooterText}>conformedge.isutech.co.za</Text>
        </View>
      </Page>

      {/* ===================== PAGE 2: THE PROBLEM + FEATURES ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Platform Overview" />

        <Text style={st.sectionTitle}>The Problem</Text>
        <Text style={st.bodyText}>
          South African construction and infrastructure companies waste weeks compiling compliance
          documentation for tenders and audits. Spreadsheets get lost. Certificates expire unnoticed.
          Audit packs are assembled manually under deadline pressure. Non-compliance findings lead to
          lost contracts and regulatory penalties.
        </Text>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>The Solution</Text>
          <Text style={st.highlightText}>
            ConformEdge centralises your entire compliance operation — documents, assessments,
            incidents, CAPAs, equipment, and audit packs — in one AI-powered system built for
            South African regulations.
          </Text>
        </View>

        <Text style={st.sectionTitle}>15 Compliance Frameworks</Text>
        <View style={st.standardsBar}>
          {standards.map((s) => (
            <View key={s} style={st.standardBadge}>
              <Text style={st.standardBadgeText}>{s}</Text>
            </View>
          ))}
        </View>

        <Text style={st.sectionTitle}>Key Features</Text>
        <View style={st.featureGrid}>
          {features.map((f) => (
            <View key={f.title} style={st.featureCard}>
              <Text style={st.featureCardTitle}>{f.title}</Text>
              <Text style={st.featureCardText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <PageFooter />
      </Page>

      {/* ===================== PAGE 3: COMPARISON + PRICING ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Pricing & Comparison" />

        <Text style={st.sectionTitle}>Why ConformEdge?</Text>

        {/* Comparison table */}
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.tableHeaderCell, { width: "28%" }]}> </Text>
            <Text style={[st.tableHeaderCell, { width: "24%" }]}>ConformEdge</Text>
            <Text style={[st.tableHeaderCell, { width: "24%" }]}>Spreadsheets</Text>
            <Text style={[st.tableHeaderCell, { width: "24%" }]}>Enterprise Tools</Text>
          </View>
          {[
            ["Setup time", "Minutes", "N/A", "Months"],
            ["AI classification", "Yes", "No", "No"],
            ["SA regulations", "4 built-in", "Manual", "Limited"],
            ["Audit pack generation", "One click", "Days of work", "Complex"],
            ["Pricing", "From R2,299/mo", "Free but costly", "R20,000+/mo"],
            ["Local support", "SA team", "None", "Overseas"],
          ].map(([label, ce, sheets, enterprise], i) => (
            <View key={label} style={i % 2 === 0 ? st.tableRow : st.tableRowAlt}>
              <Text style={[st.tableCellBold, { width: "28%" }]}>{label}</Text>
              <Text style={[st.tableCell, { width: "24%", color: c.teal, fontWeight: "bold" }]}>{ce}</Text>
              <Text style={[st.tableCellMuted, { width: "24%" }]}>{sheets}</Text>
              <Text style={[st.tableCellMuted, { width: "24%" }]}>{enterprise}</Text>
            </View>
          ))}
        </View>

        <Text style={st.sectionTitle}>Pricing</Text>

        {/* Pricing table */}
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.tableHeaderCell, { width: "22%" }]}>Tier</Text>
            <Text style={[st.tableHeaderCell, { width: "18%" }]}>Monthly</Text>
            <Text style={[st.tableHeaderCell, { width: "15%" }]}>Users</Text>
            <Text style={[st.tableHeaderCell, { width: "45%" }]}>Best For</Text>
          </View>
          {[
            ["Essentials", "R2,299", "3", "Small firms, single standard"],
            ["Professional", "R5,499", "5", "Multi-standard, growing teams"],
            ["Business", "R8,499", "10", "Large contractors, full feature set"],
            ["Enterprise", "From R16,999", "25", "Mining, SOEs, multi-site operations"],
          ].map(([tier, price, users, best], i) => (
            <View key={tier} style={i % 2 === 0 ? st.tableRow : st.tableRowAlt}>
              <Text style={[st.tableCellBold, { width: "22%" }]}>{tier}</Text>
              <Text style={[st.tableCell, { width: "18%", fontWeight: "bold", color: c.navy }]}>{price}</Text>
              <Text style={[st.tableCell, { width: "15%", textAlign: "center" }]}>{users}</Text>
              <Text style={[st.tableCellMuted, { width: "45%" }]}>{best}</Text>
            </View>
          ))}
        </View>

        <Text style={st.bodyTextMuted}>
          All tiers include: AI document classification, unlimited storage, audit pack generation,
          incident management, email notifications, and mobile access. 17% discount on annual billing.
        </Text>

        <PageFooter />
      </Page>

      {/* ===================== PAGE 4: SA POSITIONING + PARTNER PROGRAM ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Built for South Africa" />

        <Text style={st.sectionTitle}>Built for South Africa</Text>
        <Bullet>Rand pricing — no USD surprises</Bullet>
        <Bullet>SA regulatory depth — MHSA, POPIA, ECSA, SACPCMP built in, not bolted on</Bullet>
        <Bullet>POPIA compliant — data encrypted at rest and in transit</Bullet>
        <Bullet>Local support — South African development team, SAST business hours</Bullet>
        <Bullet>BEE-friendly — supports BEE level tracking for vendors</Bullet>

        <Text style={[st.sectionTitle, { marginTop: 20 }]}>Partner Program</Text>
        <Text style={st.bodyText}>
          Are you an ISO consultant or SHEQ advisor? Offer ConformEdge to your clients under your
          own brand and earn recurring revenue.
        </Text>

        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.tableHeaderCell, { width: "22%" }]}>Model</Text>
            <Text style={[st.tableHeaderCell, { width: "22%" }]}>Base Fee</Text>
            <Text style={[st.tableHeaderCell, { width: "22%" }]}>Per Client</Text>
            <Text style={[st.tableHeaderCell, { width: "34%" }]}>What You Get</Text>
          </View>
          {[
            ["Referral", "Free", "10% commission (Year 1)", "Passive income from referrals"],
            ["Consulting", "R25K setup + R999/seat", "R1,499-R2,999", "Client dashboard, co-branded"],
            ["White-Label", "R25K+ setup + R999/seat", "R1,499-R2,999", "Your brand, your pricing"],
          ].map(([model, base, perClient, desc], i) => (
            <View key={model} style={i % 2 === 0 ? st.tableRow : st.tableRowAlt}>
              <Text style={[st.tableCellBold, { width: "22%" }]}>{model}</Text>
              <Text style={[st.tableCell, { width: "22%" }]}>{base}</Text>
              <Text style={[st.tableCell, { width: "22%" }]}>{perClient}</Text>
              <Text style={[st.tableCellMuted, { width: "34%" }]}>{desc}</Text>
            </View>
          ))}
        </View>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>How It Works</Text>
          <Text style={st.highlightText}>
            1. Sign up as a partner — we set up your dashboard and branding{"\n"}
            2. Onboard your clients — each gets their own isolated workspace{"\n"}
            3. Earn monthly recurring revenue — we handle the platform, you handle the relationship{"\n"}
            4. White-label partners get full custom branding — your logo, your colours, your domain
          </Text>
        </View>

        <PageFooter />
      </Page>

      {/* ===================== PAGE 5: TESTIMONIAL + CTA ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Get Started" />

        <Text style={st.sectionTitle}>What Our Clients Say</Text>
        <View style={[st.highlightBox, { borderLeftColor: c.accent }]}>
          <Text style={[st.highlightText, { fontStyle: "italic" }]}>
            {'"'}ConformEdge has transformed how we manage compliance across our client portfolio.
            The AI classification alone saves us hours every week.{'"'}
          </Text>
          <Text style={[st.highlightTitle, { color: c.accent, marginTop: 6, marginBottom: 0 }]}>
            — AE SHEQ (Pty) Ltd, Limpopo
          </Text>
        </View>

        {/* CTA */}
        <View style={[st.ctaBox, { marginTop: 30 }]}>
          <Text style={st.ctaTitle}>Ready to Get Started?</Text>
          <Text style={st.ctaText}>Book a free 15-minute demo and see ConformEdge in action</Text>
          <Text style={st.ctaText}>with your own standards and documents.</Text>
          <Text style={st.ctaHighlight}>conformedge.isutech.co.za</Text>
          <Text style={[st.ctaText, { marginTop: 12 }]}>
            Nhlanhla Mnyandu | nhlanhla@isutech.co.za
          </Text>
          <Text style={st.ctaText}>ISU Technologies (Pty) Ltd, South Africa</Text>
        </View>

        <PageFooter />
      </Page>
    </Document>
  )
}
