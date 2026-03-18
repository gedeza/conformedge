"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { logAdminAction } from "@/lib/admin-audit"
import { z } from "zod"
import { VAT_RATE } from "@/lib/billing/plans"
import type { ActionResult } from "@/types"

// ── Zod Schemas ────────────────────────────────

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().min(1),
  unitPriceCents: z.coerce.number().int().min(0),
  totalCents: z.coerce.number().int().min(0),
})

const quotationFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientCompany: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  clientVatNumber: z.string().optional(),
  clientRegNumber: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  depositPercent: z.coerce.number().int().min(0).max(100).optional(),
  validityDays: z.coerce.number().int().min(1).default(30),
  notes: z.string().optional(),
  terms: z.string().optional(),
})

export type QuotationFormData = z.infer<typeof quotationFormSchema>

// ── Helpers ────────────────────────────────────

async function generateQuotationNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `QT-${year}-`
  const count = await db.quotation.count({
    where: { quotationNumber: { startsWith: prefix } },
  })
  return `${prefix}${String(count + 1).padStart(4, "0")}`
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `INV-${year}-`
  const count = await db.quotation.count({
    where: { invoiceNumber: { startsWith: prefix } },
  })
  return `${prefix}${String(count + 1).padStart(4, "0")}`
}

function calculateTotals(lineItems: { totalCents: number }[], depositPercent?: number) {
  const subtotalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0)
  const vatCents = Math.round(subtotalCents * VAT_RATE)
  const totalCents = subtotalCents + vatCents
  const depositCents = depositPercent
    ? Math.round(totalCents * (depositPercent / 100))
    : undefined
  return { subtotalCents, vatCents, totalCents, depositCents }
}

// ── Actions ────────────────────────────────────

export async function getAdminQuotations(params?: { status?: string }) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  const where: Record<string, unknown> = {}
  if (params?.status) where.status = params.status

  return db.quotation.findMany({
    where,
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function getAdminQuotationDetail(id: string) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  return db.quotation.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  })
}

export async function createQuotation(data: QuotationFormData): Promise<ActionResult & { id?: string }> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const parsed = quotationFormSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { lineItems, depositPercent, validityDays, ...rest } = parsed.data
    const computedItems = lineItems.map((item) => ({
      ...item,
      totalCents: item.quantity * item.unitPriceCents,
    }))
    const { subtotalCents, vatCents, totalCents, depositCents } = calculateTotals(computedItems, depositPercent)
    const quotationNumber = await generateQuotationNumber()

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + validityDays)

    const quotation = await db.quotation.create({
      data: {
        quotationNumber,
        clientName: rest.clientName,
        clientCompany: rest.clientCompany || null,
        clientEmail: rest.clientEmail || null,
        clientPhone: rest.clientPhone || null,
        clientAddress: rest.clientAddress || null,
        clientVatNumber: rest.clientVatNumber || null,
        clientRegNumber: rest.clientRegNumber || null,
        subtotalCents,
        vatCents,
        totalCents,
        depositPercent: depositPercent ?? null,
        depositCents: depositCents ?? null,
        lineItems: computedItems,
        validUntil,
        notes: rest.notes || null,
        terms: rest.terms || null,
        createdById: ctx.dbUserId,
      },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "CREATE_QUOTATION",
      targetType: "Quotation",
      targetId: quotation.id,
      metadata: { quotationNumber, totalCents },
    })

    revalidatePath("/admin/quotations")
    return { success: true, id: quotation.id }
  } catch (err) {
    console.error("createQuotation error:", err)
    return { success: false, error: "Failed to create quotation" }
  }
}

export async function updateQuotation(
  id: string,
  data: QuotationFormData
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const existing = await db.quotation.findUnique({ where: { id }, select: { status: true } })
    if (!existing) return { success: false, error: "Quotation not found" }
    if (existing.status !== "DRAFT") return { success: false, error: "Only draft quotations can be edited" }

    const parsed = quotationFormSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { lineItems, depositPercent, validityDays, ...rest } = parsed.data
    const computedItems = lineItems.map((item) => ({
      ...item,
      totalCents: item.quantity * item.unitPriceCents,
    }))
    const { subtotalCents, vatCents, totalCents, depositCents } = calculateTotals(computedItems, depositPercent)

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + validityDays)

    await db.quotation.update({
      where: { id },
      data: {
        clientName: rest.clientName,
        clientCompany: rest.clientCompany || null,
        clientEmail: rest.clientEmail || null,
        clientPhone: rest.clientPhone || null,
        clientAddress: rest.clientAddress || null,
        clientVatNumber: rest.clientVatNumber || null,
        clientRegNumber: rest.clientRegNumber || null,
        subtotalCents,
        vatCents,
        totalCents,
        depositPercent: depositPercent ?? null,
        depositCents: depositCents ?? null,
        lineItems: computedItems,
        validUntil,
        notes: rest.notes || null,
        terms: rest.terms || null,
      },
    })

    revalidatePath("/admin/quotations")
    revalidatePath(`/admin/quotations/${id}`)
    return { success: true }
  } catch (err) {
    console.error("updateQuotation error:", err)
    return { success: false, error: "Failed to update quotation" }
  }
}

export async function sendQuotation(id: string): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const q = await db.quotation.findUnique({ where: { id }, select: { status: true } })
    if (!q) return { success: false, error: "Quotation not found" }
    if (q.status !== "DRAFT") return { success: false, error: "Only draft quotations can be sent" }

    await db.quotation.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date() },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "SEND_QUOTATION",
      targetType: "Quotation",
      targetId: id,
    })

    revalidatePath("/admin/quotations")
    revalidatePath(`/admin/quotations/${id}`)
    return { success: true }
  } catch (err) {
    console.error("sendQuotation error:", err)
    return { success: false, error: "Failed to send quotation" }
  }
}

export async function acceptQuotation(id: string): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const q = await db.quotation.findUnique({ where: { id }, select: { status: true } })
    if (!q) return { success: false, error: "Quotation not found" }
    if (q.status !== "SENT") return { success: false, error: "Only sent quotations can be accepted" }

    await db.quotation.update({
      where: { id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "ACCEPT_QUOTATION",
      targetType: "Quotation",
      targetId: id,
    })

    revalidatePath("/admin/quotations")
    revalidatePath(`/admin/quotations/${id}`)
    return { success: true }
  } catch (err) {
    console.error("acceptQuotation error:", err)
    return { success: false, error: "Failed to accept quotation" }
  }
}

export async function declineQuotation(id: string): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const q = await db.quotation.findUnique({ where: { id }, select: { status: true } })
    if (!q) return { success: false, error: "Quotation not found" }
    if (q.status !== "SENT") return { success: false, error: "Only sent quotations can be declined" }

    await db.quotation.update({
      where: { id },
      data: { status: "DECLINED", declinedAt: new Date() },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "DECLINE_QUOTATION",
      targetType: "Quotation",
      targetId: id,
    })

    revalidatePath("/admin/quotations")
    revalidatePath(`/admin/quotations/${id}`)
    return { success: true }
  } catch (err) {
    console.error("declineQuotation error:", err)
    return { success: false, error: "Failed to decline quotation" }
  }
}

export async function convertToInvoice(id: string, customInvoiceNumber?: string): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const q = await db.quotation.findUnique({ where: { id }, select: { status: true } })
    if (!q) return { success: false, error: "Quotation not found" }
    if (q.status !== "ACCEPTED") return { success: false, error: "Only accepted quotations can be converted to invoices" }

    // Use custom invoice number if provided, otherwise auto-generate
    let invoiceNumber: string
    if (customInvoiceNumber && customInvoiceNumber.trim()) {
      // Check uniqueness
      const existing = await db.quotation.findUnique({ where: { invoiceNumber: customInvoiceNumber.trim() } })
      if (existing) return { success: false, error: `Invoice number ${customInvoiceNumber.trim()} already exists` }
      invoiceNumber = customInvoiceNumber.trim()
    } else {
      invoiceNumber = await generateInvoiceNumber()
    }

    await db.quotation.update({
      where: { id },
      data: { status: "INVOICED", invoiceNumber, invoicedAt: new Date() },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "CONVERT_QUOTATION_TO_INVOICE",
      targetType: "Quotation",
      targetId: id,
      metadata: { invoiceNumber },
    })

    revalidatePath("/admin/quotations")
    revalidatePath(`/admin/quotations/${id}`)
    return { success: true }
  } catch (err) {
    console.error("convertToInvoice error:", err)
    return { success: false, error: "Failed to convert to invoice" }
  }
}

export async function markQuotationPaid(id: string, bankReference?: string): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const q = await db.quotation.findUnique({ where: { id }, select: { status: true } })
    if (!q) return { success: false, error: "Quotation not found" }
    if (q.status !== "INVOICED") return { success: false, error: "Only invoiced quotations can be marked as paid" }

    await db.quotation.update({
      where: { id },
      data: {
        paidAt: new Date(),
        ...(bankReference && { bankReference }),
      },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "MARK_QUOTATION_PAID",
      targetType: "Quotation",
      targetId: id,
      metadata: { bankReference: bankReference ?? null },
    })

    revalidatePath("/admin/quotations")
    revalidatePath(`/admin/quotations/${id}`)
    return { success: true }
  } catch (err) {
    console.error("markQuotationPaid error:", err)
    return { success: false, error: "Failed to mark as paid" }
  }
}

export async function deleteQuotation(id: string): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const q = await db.quotation.findUnique({ where: { id }, select: { status: true } })
    if (!q) return { success: false, error: "Quotation not found" }
    if (q.status !== "DRAFT") return { success: false, error: "Only draft quotations can be deleted" }

    await db.quotation.delete({ where: { id } })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "DELETE_QUOTATION",
      targetType: "Quotation",
      targetId: id,
    })

    revalidatePath("/admin/quotations")
    return { success: true }
  } catch (err) {
    console.error("deleteQuotation error:", err)
    return { success: false, error: "Failed to delete quotation" }
  }
}

// Re-export types used by UI
export type QuotationListItem = Awaited<ReturnType<typeof getAdminQuotations>>[number]
export type QuotationDetail = NonNullable<Awaited<ReturnType<typeof getAdminQuotationDetail>>>
