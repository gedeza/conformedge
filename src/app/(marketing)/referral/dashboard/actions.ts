"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { addDays } from "date-fns"
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

// ─────────────────────────────────────────────
// GENERATE / RENEW REFERRAL LINK
// ─────────────────────────────────────────────

export async function generateReferralLinkSelfService(
  token: string
): Promise<ActionResult<{ code: string; url: string }>> {
  try {
    const partner = await getPartnerByToken(token)
    if (!partner) return { success: false, error: "Invalid access token" }
    if (partner.tier !== "REFERRAL") return { success: false, error: "Not a referral partner" }
    if (partner.status !== "ACTIVE") return { success: false, error: "Partner account is not active" }

    // Check for existing active link
    const activeLink = await db.referral.findFirst({
      where: {
        partnerId: partner.id,
        status: { in: ["PENDING", "CLICKED"] },
        expiresAt: { gt: new Date() },
      },
    })
    if (activeLink) {
      return { success: false, error: "You already have an active referral link. Wait for it to expire or be used before generating a new one." }
    }

    // Generate unique code
    const randomPart = Math.random().toString(36).slice(2, 8)
    const code = `${partner.slug}-${randomPart}`
    const expiresAt = addDays(new Date(), 90)

    await db.referral.create({
      data: {
        partnerId: partner.id,
        code,
        commissionPercent: partner.commissionPercent,
        expiresAt,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"
    revalidatePath("/referral/dashboard")
    return { success: true, data: { code, url: `${appUrl}/ref/${code}` } }
  } catch (err) {
    console.error("generateReferralLinkSelfService error:", err)
    return { success: false, error: "Failed to generate referral link" }
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
// UPDATE BANK DETAILS
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
