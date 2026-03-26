"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { logAdminAction } from "@/lib/admin-audit"
import type { ActionResult } from "@/types"

export async function getAdminInvoices(params?: {
  status?: string
  paymentMethod?: string
}) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  const where: Record<string, unknown> = {}

  if (params?.status) {
    where.status = params.status
  }

  // Filter by payment method: join through org's subscription
  if (params?.paymentMethod) {
    where.organization = {
      subscription: {
        paymentMethod: params.paymentMethod,
      },
    }
  }

  return db.invoice.findMany({
    where,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          subscription: {
            select: { paymentMethod: true, paymentTermsDays: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function getAdminInvoiceDetail(invoiceId: string) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  return db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          subscription: {
            select: { plan: true, billingCycle: true, paymentMethod: true, paymentTermsDays: true },
          },
        },
      },
      accountTransactions: {
        select: { id: true, type: true, amountCents: true, description: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })
}

export async function adminMarkInvoicePaid(
  invoiceId: string,
  bankReference?: string
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, status: true, organizationId: true, totalCents: true },
    })
    if (!invoice) return { success: false, error: "Invoice not found" }
    if (invoice.status === "PAID") return { success: false, error: "Invoice is already paid" }

    const now = new Date()

    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAt: now,
        ...(bankReference && { bankReference }),
      },
    })

    // Auto-activate subscription if it's not currently active
    // This is critical for EFT/INVOICE clients where payment confirmation is manual
    const sub = await db.subscription.findUnique({
      where: { organizationId: invoice.organizationId },
    })
    if (sub && !["ACTIVE", "TRIALING"].includes(sub.status)) {
      const periodEnd = sub.billingCycle === "ANNUAL"
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

      await db.subscription.update({
        where: { organizationId: invoice.organizationId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          gracePeriodEndsAt: null,
          trialEndsAt: null,
        },
      })

      logAdminAction({
        adminUserId: ctx.dbUserId,
        action: "SUBSCRIPTION_AUTO_ACTIVATED",
        targetType: "Subscription",
        targetId: sub.id,
        metadata: { trigger: "invoice_paid", invoiceId, previousStatus: sub.status },
        organizationId: invoice.organizationId,
      })
    }

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "MARK_INVOICE_PAID",
      targetType: "Invoice",
      targetId: invoiceId,
      metadata: { bankReference: bankReference ?? null, totalCents: invoice.totalCents },
      organizationId: invoice.organizationId,
    })

    revalidatePath("/admin/invoices")
    revalidatePath(`/admin/organizations/${invoice.organizationId}`)
    return { success: true }
  } catch (err) {
    console.error("adminMarkInvoicePaid error:", err)
    return { success: false, error: "Failed to mark invoice as paid" }
  }
}
