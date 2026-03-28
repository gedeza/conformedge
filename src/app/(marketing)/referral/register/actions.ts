"use server"

import { z } from "zod/v4"
import { db } from "@/lib/db"
import { PARTNER_BASE_FEES } from "@/lib/constants"
import type { ActionResult } from "@/types"

const registerReferralSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(200),
  email: z.email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required").max(20),
  company: z.string().max(200).optional(),
  idNumber: z.string().max(20).optional(),
  bankName: z.string().min(2, "Bank name is required").max(100),
  accountHolder: z.string().min(2, "Account holder name is required").max(200),
  accountNumber: z.string().min(5, "Account number is required").max(30),
  branchCode: z.string().min(3, "Branch code is required").max(10),
  accountType: z.enum(["CHEQUE", "SAVINGS"]),
})

export type RegisterReferralInput = z.infer<typeof registerReferralSchema>

export async function registerReferralPartner(
  values: RegisterReferralInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = registerReferralSchema.parse(values)

    // Check if email already registered
    const existing = await db.partner.findFirst({
      where: { contactEmail: parsed.email },
    })
    if (existing) {
      return { success: false, error: "This email is already registered as a partner. Please contact us if you need assistance." }
    }

    // Generate slug from name
    const baseSlug = parsed.fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50)

    // Ensure slug uniqueness
    let slug = baseSlug
    let attempt = 0
    while (await db.partner.findUnique({ where: { slug } })) {
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const partner = await db.partner.create({
      data: {
        name: parsed.company || parsed.fullName,
        slug,
        tier: "REFERRAL",
        status: "APPLIED",
        contactEmail: parsed.email,
        contactPhone: parsed.phone,
        registrationNumber: parsed.idNumber || null,
        description: `Referral partner registration: ${parsed.fullName}`,
        basePlatformFeeCents: PARTNER_BASE_FEES.REFERRAL,
        commissionPercent: 10,
        bankName: parsed.bankName,
        bankAccountHolder: parsed.accountHolder,
        bankAccountNumber: parsed.accountNumber,
        bankBranchCode: parsed.branchCode,
        bankAccountType: parsed.accountType,
        notes: `Full name: ${parsed.fullName}`,
      },
    })

    return { success: true, data: { id: partner.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Invalid input" }
    }
    console.error("Referral registration error:", err)
    return { success: false, error: "Registration failed. Please try again or contact us." }
  }
}
