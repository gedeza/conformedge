import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { format } from "date-fns"
import React from "react"
import { db } from "@/lib/db"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { QuotationPDF } from "@/lib/pdf/quotation-pdf"
import { ProformaInvoicePDF } from "@/lib/pdf/proforma-invoice-pdf"
import { ISU_TECH_DETAILS } from "@/lib/constants"
import { VAT_RATE } from "@/lib/billing/plans"
import { captureError } from "@/lib/error-tracking"
import type { LineItem } from "@/lib/pdf/shared-pdf-styles"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const quotation = await db.quotation.findUnique({ where: { id } })
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    const lineItems = quotation.lineItems as unknown as LineItem[]
    const company = ISU_TECH_DETAILS

    // Bank details from env
    const bankDetails = process.env.BANK_ACCOUNT_NUMBER
      ? {
          bankName: process.env.BANK_NAME ?? "Capitec Business",
          accountName: process.env.BANK_ACCOUNT_NAME ?? "Ticamark (PTY) LTD t/a iSu Technologies",
          accountNumber: process.env.BANK_ACCOUNT_NUMBER,
          branchCode: process.env.BANK_BRANCH_CODE ?? "450105",
          reference: quotation.invoiceNumber ?? quotation.quotationNumber,
        }
      : undefined

    let pdfElement: React.ReactElement
    let filename: string

    if (quotation.status === "INVOICED" && quotation.invoiceNumber) {
      // Render Proforma Invoice
      pdfElement = React.createElement(ProformaInvoicePDF, {
        invoiceNumber: quotation.invoiceNumber,
        quotationNumber: quotation.quotationNumber,
        clientName: quotation.clientName,
        clientCompany: quotation.clientCompany ?? undefined,
        clientEmail: quotation.clientEmail ?? undefined,
        clientPhone: quotation.clientPhone ?? undefined,
        clientAddress: quotation.clientAddress ?? undefined,
        clientVatNumber: quotation.clientVatNumber ?? undefined,
        issuedDate: format(quotation.issuedAt, "dd MMM yyyy"),
        invoicedDate: format(quotation.invoicedAt!, "dd MMM yyyy"),
        lineItems,
        subtotalCents: quotation.subtotalCents,
        discountLabel: quotation.discountLabel ?? undefined,
        discountCents: quotation.discountCents ?? undefined,
        vatCents: quotation.vatCents,
        totalCents: quotation.totalCents,
        vatRate: VAT_RATE,
        depositPercent: quotation.depositPercent ?? undefined,
        depositCents: quotation.depositCents ?? undefined,
        notes: quotation.notes ?? undefined,
        bankDetails,
        companyName: company.companyName,
        companyVat: company.vatNumber,
        companyAddress: company.address,
        companyEmail: company.email,
        companyPhone: company.phone,
      })
      filename = `ConformEdge-Proforma-${quotation.invoiceNumber}.pdf`
    } else {
      // Render Quotation
      pdfElement = React.createElement(QuotationPDF, {
        quotationNumber: quotation.quotationNumber,
        clientName: quotation.clientName,
        clientCompany: quotation.clientCompany ?? undefined,
        clientEmail: quotation.clientEmail ?? undefined,
        clientPhone: quotation.clientPhone ?? undefined,
        clientAddress: quotation.clientAddress ?? undefined,
        clientVatNumber: quotation.clientVatNumber ?? undefined,
        issuedDate: format(quotation.issuedAt, "dd MMM yyyy"),
        validUntil: format(quotation.validUntil, "dd MMM yyyy"),
        lineItems,
        subtotalCents: quotation.subtotalCents,
        discountLabel: quotation.discountLabel ?? undefined,
        discountCents: quotation.discountCents ?? undefined,
        vatCents: quotation.vatCents,
        totalCents: quotation.totalCents,
        vatRate: VAT_RATE,
        depositPercent: quotation.depositPercent ?? undefined,
        depositCents: quotation.depositCents ?? undefined,
        notes: quotation.notes ?? undefined,
        terms: quotation.terms ?? undefined,
        companyName: company.companyName,
        companyVat: company.vatNumber,
        companyAddress: company.address,
        companyEmail: company.email,
        companyPhone: company.phone,
      })
      filename = `ConformEdge-Quotation-${quotation.quotationNumber}.pdf`
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(pdfElement as any)
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    captureError(error, { source: "api.quotationPdf" })
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
