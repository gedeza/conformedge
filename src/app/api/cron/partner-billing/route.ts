import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generatePartnerInvoice } from "@/lib/billing/partner-billing"
import { sendPartnerEmail } from "@/lib/email"
import { captureError } from "@/lib/error-tracking"

const CRON_SECRET = process.env.CRON_SECRET

/** Grace period in days before a partner with unpaid invoices is suspended */
const PARTNER_OVERDUE_GRACE_DAYS = 15

const ERR_SRC = { source: "cron.partnerBilling" }

/**
 * GET /api/cron/partner-billing
 *
 * Monthly partner billing cron:
 * 1. Generate invoices for all active Consulting/White-Label partners
 * 2. Check for overdue invoices past grace period → suspend partner
 * 3. Send overdue reminders
 *
 * Run on 1st of each month. Secured by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: "Server misconfiguration: CRON_SECRET is not set" },
      { status: 503 }
    )
  }
  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  let invoicesGenerated = 0
  let overdueReminders = 0
  let partnersSuspended = 0
  const errors: string[] = []

  try {
    // ── 1. Generate invoices for active partners with clients ──
    const activePartners = await db.partner.findMany({
      where: {
        status: { in: ["APPROVED", "ACTIVE"] },
        tier: { in: ["CONSULTING", "WHITE_LABEL"] },
      },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        _count: { select: { clientOrganizations: { where: { isActive: true } } } },
      },
    })

    for (const partner of activePartners) {
      if (partner._count.clientOrganizations === 0) continue

      try {
        // Check if invoice already exists for this month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const existingInvoice = await db.partnerInvoice.findFirst({
          where: {
            partnerId: partner.id,
            periodStart: { gte: monthStart },
          },
        })

        if (existingInvoice) continue // Already invoiced this month

        const invoiceId = await generatePartnerInvoice(partner.id)
        if (invoiceId) {
          invoicesGenerated++

          if (partner.contactEmail) {
            sendPartnerEmail({
              to: partner.contactEmail,
              subject: `ConformEdge Partner Invoice — ${now.toLocaleString("en-ZA", { month: "long", year: "numeric" })}`,
              text: `Your monthly partner invoice has been generated. Please log in to your partner dashboard to view and settle the invoice.\n\nInvoice is due by the 15th of next month.`,
            })
          }
        }
      } catch (err) {
        const msg = `Invoice generation failed for partner ${partner.name}: ${err}`
        errors.push(msg)
        captureError(new Error(msg), ERR_SRC)
      }
    }

    // ── 2. Check for overdue invoices ──
    const graceCutoff = new Date(now.getTime() - PARTNER_OVERDUE_GRACE_DAYS * 24 * 60 * 60 * 1000)

    // Fetch overdue invoices with partner info via a join
    const overdueInvoices = await db.partnerInvoice.findMany({
      where: {
        status: { in: ["DRAFT", "OPEN"] },
        dueAt: { lt: now },
        paidAt: null,
      },
      include: {
        partner: {
          select: { id: true, name: true, contactEmail: true, status: true },
        },
      },
    })

    for (const invoice of overdueInvoices) {
      try {
        // Send overdue reminder
        if (invoice.partner.contactEmail) {
          sendPartnerEmail({
            to: invoice.partner.contactEmail,
            subject: `OVERDUE: ConformEdge Partner Invoice ${invoice.invoiceNumber}`,
            text: `Your partner invoice ${invoice.invoiceNumber} for R${(invoice.totalCents / 100).toFixed(2)} was due on ${invoice.dueAt.toLocaleDateString("en-ZA")} and remains unpaid.\n\nPlease settle this invoice to avoid service suspension.`,
          })
          overdueReminders++
        }

        // Suspend partner if invoice is past grace period
        if (invoice.dueAt < graceCutoff && invoice.partner.status === "ACTIVE") {
          await db.partner.update({
            where: { id: invoice.partner.id },
            data: { status: "SUSPENDED" },
          })
          partnersSuspended++

          if (invoice.partner.contactEmail) {
            sendPartnerEmail({
              to: invoice.partner.contactEmail,
              subject: `ConformEdge Partner Account Suspended — Unpaid Invoice`,
              text: `Your partner account has been suspended due to unpaid invoice ${invoice.invoiceNumber} (R${(invoice.totalCents / 100).toFixed(2)}).\n\nYour client organizations remain active, but you will not be able to manage them until the outstanding balance is settled.\n\nPlease contact us at support@conformedge.co.za to resolve this.`,
            })
          }

          console.log(`[partner-billing] Suspended partner ${invoice.partner.name} — overdue invoice ${invoice.invoiceNumber}`)
        }
      } catch (err) {
        const msg = `Overdue processing failed for invoice ${invoice.invoiceNumber}: ${err}`
        errors.push(msg)
        captureError(new Error(msg), ERR_SRC)
      }
    }
  } catch (err) {
    captureError(err instanceof Error ? err : new Error(String(err)), ERR_SRC)
    return NextResponse.json(
      { error: "Partner billing cron failed", details: String(err) },
      { status: 500 }
    )
  }

  const summary = {
    invoicesGenerated,
    overdueReminders,
    partnersSuspended,
    errors: errors.length,
    timestamp: now.toISOString(),
  }

  console.log("[partner-billing] Cron complete:", summary)
  return NextResponse.json(summary)
}
