import React from "react"
import { Document, Page, Text, View, Image } from "@react-pdf/renderer"
import {
  sharedStyles as s,
  colors,
  formatZarPdf,
  LOGO_PATH,
  type LineItem,
  type BankDetailsInfo,
} from "./shared-pdf-styles"

export interface ProformaInvoicePDFProps {
  invoiceNumber: string
  quotationNumber: string
  clientName: string
  clientCompany?: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  clientVatNumber?: string
  issuedDate: string
  invoicedDate: string
  lineItems: LineItem[]
  subtotalCents: number
  discountLabel?: string
  discountPercent?: number
  discountCents?: number
  vatCents: number
  totalCents: number
  vatRate: number
  depositPercent?: number
  depositCents?: number
  notes?: string
  bankDetails?: BankDetailsInfo
  companyName: string
  companyVat: string
  companyAddress: string
  companyEmail: string
  companyPhone: string
}

export function ProformaInvoicePDF(props: ProformaInvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <Image src={LOGO_PATH} style={s.logo} />
            <View>
              <Text style={s.brandName}>ConformEdge</Text>
              <Text style={s.brandTag}>AI-Powered ISO Compliance Management</Text>
            </View>
          </View>
          <View>
            <Text style={s.docLabel}>PROFORMA INVOICE</Text>
            <Text style={s.docNumber}>{props.invoiceNumber}</Text>
            <Text style={[s.docNumber, { marginTop: 2 }]}>
              Ref: {props.quotationNumber}
            </Text>
          </View>
        </View>

        {/* From / To */}
        <View style={s.infoRow}>
          <View style={s.infoBlock}>
            <Text style={s.infoTitle}>From</Text>
            <Text style={s.infoText}>{props.companyName}</Text>
            <Text style={s.infoText}>{props.companyAddress}</Text>
            <Text style={s.infoText}>{props.companyEmail}</Text>
            <Text style={s.infoText}>{props.companyPhone}</Text>
            {props.companyVat !== "TBD" && (
              <Text style={s.infoText}>VAT: {props.companyVat}</Text>
            )}
          </View>
          <View style={s.infoBlock}>
            <Text style={s.infoTitle}>To</Text>
            <Text style={s.infoText}>{props.clientName}</Text>
            {props.clientCompany && <Text style={s.infoText}>{props.clientCompany}</Text>}
            {props.clientAddress && <Text style={s.infoText}>{props.clientAddress}</Text>}
            {props.clientEmail && <Text style={s.infoText}>{props.clientEmail}</Text>}
            {props.clientPhone && <Text style={s.infoText}>{props.clientPhone}</Text>}
            {props.clientVatNumber && <Text style={s.infoText}>VAT: {props.clientVatNumber}</Text>}
          </View>
        </View>

        {/* Dates */}
        <View style={{ flexDirection: "row", marginBottom: 20, gap: 40 }}>
          <View>
            <Text style={s.infoTitle}>Original Quotation Date</Text>
            <Text style={s.infoText}>{props.issuedDate}</Text>
          </View>
          <View>
            <Text style={s.infoTitle}>Invoice Date</Text>
            <Text style={s.infoText}>{props.invoicedDate}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.cellDescription]}>Description</Text>
            <Text style={[s.tableHeaderText, s.cellQty]}>Qty</Text>
            <Text style={[s.tableHeaderText, s.cellPrice]}>Unit Price</Text>
            <Text style={[s.tableHeaderText, s.cellTotal]}>Total</Text>
          </View>
          {props.lineItems.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={s.cellDescription}>{item.description}</Text>
              <Text style={s.cellQty}>{item.quantity}</Text>
              <Text style={s.cellPrice}>{formatZarPdf(item.unitPriceCents)}</Text>
              <Text style={s.cellTotal}>{formatZarPdf(item.totalCents)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totalsRow}>
            <Text style={s.totalsLabel}>Subtotal</Text>
            <Text style={s.totalsValue}>{formatZarPdf(props.subtotalCents)}</Text>
          </View>
          {props.discountPercent && props.discountCents ? (
            <View style={s.totalsRow}>
              <Text style={[s.totalsLabel, { color: colors.green }]}>
                {props.discountLabel || `Discount (${props.discountPercent}%)`}
              </Text>
              <Text style={[s.totalsValue, { color: colors.green }]}>
                -{formatZarPdf(props.discountCents)}
              </Text>
            </View>
          ) : null}
          <View style={s.totalsRow}>
            <Text style={s.totalsLabel}>VAT ({Math.round(props.vatRate * 100)}%)</Text>
            <Text style={s.totalsValue}>{formatZarPdf(props.vatCents)}</Text>
          </View>
          <View style={s.totalsFinalRow}>
            <Text style={s.totalsFinalLabel}>Total (incl. VAT)</Text>
            <Text style={s.totalsFinalValue}>{formatZarPdf(props.totalCents)}</Text>
          </View>
        </View>

        {/* Deposit */}
        {props.depositPercent && props.depositCents && (
          <View style={s.depositSection}>
            <Text style={s.depositLabel}>
              Deposit Required ({props.depositPercent}%)
            </Text>
            <Text style={s.depositValue}>{formatZarPdf(props.depositCents)}</Text>
          </View>
        )}

        {/* Bank Details */}
        {props.bankDetails && (
          <View style={s.bankSection}>
            <Text style={s.bankTitle}>Banking Details for EFT Payment</Text>
            <View style={s.bankRow}>
              <Text style={s.bankLabel}>Bank:</Text>
              <Text style={s.bankValue}>{props.bankDetails.bankName}</Text>
            </View>
            <View style={s.bankRow}>
              <Text style={s.bankLabel}>Account Name:</Text>
              <Text style={s.bankValue}>{props.bankDetails.accountName}</Text>
            </View>
            <View style={s.bankRow}>
              <Text style={s.bankLabel}>Account No:</Text>
              <Text style={s.bankValue}>{props.bankDetails.accountNumber}</Text>
            </View>
            <View style={s.bankRow}>
              <Text style={s.bankLabel}>Branch Code:</Text>
              <Text style={s.bankValue}>{props.bankDetails.branchCode}</Text>
            </View>
            <View style={s.bankRow}>
              <Text style={s.bankLabel}>Reference:</Text>
              <Text style={s.bankValue}>{props.bankDetails.reference}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {props.notes && (
          <View style={s.notesSection}>
            <Text style={s.notesTitle}>Notes</Text>
            <Text style={s.notesText}>{props.notes}</Text>
          </View>
        )}

        {/* Terms */}
        <View style={s.termsSection}>
          <Text style={s.termsTitle}>Terms & Conditions</Text>
          <Text style={s.termsText}>1. This is a proforma invoice and is not a demand for payment.</Text>
          <Text style={s.termsText}>2. All amounts are in South African Rand (ZAR) and include VAT at 15%.</Text>
          {props.depositPercent && (
            <Text style={s.termsText}>
              3. A deposit of {props.depositPercent}% is required before commencement of services.
            </Text>
          )}
          <Text style={s.termsText}>
            {props.depositPercent ? "4" : "3"}. Please use the reference number provided when making payment.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {props.companyName} | VAT: {props.companyVat} | {props.companyEmail}
          </Text>
          <Text style={s.footerText}>
            Generated {new Date().toLocaleDateString("en-ZA")}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
