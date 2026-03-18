import path from "path"
import { StyleSheet } from "@react-pdf/renderer"

export const LOGO_PATH = path.join(process.cwd(), "public/images/logo-icon.png")

export const colors = {
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

export const sharedStyles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 80,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.textDark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 40,
    height: 40,
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
  docLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "right",
  },
  docNumber: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: 2,
  },
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
  // Bank details
  bankSection: {
    marginTop: 25,
    padding: 12,
    backgroundColor: colors.bgLight,
    borderRadius: 4,
    border: `1px solid ${colors.border}`,
  },
  bankTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
    textTransform: "uppercase" as const,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  bankRow: {
    flexDirection: "row" as const,
    marginBottom: 2,
  },
  bankLabel: {
    width: 100,
    fontSize: 9,
    color: colors.textMuted,
  },
  bankValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.textDark,
  },
  // Notes
  notesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.bgLight,
    borderRadius: 4,
    border: `1px solid ${colors.border}`,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
    textTransform: "uppercase" as const,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 9,
    color: colors.textDark,
    lineHeight: 1.4,
  },
  // Terms
  termsSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: `1px solid ${colors.border}`,
  },
  termsTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.textMuted,
    textTransform: "uppercase" as const,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 8,
    color: colors.textMuted,
    lineHeight: 1.4,
    marginBottom: 2,
  },
  // Deposit highlight
  depositSection: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
    border: "1px solid #f59e0b",
    alignItems: "flex-end" as const,
  },
  depositLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#92400e",
  },
  depositValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400e",
    marginTop: 2,
  },
  // Footer
  footer: {
    position: "absolute" as const,
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 10,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },
})

export function formatZarPdf(cents: number): string {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export interface LineItem {
  description: string
  quantity: number
  unitPriceCents: number
  totalCents: number
}

export interface BankDetailsInfo {
  bankName: string
  accountName: string
  accountNumber: string
  branchCode: string
  reference: string
}
