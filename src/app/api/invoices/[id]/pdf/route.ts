import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { format } from "date-fns"
import React from "react"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { InvoicePDF, type InvoiceLineItem } from "@/lib/pdf/invoice-pdf"
import { VAT_RATE } from "@/lib/billing/plans"
import { captureError } from "@/lib/error-tracking"

/**
 * GET /api/invoices/[id]/pdf
 *
 * Generate and download a VAT-compliant invoice PDF.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbOrgId } = await getAuthContext()
    const { id } = await params

    const invoice = await db.invoice.findFirst({
      where: { id, organizationId: dbOrgId },
      include: {
        organization: { select: { name: true } },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const lineItems = (invoice.lineItems as unknown as InvoiceLineItem[]) ?? []

    const pdfElement = React.createElement(InvoicePDF, {
      invoiceId: invoice.id,
      organizationName: invoice.organization.name,
      status: invoice.status,
      issuedDate: format(invoice.createdAt, "dd MMM yyyy"),
      dueDate: format(invoice.dueAt, "dd MMM yyyy"),
      paidDate: invoice.paidAt ? format(invoice.paidAt, "dd MMM yyyy") : undefined,
      periodStart: format(invoice.periodStart, "dd MMM yyyy"),
      periodEnd: format(invoice.periodEnd, "dd MMM yyyy"),
      lineItems,
      subtotalCents: invoice.amountCents,
      vatCents: invoice.vatCents,
      totalCents: invoice.totalCents,
      vatRate: VAT_RATE,
      paymentReference: invoice.externalPaymentId ?? undefined,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(pdfElement as any)
    const uint8 = new Uint8Array(buffer)

    const dateStr = format(invoice.createdAt, "yyyy-MM-dd")
    const filename = `ConformEdge-Invoice-${invoice.id.slice(0, 8)}-${dateStr}.pdf`

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    captureError(error, { source: "api.invoicePdf" })
    return NextResponse.json({ error: "Failed to generate invoice PDF" }, { status: 500 })
  }
}
