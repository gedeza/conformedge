"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { sendPartnerEmail } from "@/lib/email"
import type { ActionResult } from "@/types"

// ─────────────────────────────────────────────
// TOKEN AUTH HELPER
// ─────────────────────────────────────────────

async function getPartnerByToken(token: string) {
  if (!token) return null
  return db.partner.findUnique({
    where: { accessToken: token },
    select: {
      id: true,
      name: true,
      slug: true,
      tier: true,
      status: true,
      contactEmail: true,
      contactPhone: true,
      commissionPercent: true,
      bankName: true,
      bankAccountHolder: true,
      bankAccountNumber: true,
      bankBranchCode: true,
      bankAccountType: true,
    },
  })
}

const ADMIN_EMAIL = process.env.COMPANY_EMAIL ?? "nhlanhla@isutech.co.za"

// ─────────────────────────────────────────────
// REQUEST LINK RENEWAL (admin-controlled)
// ─────────────────────────────────────────────

export async function requestLinkRenewal(
  token: string
): Promise<ActionResult> {
  try {
    const partner = await getPartnerByToken(token)
    if (!partner) return { success: false, error: "Invalid access token" }
    if (partner.tier !== "REFERRAL") return { success: false, error: "Not a referral partner" }
    if (partner.status !== "ACTIVE") return { success: false, error: "Partner account is not active" }

    // Check if they already have an active link
    const activeLink = await db.referral.findFirst({
      where: {
        partnerId: partner.id,
        status: { in: ["PENDING", "CLICKED"] },
        expiresAt: { gt: new Date() },
      },
    })
    if (activeLink) {
      return { success: false, error: "You already have an active referral link." }
    }

    // Notify admin
    sendPartnerEmail({
      to: ADMIN_EMAIL,
      subject: `[ConformEdge] Referral Link Renewal Request — ${partner.name}`,
      text: [
        `Referral partner "${partner.name}" has requested a new referral link.`,
        "",
        `Partner: ${partner.name}`,
        `Email: ${partner.contactEmail}`,
        `Phone: ${partner.contactPhone || "N/A"}`,
        "",
        "Their previous link has expired. Please review and renew from the admin panel:",
        `${process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"}/admin/referrals`,
        "",
        "— ConformEdge System",
      ].join("\n"),
    })

    return { success: true }
  } catch (err) {
    console.error("requestLinkRenewal error:", err)
    return { success: false, error: "Failed to submit renewal request" }
  }
}

// ─────────────────────────────────────────────
// UPDATE PROFILE (CONTACT INFO)
// ─────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  contactEmail: z.email("Valid email required"),
  contactPhone: z.string().min(10, "Phone number is required").max(20),
})

export async function updatePartnerProfile(
  token: string,
  values: z.infer<typeof updateProfileSchema>
): Promise<ActionResult> {
  try {
    const partner = await getPartnerByToken(token)
    if (!partner) return { success: false, error: "Invalid access token" }
    if (partner.status !== "ACTIVE") return { success: false, error: "Partner account is not active" }

    const parsed = updateProfileSchema.parse(values)

    // Check email uniqueness (exclude self)
    if (parsed.contactEmail !== partner.contactEmail) {
      const emailTaken = await db.partner.findFirst({
        where: { contactEmail: parsed.contactEmail, id: { not: partner.id } },
      })
      if (emailTaken) return { success: false, error: "This email is already registered to another partner" }
    }

    await db.partner.update({
      where: { id: partner.id },
      data: {
        name: parsed.name,
        contactEmail: parsed.contactEmail,
        contactPhone: parsed.contactPhone,
      },
    })

    revalidatePath("/referral/dashboard")
    return { success: true }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Invalid input" }
    }
    console.error("updatePartnerProfile error:", err)
    return { success: false, error: "Failed to update profile" }
  }
}

// ─────────────────────────────────────────────
// REQUEST BANK DETAILS CHANGE (admin notified)
// ─────────────────────────────────────────────

const updateBankSchema = z.object({
  bankName: z.string().min(2, "Bank name is required").max(100),
  bankAccountHolder: z.string().min(2, "Account holder is required").max(200),
  bankAccountNumber: z.string().min(5, "Account number is required").max(30),
  bankBranchCode: z.string().min(3, "Branch code is required").max(10),
  bankAccountType: z.enum(["CHEQUE", "SAVINGS"]),
})

export async function updatePartnerBankDetails(
  token: string,
  values: z.infer<typeof updateBankSchema>
): Promise<ActionResult> {
  try {
    const partner = await getPartnerByToken(token)
    if (!partner) return { success: false, error: "Invalid access token" }
    if (partner.status !== "ACTIVE") return { success: false, error: "Partner account is not active" }

    const parsed = updateBankSchema.parse(values)

    // Build change summary for admin notification
    const changes: string[] = []
    if (partner.bankName !== parsed.bankName) changes.push(`Bank: ${partner.bankName || "—"} → ${parsed.bankName}`)
    if (partner.bankAccountHolder !== parsed.bankAccountHolder) changes.push(`Account Holder: ${partner.bankAccountHolder || "—"} → ${parsed.bankAccountHolder}`)
    if (partner.bankAccountNumber !== parsed.bankAccountNumber) changes.push(`Account Number: ${partner.bankAccountNumber || "—"} → ${parsed.bankAccountNumber}`)
    if (partner.bankBranchCode !== parsed.bankBranchCode) changes.push(`Branch Code: ${partner.bankBranchCode || "—"} → ${parsed.bankBranchCode}`)
    if (partner.bankAccountType !== parsed.bankAccountType) changes.push(`Account Type: ${partner.bankAccountType || "—"} → ${parsed.bankAccountType}`)

    if (changes.length === 0) {
      return { success: true } // No actual changes
    }

    // Update bank details
    await db.partner.update({
      where: { id: partner.id },
      data: {
        bankName: parsed.bankName,
        bankAccountHolder: parsed.bankAccountHolder,
        bankAccountNumber: parsed.bankAccountNumber,
        bankBranchCode: parsed.bankBranchCode,
        bankAccountType: parsed.bankAccountType,
      },
    })

    // Notify admin of bank details change
    sendPartnerEmail({
      to: ADMIN_EMAIL,
      subject: `[ConformEdge] Bank Details Changed — ${partner.name}`,
      text: [
        `Referral partner "${partner.name}" has updated their bank details.`,
        "",
        "Changes:",
        ...changes.map((c) => `  • ${c}`),
        "",
        `Partner: ${partner.name}`,
        `Email: ${partner.contactEmail}`,
        "",
        "Please verify these details before the next commission payout.",
        `Admin panel: ${process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"}/admin/partners`,
        "",
        "— ConformEdge System",
      ].join("\n"),
    })

    revalidatePath("/referral/dashboard")
    return { success: true }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Invalid input" }
    }
    console.error("updatePartnerBankDetails error:", err)
    return { success: false, error: "Failed to update bank details" }
  }
}
