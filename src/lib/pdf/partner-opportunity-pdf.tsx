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
  green: "#16a34a",
  greenLight: "#dcfce7",
}

const st = StyleSheet.create({
  // Cover
  coverPage: {
    backgroundColor: c.navy,
    padding: 0,
    fontFamily: "Helvetica",
    position: "relative",
  },
  coverAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: c.teal,
  },
  coverContent: {
    paddingHorizontal: 50,
    paddingTop: 100,
    flex: 1,
  },
  coverLogo: { width: 50, height: 50, marginBottom: 16 },
  coverTitle: { fontSize: 32, fontWeight: "bold", color: c.white, lineHeight: 1.2 },
  coverTitleAccent: { fontSize: 32, fontWeight: "bold", color: c.tealLight, lineHeight: 1.2 },
  coverTagline: { fontSize: 13, color: "#94a3b8", marginTop: 16, lineHeight: 1.6 },
  coverStats: { flexDirection: "row", marginTop: 40, gap: 30 },
  coverStat: { alignItems: "center" },
  coverStatNumber: { fontSize: 24, fontWeight: "bold", color: c.tealLight },
  coverStatLabel: { fontSize: 8, color: "#94a3b8", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  coverFooter: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coverFooterText: { fontSize: 9, color: "#64748b" },

  // Content pages
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
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: `2px solid ${c.teal}`,
  },
  pageHeaderBrand: { flexDirection: "row", alignItems: "center", gap: 6 },
  pageHeaderLogo: { width: 20, height: 20 },
  pageHeaderName: { fontSize: 12, fontWeight: "bold", color: c.navy },
  pageHeaderTitle: { fontSize: 9, color: c.textMuted },

  // Sections
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: c.navy, marginBottom: 8, marginTop: 4 },
  sectionSubtitle: { fontSize: 12, fontWeight: "bold", color: c.navyLight, marginBottom: 6, marginTop: 12 },
  bodyText: { fontSize: 10, color: c.textDark, lineHeight: 1.6, marginBottom: 6 },
  bodyTextMuted: { fontSize: 9, color: c.textMuted, lineHeight: 1.5, marginBottom: 4 },

  // Highlight box
  highlightBox: {
    backgroundColor: c.bgLight,
    border: `1px solid ${c.teal}`,
    borderLeftWidth: 3,
    borderLeftColor: c.teal,
    padding: 12,
    borderRadius: 4,
    marginVertical: 8,
  },
  highlightTitle: { fontSize: 10, fontWeight: "bold", color: c.teal, marginBottom: 4 },
  highlightText: { fontSize: 9, color: c.textDark, lineHeight: 1.5 },

  // Revenue box
  revenueBox: {
    backgroundColor: c.greenLight,
    border: `1px solid ${c.green}`,
    borderLeftWidth: 3,
    borderLeftColor: c.green,
    padding: 12,
    borderRadius: 4,
    marginVertical: 8,
  },
  revenueTitle: { fontSize: 10, fontWeight: "bold", color: c.green, marginBottom: 4 },
  revenueText: { fontSize: 9, color: c.textDark, lineHeight: 1.5 },
  revenueBig: { fontSize: 18, fontWeight: "bold", color: c.green, marginTop: 4 },

  // Bullets
  bulletRow: { flexDirection: "row", marginBottom: 4, paddingLeft: 4 },
  bulletDot: { fontSize: 9, color: c.teal, marginRight: 6, width: 10 },
  bulletText: { fontSize: 9, color: c.textDark, lineHeight: 1.5, flex: 1 },

  // Tables
  table: { marginTop: 6, marginBottom: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: c.navy,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: { fontWeight: "bold", color: c.white, fontSize: 8.5 },
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

  // Model cards
  modelCard: {
    border: `1px solid ${c.border}`,
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  modelCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: `1px solid ${c.border}`,
  },
  modelCardTitle: { fontSize: 12, fontWeight: "bold", color: c.navy },
  modelCardPrice: { fontSize: 11, fontWeight: "bold", color: c.teal },
  modelCardDesc: { fontSize: 9, color: c.textMuted, lineHeight: 1.5, marginBottom: 4 },

  // CTA
  ctaBox: {
    backgroundColor: c.navy,
    padding: 24,
    borderRadius: 6,
    marginTop: 14,
    alignItems: "center",
  },
  ctaTitle: { fontSize: 16, fontWeight: "bold", color: c.white, marginBottom: 8 },
  ctaText: { fontSize: 10, color: "#94a3b8", marginBottom: 4, textAlign: "center" },
  ctaHighlight: { fontSize: 11, fontWeight: "bold", color: c.tealLight, marginTop: 8 },

  // Footer
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
  footerText: { fontSize: 7.5, color: c.textMuted },
})

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
      <Text style={st.footerText}>ConformEdge — Partner Revenue Opportunity</Text>
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

export function PartnerOpportunityPDF() {
  return (
    <Document title="ConformEdge — Partner Revenue Opportunity" author="ISU Technologies">
      {/* ===================== COVER PAGE ===================== */}
      <Page size="A4" style={st.coverPage}>
        <View style={st.coverAccentBar} />
        <View style={st.coverContent}>
          <Image src={LOGO_PATH} style={st.coverLogo} />
          <Text style={st.coverTitle}>Build a Compliance</Text>
          <Text style={st.coverTitleAccent}>Revenue Stream</Text>
          <Text style={st.coverTagline}>
            Add ISO compliance management as a service to your business.{"\n"}
            Help small construction companies stay compliant — and earn{"\n"}
            recurring monthly revenue from the platform that powers it all.
          </Text>
          <View style={st.coverStats}>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>11</Text>
              <Text style={st.coverStatLabel}>Standards</Text>
            </View>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>36</Text>
              <Text style={st.coverStatLabel}>Modules</Text>
            </View>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>3</Text>
              <Text style={st.coverStatLabel}>Partner Models</Text>
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

      {/* ===================== PAGE 2: THE OPPORTUNITY ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="The Opportunity" />

        <Text style={st.sectionTitle}>Why Compliance is a Revenue Opportunity</Text>
        <Text style={st.bodyText}>
          Thousands of small construction and infrastructure companies in South Africa need ISO
          compliance to win tenders — but they cannot afford full-time SHEQ staff or enterprise
          compliance software. They need someone to handle it for them.
        </Text>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>The Gap You Can Fill</Text>
          <Text style={st.highlightText}>
            You already meet these companies through your financial consulting work. By adding
            compliance services — powered by ConformEdge and delivered by a qualified ISO
            practitioner — you create a new recurring revenue stream while solving a real problem
            for your clients.
          </Text>
        </View>

        <Text style={st.sectionTitle}>Three Ways to Partner</Text>

        {/* Model 1: Referral */}
        <View style={st.modelCard}>
          <View style={st.modelCardHeader}>
            <Text style={st.modelCardTitle}>1. Referral Partner</Text>
            <Text style={st.modelCardPrice}>Free — Earn 15% Commission</Text>
          </View>
          <Text style={st.modelCardDesc}>
            The simplest model. Refer companies to ConformEdge and earn 15% of their first-year
            subscription. No platform cost, no management — just introductions.
          </Text>
          <Bullet>Best for: Passive income alongside your consulting work</Bullet>
          <Bullet>Example: 5 Professional referrals = R49,491/year commission</Bullet>
          <Bullet>Zero operational overhead — we handle everything</Bullet>
        </View>

        {/* Model 2: Consulting Partner */}
        <View style={st.modelCard}>
          <View style={st.modelCardHeader}>
            <Text style={st.modelCardTitle}>2. Consulting Partner</Text>
            <Text style={st.modelCardPrice}>R4,999/mo + tiered per-client</Text>
          </View>
          <Text style={st.modelCardDesc}>
            Manage multiple client companies from one dashboard. Hire or contract an ISO practitioner,
            use ConformEdge as the platform, and charge clients your own service fee.
          </Text>
          <Bullet>Clients 1–10: R899/mo | Clients 11–25: R1,299/mo | 26+: R999/mo</Bullet>
          <Bullet>Multi-tenant dashboard — manage all clients from one login</Bullet>
          <Bullet>Each client gets isolated, secure workspace</Bullet>
          <Bullet>You set your own pricing to clients — keep the margin</Bullet>
        </View>

        {/* Model 3: White-Label */}
        <View style={st.modelCard}>
          <View style={st.modelCardHeader}>
            <Text style={st.modelCardTitle}>3. White-Label Partner</Text>
            <Text style={st.modelCardPrice}>R6,999/mo + tiered per-client</Text>
          </View>
          <Text style={st.modelCardDesc}>
            Full custom branding — your logo, your colours, your domain. Your clients see your brand,
            not ConformEdge. Best for building a standalone compliance division.
          </Text>
          <Bullet>Clients 1–10: R699/mo | Clients 11–25: R999/mo | 26+: R799/mo</Bullet>
          <Bullet>Custom branding: logo, colours, email templates, domain</Bullet>
          <Bullet>Full API access for integration with your systems</Bullet>
          <Bullet>Dedicated partner manager from ConformEdge</Bullet>
        </View>

        <PageFooter />
      </Page>

      {/* ===================== PAGE 3: REVENUE MODEL + ECONOMICS ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Revenue & Economics" />

        <Text style={st.sectionTitle}>Revenue Projections</Text>
        <Text style={st.bodyText}>
          As a Consulting Partner, you charge clients a monthly service fee for compliance management
          (platform + your practitioner's expertise). Here's what the economics look like:
        </Text>

        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.tableHeaderCell, { width: "16%" }]}>Scenario</Text>
            <Text style={[st.tableHeaderCell, { width: "10%", textAlign: "center" }]}>Clients</Text>
            <Text style={[st.tableHeaderCell, { width: "19%" }]}>Your Revenue</Text>
            <Text style={[st.tableHeaderCell, { width: "19%" }]}>Platform Cost</Text>
            <Text style={[st.tableHeaderCell, { width: "19%" }]}>Your Net</Text>
            <Text style={[st.tableHeaderCell, { width: "17%", textAlign: "center" }]}>Platform %</Text>
          </View>
          {[
            ["Starting out", "5", "R25,000/mo", "R9,494/mo", "R15,506/mo", "38%"],
            ["Growing", "10", "R50,000/mo", "R13,989/mo", "R36,011/mo", "28%"],
            ["Established", "15", "R75,000/mo", "R20,484/mo", "R54,516/mo", "27%"],
            ["Scaled", "25", "R125,000/mo", "R33,474/mo", "R91,526/mo", "27%"],
            ["Large", "30", "R150,000/mo", "R38,469/mo", "R111,531/mo", "26%"],
          ].map(([scenario, clients, revenue, cost, margin, pct], i) => (
            <View key={scenario} style={i % 2 === 0 ? st.tableRow : st.tableRowAlt}>
              <Text style={[st.tableCellBold, { width: "16%" }]}>{scenario}</Text>
              <Text style={[st.tableCell, { width: "10%", textAlign: "center" }]}>{clients}</Text>
              <Text style={[st.tableCell, { width: "19%" }]}>{revenue}</Text>
              <Text style={[st.tableCellMuted, { width: "19%" }]}>{cost}</Text>
              <Text style={[st.tableCell, { width: "19%", fontWeight: "bold", color: c.green }]}>{margin}</Text>
              <Text style={[st.tableCell, { width: "17%", textAlign: "center", color: c.teal, fontWeight: "bold" }]}>{pct}</Text>
            </View>
          ))}
        </View>

        <Text style={st.bodyTextMuted}>
          Based on charging clients R5,000/mo per company for compliance management services
          (platform + practitioner support). Tiered per-client pricing: R899/mo (1–10), R1,299/mo (11–25), R999/mo (26+).
        </Text>

        <View style={st.revenueBox}>
          <Text style={st.revenueTitle}>15-Client Consulting Partner — Annual Projection</Text>
          <Text style={st.revenueText}>
            Revenue: R75,000/mo x 12 = R900,000/year{"\n"}
            Platform cost: R20,484/mo x 12 = R245,808/year{"\n"}
            Practitioner cost (estimate): R25,000/mo x 12 = R300,000/year
          </Text>
          <Text style={st.revenueBig}>Net Profit: ~R354,192/year</Text>
        </View>

        <Text style={st.sectionTitle}>What You Offer Your Clients</Text>
        <Bullet>ISO compliance management — documents, assessments, audit packs</Bullet>
        <Bullet>AI-powered document classification — upload and auto-file</Bullet>
        <Bullet>Incident management with COIDA and MHSA reporting</Bullet>
        <Bullet>Equipment and calibration tracking</Bullet>
        <Bullet>Subcontractor compliance portals</Bullet>
        <Bullet>Audit-ready packs generated in one click</Bullet>
        <Bullet>11 SA-relevant standards — ISO 9001, 14001, 45001, MHSA, POPIA, and more</Bullet>

        <Text style={st.sectionSubtitle}>Built-In Platform Monitoring</Text>
        <Text style={st.bodyTextMuted}>
          ConformEdge includes a Partner Insights dashboard that monitors client activity, usage
          patterns, and health scores — ensuring quality service delivery and flagging anomalies
          automatically. Full transparency for both you and ConformEdge.
        </Text>

        <PageFooter />
      </Page>

      {/* ===================== PAGE 4: GETTING STARTED + CTA ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Getting Started" />

        <Text style={st.sectionTitle}>How to Get Started</Text>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>Step 1 — Choose Your Model</Text>
          <Text style={st.highlightText}>
            Start as a Referral Partner (zero cost) to test the waters, or go straight to Consulting
            Partner if you're ready to manage clients actively. You can upgrade at any time.
          </Text>
        </View>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>Step 2 — Bring the Expertise</Text>
          <Text style={st.highlightText}>
            Hire or contract a qualified ISO practitioner (SHEQ officer, lead auditor, or similar).
            They manage the compliance work; ConformEdge provides the platform. Your financial
            consulting clients get a complete service.
          </Text>
        </View>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>Step 3 — Onboard Your First Clients</Text>
          <Text style={st.highlightText}>
            We help you set up your partner dashboard, configure client workspaces, and train your
            team on the platform. Each client gets their own isolated environment with full
            compliance tracking.
          </Text>
        </View>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>Step 4 — Scale and Earn</Text>
          <Text style={st.highlightText}>
            As you add more clients, your per-client costs decrease (volume discounts at 10+ and 25+
            clients) while your revenue scales linearly. The more clients, the better the margins.
          </Text>
        </View>

        <Text style={st.sectionSubtitle}>Why ConformEdge?</Text>
        <Bullet>Built for South Africa — Rand pricing, SA regulations, local support</Bullet>
        <Bullet>AI-powered — saves hours of manual document classification</Bullet>
        <Bullet>Multi-tenant architecture — one dashboard for all your clients</Bullet>
        <Bullet>Data isolation — every client's data is completely separate and secure</Bullet>
        <Bullet>Partner insights — real-time monitoring of client health and activity</Bullet>
        <Bullet>No lock-in — month-to-month billing, cancel anytime</Bullet>

        {/* CTA */}
        <View style={st.ctaBox}>
          <Text style={st.ctaTitle}>Let's Talk</Text>
          <Text style={st.ctaText}>Book a 15-minute call and we'll walk you through the platform,</Text>
          <Text style={st.ctaText}>the partner economics, and how to get started.</Text>
          <Text style={st.ctaHighlight}>conformedge.isutech.co.za</Text>
          <Text style={[st.ctaText, { marginTop: 10 }]}>
            Nhlanhla Mnyandu | nhlanhla@isutech.co.za | ISU Technologies
          </Text>
        </View>

        <PageFooter />
      </Page>
    </Document>
  )
}
