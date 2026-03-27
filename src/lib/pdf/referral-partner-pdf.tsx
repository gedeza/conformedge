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
  green: "#16a34a",
  greenLight: "#dcfce7",
  amber: "#f59e0b",
  amberLight: "#fef3c7",
  amberDark: "#92400e",
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
    backgroundColor: c.amber,
  },
  coverContent: {
    paddingHorizontal: 50,
    paddingTop: 100,
    flex: 1,
  },
  coverLogo: { width: 50, height: 50, marginBottom: 16 },
  coverTitle: { fontSize: 32, fontWeight: "bold", color: c.white, lineHeight: 1.2 },
  coverTitleAccent: { fontSize: 32, fontWeight: "bold", color: c.amber, lineHeight: 1.2 },
  coverTagline: { fontSize: 13, color: "#94a3b8", marginTop: 16, lineHeight: 1.6 },
  coverStats: { flexDirection: "row", marginTop: 40, gap: 40 },
  coverStat: { alignItems: "center" },
  coverStatNumber: { fontSize: 28, fontWeight: "bold", color: c.amber },
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
    borderBottom: `2px solid ${c.amber}`,
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
    border: `1px solid ${c.amber}`,
    borderLeftWidth: 3,
    borderLeftColor: c.amber,
    padding: 12,
    borderRadius: 4,
    marginVertical: 6,
  },
  highlightTitle: { fontSize: 10, fontWeight: "bold", color: c.amberDark, marginBottom: 4 },
  highlightText: { fontSize: 9, color: c.textDark, lineHeight: 1.5 },

  // Commission box
  commissionBox: {
    backgroundColor: c.greenLight,
    border: `1px solid ${c.green}`,
    borderLeftWidth: 3,
    borderLeftColor: c.green,
    padding: 14,
    borderRadius: 4,
    marginVertical: 8,
  },
  commissionTitle: { fontSize: 10, fontWeight: "bold", color: c.green, marginBottom: 4 },
  commissionText: { fontSize: 9, color: c.textDark, lineHeight: 1.5 },
  commissionBig: { fontSize: 22, fontWeight: "bold", color: c.green, marginTop: 4 },

  // Bullets
  bulletRow: { flexDirection: "row", marginBottom: 4, paddingLeft: 4 },
  bulletDot: { fontSize: 9, color: c.amber, marginRight: 6, width: 10 },
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${c.border}`,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${c.border}`,
    backgroundColor: c.bgLight,
  },
  tableCell: { fontSize: 9, color: c.textDark },
  tableCellBold: { fontSize: 9, fontWeight: "bold", color: c.textDark },

  // Steps
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: c.amber,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  stepNumberText: { fontSize: 12, fontWeight: "bold", color: c.white },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 10, fontWeight: "bold", color: c.navy, marginBottom: 2 },
  stepDesc: { fontSize: 9, color: c.textDark, lineHeight: 1.5 },

  // CTA
  ctaBox: {
    backgroundColor: c.navy,
    padding: 24,
    borderRadius: 6,
    marginTop: 16,
    alignItems: "center",
  },
  ctaTitle: { fontSize: 16, fontWeight: "bold", color: c.white, marginBottom: 8 },
  ctaText: { fontSize: 10, color: "#94a3b8", marginBottom: 4, textAlign: "center" },
  ctaHighlight: { fontSize: 11, fontWeight: "bold", color: c.amber, marginTop: 8 },

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
      <Text style={st.footerText}>ConformEdge — Referral Partner Programme</Text>
      <Text style={st.footerText}>conformedge.isutech.co.za | conformedge@isutech.co.za</Text>
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

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <View style={st.stepRow}>
      <View style={st.stepNumber}>
        <Text style={st.stepNumberText}>{num}</Text>
      </View>
      <View style={st.stepContent}>
        <Text style={st.stepTitle}>{title}</Text>
        <Text style={st.stepDesc}>{desc}</Text>
      </View>
    </View>
  )
}

export function ReferralPartnerPDF() {
  return (
    <Document title="ConformEdge — Referral Partner Programme" author="ISU Technologies">
      {/* ===================== COVER PAGE ===================== */}
      <Page size="A4" style={st.coverPage}>
        <View style={st.coverAccentBar} />
        <View style={st.coverContent}>
          <Image src={LOGO_PATH} style={st.coverLogo} />
          <Text style={st.coverTitle}>Earn by Referring.</Text>
          <Text style={st.coverTitleAccent}>No Cost. No Management.</Text>
          <Text style={st.coverTagline}>
            Know a company that needs SHEQ compliance?{"\n"}
            Introduce them to ConformEdge and earn 10% commission{"\n"}
            on their first year — with zero effort on your part.
          </Text>
          <View style={st.coverStats}>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>10%</Text>
              <Text style={st.coverStatLabel}>Commission</Text>
            </View>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>R0</Text>
              <Text style={st.coverStatLabel}>Cost to You</Text>
            </View>
            <View style={st.coverStat}>
              <Text style={st.coverStatNumber}>0</Text>
              <Text style={st.coverStatLabel}>Management</Text>
            </View>
          </View>
        </View>
        <View style={st.coverFooter}>
          <Text style={st.coverFooterText}>ISU Technologies (Pty) Ltd</Text>
          <Text style={st.coverFooterText}>conformedge.isutech.co.za</Text>
        </View>
      </Page>

      {/* ===================== PAGE 2: HOW IT WORKS + COMMISSION ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Referral Partner Programme" />

        <Text style={st.sectionTitle}>How It Works</Text>
        <Text style={st.bodyText}>
          The ConformEdge Referral Partner Programme is the simplest way to earn from
          compliance. No platform fees, no client management, no technical knowledge required.
          Just introductions.
        </Text>

        <Step
          num={1}
          title="Sign Up (Free)"
          desc="Register as a referral partner — takes 5 minutes. No cost, no contract."
        />
        <Step
          num={2}
          title="Get Your Unique Referral Link"
          desc="We generate a tracked referral link and code unique to you."
        />
        <Step
          num={3}
          title="Share With Your Network"
          desc="Send the link to companies that need compliance management — construction firms, manufacturers, infrastructure companies."
        />
        <Step
          num={4}
          title="They Sign Up"
          desc="The company subscribes to ConformEdge directly. We handle onboarding, support, and everything else."
        />
        <Step
          num={5}
          title="You Earn 10% Commission"
          desc="You receive 10% of their subscription fees for the entire first year. Paid monthly, directly to your account."
        />

        <Text style={st.sectionTitle}>Commission Structure</Text>

        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.tableHeaderCell, { width: "35%" }]}>Client Subscribes To</Text>
            <Text style={[st.tableHeaderCell, { width: "20%", textAlign: "center" }]}>Monthly Fee</Text>
            <Text style={[st.tableHeaderCell, { width: "25%", textAlign: "center" }]}>Your 10% / Month</Text>
            <Text style={[st.tableHeaderCell, { width: "20%", textAlign: "right" }]}>Your Year 1 Total</Text>
          </View>
          {[
            ["Essentials", "R2,299", "R230", "R2,759"],
            ["Professional", "R5,499", "R550", "R6,599"],
            ["Business", "R8,499", "R850", "R10,199"],
          ].map(([plan, fee, monthly, annual], i) => (
            <View key={plan} style={i % 2 === 0 ? st.tableRow : st.tableRowAlt}>
              <Text style={[st.tableCellBold, { width: "35%" }]}>{plan}</Text>
              <Text style={[st.tableCell, { width: "20%", textAlign: "center" }]}>{fee}</Text>
              <Text style={[st.tableCell, { width: "25%", textAlign: "center", color: c.green, fontWeight: "bold" }]}>{monthly}</Text>
              <Text style={[st.tableCell, { width: "20%", textAlign: "right", fontWeight: "bold", color: c.green }]}>{annual}</Text>
            </View>
          ))}
        </View>

        <View style={st.commissionBox}>
          <Text style={st.commissionTitle}>Example: Refer 5 Companies to Professional</Text>
          <Text style={st.commissionText}>
            5 clients x R5,499/mo x 10% = R2,750/month in commission{"\n"}
            Over 12 months: 5 x R6,599 = R32,994 in your pocket
          </Text>
          <Text style={st.commissionBig}>R32,994 / year</Text>
        </View>

        <View style={st.commissionBox}>
          <Text style={st.commissionTitle}>Example: Refer 10 Companies (Mixed Plans)</Text>
          <Text style={st.commissionText}>
            4 Essentials + 4 Professional + 2 Business ={"\n"}
            (4 x R2,759) + (4 x R6,599) + (2 x R10,199) = R57,830 in Year 1
          </Text>
          <Text style={st.commissionBig}>R57,830 / year</Text>
        </View>

        <PageFooter />
      </Page>

      {/* ===================== PAGE 3: WHO / WHY / CTA ===================== */}
      <Page size="A4" style={st.page}>
        <PageHeader title="Who Should Refer?" />

        <Text style={st.sectionTitle}>Who Is This For?</Text>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>Financial Consultants & Accountants</Text>
          <Text style={st.highlightText}>
            Your clients ask about compliance. Refer them to ConformEdge and earn while they get sorted.
          </Text>
        </View>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>Industry Associations & Networks</Text>
          <Text style={st.highlightText}>
            Construction associations, trade bodies — your members need compliance tools. Share the link, earn on every sign-up.
          </Text>
        </View>

        <View style={st.highlightBox}>
          <Text style={st.highlightTitle}>SHEQ Professionals & Anyone in Construction</Text>
          <Text style={st.highlightText}>
            Engineers, project managers, procurement officers — if you know companies that need SHEQ compliance to win tenders, every introduction has value.
          </Text>
        </View>

        <Text style={st.sectionSubtitle}>What ConformEdge Offers Your Referrals</Text>
        <Bullet>AI-powered SHEQ compliance platform — 11 SA standards, 36 modules</Bullet>
        <Bullet>Incident management, work permits, equipment tracking, audit packs</Bullet>
        <Bullet>Mobile/offline access for on-site safety work (PWA)</Bullet>
        <Bullet>Built for SA construction — from R2,299/mo</Bullet>

        <Text style={st.sectionSubtitle}>Programme Terms</Text>
        <Bullet>No sign-up fee, no monthly fee, no contract</Bullet>
        <Bullet>10% commission on the referred client's first 12 months, paid monthly via EFT</Bullet>
        <Bullet>Referral link valid for 90 days per lead — no minimum referral count</Bullet>

        {/* CTA */}
        <View style={st.ctaBox}>
          <Text style={st.ctaTitle}>Start Earning Today</Text>
          <Text style={st.ctaText}>Sign up takes 5 minutes. No cost, no risk.</Text>
          <Text style={st.ctaText}>Email us and we'll set up your referral account.</Text>
          <Text style={st.ctaHighlight}>conformedge@isutech.co.za</Text>
          <Text style={[st.ctaText, { marginTop: 8 }]}>
            conformedge.isutech.co.za | ISU Technologies (Pty) Ltd
          </Text>
        </View>

        <PageFooter />
      </Page>
    </Document>
  )
}
