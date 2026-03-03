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
  border: "#e2e8f0",
  white: "#ffffff",
  green: "#16a34a",
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 80,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.textDark,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  brandTag: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },
  invoiceLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: 2,
  },
  // Info sections
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  infoBlock: {
    width: "45%",
  },
  infoTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 10,
    marginBottom: 2,
  },
  // Status badge
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    color: colors.white,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  statusPaid: { backgroundColor: colors.green },
  statusOpen: { backgroundColor: colors.primaryLight },
  statusDraft: { backgroundColor: colors.textMuted },
  // Table
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 3,
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: colors.white,
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottom: `1px solid ${colors.border}`,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.bgLight,
  },
  cellDescription: { width: "50%", fontSize: 9 },
  cellQty: { width: "15%", fontSize: 9, textAlign: "center" },
  cellPrice: { width: "17.5%", fontSize: 9, textAlign: "right" },
  cellTotal: { width: "17.5%", fontSize: 9, textAlign: "right" },
  // Totals
  totalsSection: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 250,
    paddingVertical: 4,
  },
  totalsLabel: {
    width: 130,
    fontSize: 10,
    color: colors.textMuted,
  },
  totalsValue: {
    width: 120,
    fontSize: 10,
    textAlign: "right",
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 250,
    paddingVertical: 6,
    borderTop: `2px solid ${colors.primary}`,
    marginTop: 4,
  },
  totalsFinalLabel: {
    width: 130,
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
  totalsFinalValue: {
    width: 120,
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "right",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },
})

// ── Types ─────────────────────────────────────

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPriceCents: number
  totalCents: number
}

export interface InvoicePDFProps {
  invoiceId: string
  organizationName: string
  organizationAddress?: string
  status: string
  issuedDate: string
  dueDate: string
  paidDate?: string
  periodStart: string
  periodEnd: string
  lineItems: InvoiceLineItem[]
  subtotalCents: number
  vatCents: number
  totalCents: number
  vatRate: number
  paymentReference?: string
}

function formatZar(cents: number): string {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Component ─────────────────────────────────

export function InvoicePDF(props: InvoicePDFProps) {
  const statusStyle = props.status === "PAID"
    ? styles.statusPaid
    : props.status === "OPEN"
      ? styles.statusOpen
      : styles.statusDraft

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>ConformEdge</Text>
            <Text style={styles.brandTag}>AI-Powered ISO Compliance Management</Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>TAX INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{props.invoiceId.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Status */}
        <View style={[styles.statusBadge, statusStyle]}>
          <Text>{props.status}</Text>
        </View>

        {/* Bill To / Invoice Details */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Bill To</Text>
            <Text style={styles.infoText}>{props.organizationName}</Text>
            {props.organizationAddress && (
              <Text style={styles.infoText}>{props.organizationAddress}</Text>
            )}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Invoice Details</Text>
            <Text style={styles.infoText}>Issued: {props.issuedDate}</Text>
            <Text style={styles.infoText}>Due: {props.dueDate}</Text>
            {props.paidDate && (
              <Text style={[styles.infoText, { color: colors.green }]}>
                Paid: {props.paidDate}
              </Text>
            )}
            <Text style={styles.infoText}>
              Period: {props.periodStart} — {props.periodEnd}
            </Text>
            {props.paymentReference && (
              <Text style={[styles.infoText, { fontSize: 8, color: colors.textMuted }]}>
                Ref: {props.paymentReference}
              </Text>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.cellDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.cellQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.cellPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.cellTotal]}>Total</Text>
          </View>
          {props.lineItems
            .filter((item) => item.description !== "VAT (15%)")
            .map((item, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.cellDescription}>{item.description}</Text>
                <Text style={styles.cellQty}>{item.quantity}</Text>
                <Text style={styles.cellPrice}>{formatZar(item.unitPriceCents)}</Text>
                <Text style={styles.cellTotal}>{formatZar(item.totalCents)}</Text>
              </View>
            ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal (excl. VAT)</Text>
            <Text style={styles.totalsValue}>{formatZar(props.subtotalCents)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>VAT ({Math.round(props.vatRate * 100)}%)</Text>
            <Text style={styles.totalsValue}>{formatZar(props.vatCents)}</Text>
          </View>
          <View style={styles.totalsFinalRow}>
            <Text style={styles.totalsFinalLabel}>Total (incl. VAT)</Text>
            <Text style={styles.totalsFinalValue}>{formatZar(props.totalCents)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            ISU Technologies (Pty) Ltd | VAT Reg: TBD | ConformEdge Platform
          </Text>
          <Text style={styles.footerText}>
            Generated {new Date().toLocaleDateString("en-ZA")}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
