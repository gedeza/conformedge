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

  // Pricing card
  pricingCard: {
    border: `1px solid ${c.teal}`,
    borderRadius: 4,
    padding: 12,
    marginBottom: 6,
    backgroundColor: c.bgLight,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  pricingLabel: { fontSize: 9, color: c.textDark },
  pricingValue: { fontSize: 9, fontWeight: "bold", color: c.navy },

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
            Manage construction clients' safety compliance on one platform —{"\n"}
            simple pricing, healthy margins, recurring monthly revenue.
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
              <Text style={st.coverStatNumber}>R25K</Text>
              <Text style={st.coverStatLabel}>Setup Fee</Text>
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

      {/* ===================== PAGE 2: THE OPPORTUNITY + PRICING ===================== */}
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
            By adding compliance services — powered by ConformEdge and delivered by a qualified
            safety practitioner — you create a new recurring revenue stream while solving a real
            problem for your clients. One platform, multiple clients, predictable costs.
          </Text>
        </View>

        <Text style={st.sectionTitle}>Simple, Predictable Pricing</Text>
        <Text style={st.bodyText}>
          No complex tier bands. No volume discount tables. Two line items on your bill:
        </Text>

        <View style={st.pricingCard}>
          <View style={st.pricingRow}>
            <Text style={st.pricingLabel}>Once-off setup & training (first 5 clients)</Text>
            <Text style={st.pricingValue}>R25,000</Text>
          </View>
          <View style={st.pricingRow}>
            <Text style={st.pricingLabel}>Per consultant seat (minimum 5)</Text>
            <Text style={st.pricingValue}>R999/mo</Text>
          </View>
          <View style={st.pricingRow}>
            <Text style={st.pricingLabel}>Per client org — Essentials</Text>
            <Text style={st.pricingValue}>R1,499/mo</Text>
          </View>
          <View style={st.pricingRow}>
            <Text style={st.pricingLabel}>Per client org — Professional</Text>
            <Text style={st.pricingValue}>R1,999/mo</Text>
          </View>
          <View style={st.pricingRow}>
            <Text style={st.pricingLabel}>Per client org — Business</Text>
            <Text style={st.pricingValue}>R2,999/mo</Text>
          </View>
          <View style={[st.pricingRow, { marginTop: 4, paddingTop: 4, borderTop: `1px solid ${c.border}` }]}>
            <Text style={[st.pricingLabel, { fontWeight: "bold" }]}>Annual billing discount</Text>
            <Text style={[st.pricingValue, { color: c.green }]}>2 months free</Text>
          </View>
        </View>

        <Text style={st.bodyTextMuted}>
          Professional tier is the sweet spot for construction safety — it includes incident management
          (COIDA, MHSA), work permits (7 types), equipment register, recurring checklists, and AI-powered
          gap analysis. The same flat rate whether it's your 1st client or your 50th.
        </Text>

        <Text style={st.sectionSubtitle}>What You Offer Your Clients</Text>
        <Bullet>ISO compliance management — documents, assessments, audit packs</Bullet>
        <Bullet>Incident management with COIDA and MHSA statutory reporting</Bullet>
        <Bullet>Work permits — hot work, confined space, heights, excavation, and more</Bullet>
        <Bullet>Equipment register with calibration and maintenance tracking</Bullet>
        <Bullet>AI-powered document classification — upload and auto-file</Bullet>
        <Bullet>Mobile/offline access — your consultants work on-site with the PWA app</Bullet>
        <Bullet>11 SA-relevant standards — ISO 9001, 14001, 45001, MHSA, POPIA, and more</Bullet>

        <PageFooter />
      </Page>

      {/* ===================== PAGE 3: REVENUE MODEL + ECONOMICS ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Revenue & Economics" />

        <Text style={st.sectionTitle}>Revenue Projections</Text>
        <Text style={st.bodyText}>
          You charge clients a monthly service fee for compliance management (platform + your
          practitioner's expertise). Here's what the economics look like at R5,000/client:
        </Text>

        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.tableHeaderCell, { width: "18%" }]}>Scenario</Text>
            <Text style={[st.tableHeaderCell, { width: "10%", textAlign: "center" }]}>Clients</Text>
            <Text style={[st.tableHeaderCell, { width: "18%" }]}>Your Revenue</Text>
            <Text style={[st.tableHeaderCell, { width: "18%" }]}>Platform Cost</Text>
            <Text style={[st.tableHeaderCell, { width: "18%" }]}>Your Margin</Text>
            <Text style={[st.tableHeaderCell, { width: "18%", textAlign: "center" }]}>Your Keep %</Text>
          </View>
          {[
            ["Starting", "5", "R25,000/mo", "R14,990/mo", "R10,010/mo", "40%"],
            ["Growing", "10", "R50,000/mo", "R24,985/mo", "R25,015/mo", "50%"],
            ["Established", "15", "R75,000/mo", "R36,978/mo", "R38,022/mo", "51%"],
            ["Scaling", "20", "R100,000/mo", "R47,975/mo", "R52,025/mo", "52%"],
            ["Large", "30", "R150,000/mo", "R69,960/mo", "R80,040/mo", "53%"],
          ].map(([scenario, clients, revenue, cost, margin, pct], i) => (
            <View key={scenario} style={i % 2 === 0 ? st.tableRow : st.tableRowAlt}>
              <Text style={[st.tableCellBold, { width: "18%" }]}>{scenario}</Text>
              <Text style={[st.tableCell, { width: "10%", textAlign: "center" }]}>{clients}</Text>
              <Text style={[st.tableCell, { width: "18%" }]}>{revenue}</Text>
              <Text style={[st.tableCellMuted, { width: "18%" }]}>{cost}</Text>
              <Text style={[st.tableCell, { width: "18%", fontWeight: "bold", color: c.green }]}>{margin}</Text>
              <Text style={[st.tableCell, { width: "18%", textAlign: "center", color: c.teal, fontWeight: "bold" }]}>{pct}</Text>
            </View>
          ))}
        </View>

        <Text style={st.bodyTextMuted}>
          Based on 5 consultant seats (R999/mo each) + Professional client orgs (R1,999/mo each).
          Seats increase with team growth: 5 seats for up to 10 clients, 7 for 15, 8 for 20, 10 for 30.
        </Text>

        <View style={st.revenueBox}>
          <Text style={st.revenueTitle}>10-Client Partner — Annual (with Annual Billing Discount)</Text>
          <Text style={st.revenueText}>
            Revenue: R50,000/mo x 12 = R600,000/year{"\n"}
            Platform cost (annual): R249,850/year (save R49,820 vs monthly){"\n"}
            Practitioner cost (estimate): R25,000/mo x 12 = R300,000/year
          </Text>
          <Text style={st.revenueBig}>Net Profit: ~R50,150/year</Text>
        </View>

        <View style={st.revenueBox}>
          <Text style={st.revenueTitle}>15-Client Partner — Annual (with Annual Billing Discount)</Text>
          <Text style={st.revenueText}>
            Revenue: R75,000/mo x 12 = R900,000/year{"\n"}
            Platform cost (annual): R369,780/year (save R73,956 vs monthly){"\n"}
            2 Practitioners: R50,000/mo x 12 = R600,000/year
          </Text>
          <Text style={st.revenueBig}>Net Profit: ~R-69,780/year at R5K/client</Text>
          <Text style={[st.revenueText, { marginTop: 4, fontWeight: "bold" }]}>
            At R7,000/client: Revenue R1,260,000 — Profit R290,220/year
          </Text>
        </View>

        <Text style={st.bodyTextMuted}>
          The annual billing discount (pay 10 months, get 12) saves R30K–R120K/year depending on scale.
          That saving goes straight to your bottom line.
        </Text>

        <PageFooter />
      </Page>

      {/* ===================== PAGE 4: GETTING STARTED + CTA ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Getting Started" />

        <Text style={st.sectionTitle}>How to Get Started</Text>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>Step 1 — Discovery Call (30 minutes)</Text>
          <Text style={st.highlightText}>
            We walk you through the platform, discuss your client base, and model the economics
            for your specific situation.
          </Text>
        </View>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>Step 2 — Agreement & R25,000 Setup</Text>
          <Text style={st.highlightText}>
            Sign the partner agreement and pay the once-off setup fee. Over 2 weeks we configure
            your partner account, set up your first 5 client organisations, and deliver 12 hours
            of hands-on training across 5 modules.
          </Text>
        </View>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>Step 3 — Go Live & Grow</Text>
          <Text style={st.highlightText}>
            Start managing your clients' compliance from day one. Add more clients at the flat
            per-org rate — same fee for your 1st client as your 50th.
          </Text>
        </View>

        <Text style={st.sectionSubtitle}>The R25,000 Setup Includes</Text>
        <Bullet>5 consultant seats + first 5 client organisations fully configured</Bullet>
        <Bullet>13 construction safety checklist templates, work permits, incident categories</Bullet>
        <Bullet>Data migration assistance (existing incidents, equipment, documents)</Bullet>
        <Bullet>12 hours training: incidents, permits, equipment, checklists, partner console</Bullet>
        <Bullet>Operations guide, quick-reference cards, and handover pack</Bullet>

        <Text style={st.sectionSubtitle}>Why ConformEdge?</Text>
        <Bullet>Built for South Africa — Rand pricing, SA regulations, local support</Bullet>
        <Bullet>AI-powered — saves hours of manual document classification</Bullet>
        <Bullet>Multi-tenant — one dashboard, fully isolated client data</Bullet>
        <Bullet>Mobile/offline — PWA app for on-site safety work</Bullet>

        {/* CTA */}
        <View style={st.ctaBox}>
          <Text style={st.ctaTitle}>Let's Talk</Text>
          <Text style={st.ctaText}>Book a 30-minute discovery call. We'll walk you through the platform,</Text>
          <Text style={st.ctaText}>your revenue model, and exactly what the R25K setup delivers.</Text>
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
