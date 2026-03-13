"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getSuperAdminContext } from "@/lib/admin-auth"
import type { ActionResult } from "@/types"

// ─────────────────────────────────────────────
// LIST ALL VERSIONS
// ─────────────────────────────────────────────

export async function getTermsVersions() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  return db.termsVersion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { acceptances: true } },
    },
  })
}

// ─────────────────────────────────────────────
// GET SINGLE VERSION WITH STATS
// ─────────────────────────────────────────────

export async function getTermsVersion(id: string) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  return db.termsVersion.findUnique({
    where: { id },
    include: {
      _count: { select: { acceptances: true } },
    },
  })
}

export async function getTermsAcceptanceStats(versionId: string) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  const [totalUsers, acceptedCount, recentAcceptances] = await Promise.all([
    db.user.count(),
    db.termsAcceptance.count({ where: { versionId } }),
    db.termsAcceptance.findMany({
      where: { versionId },
      orderBy: { acceptedAt: "desc" },
      take: 10,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
  ])

  return { totalUsers, acceptedCount, recentAcceptances }
}

// ─────────────────────────────────────────────
// CREATE DRAFT
// ─────────────────────────────────────────────

const createSchema = z.object({
  version: z.string().min(1, "Version is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  summary: z.string().optional(),
  effectiveAt: z.coerce.date(),
})

export async function createTermsVersion(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const parsed = createSchema.safeParse({
    version: formData.get("version"),
    title: formData.get("title"),
    content: formData.get("content"),
    summary: formData.get("summary"),
    effectiveAt: formData.get("effectiveAt"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" }
  }

  // Check version uniqueness
  const existing = await db.termsVersion.findUnique({
    where: { version: parsed.data.version },
  })
  if (existing) {
    return { success: false, error: `Version "${parsed.data.version}" already exists` }
  }

  const version = await db.termsVersion.create({
    data: {
      version: parsed.data.version,
      title: parsed.data.title,
      content: parsed.data.content,
      summary: parsed.data.summary || null,
      effectiveAt: parsed.data.effectiveAt,
    },
  })

  revalidatePath("/admin/terms")
  return { success: true, data: { id: version.id } }
}

// ─────────────────────────────────────────────
// UPDATE DRAFT
// ─────────────────────────────────────────────

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
})

export async function updateTermsVersion(formData: FormData): Promise<ActionResult> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    version: formData.get("version"),
    title: formData.get("title"),
    content: formData.get("content"),
    summary: formData.get("summary"),
    effectiveAt: formData.get("effectiveAt"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" }
  }

  const existing = await db.termsVersion.findUnique({ where: { id: parsed.data.id } })
  if (!existing) return { success: false, error: "Version not found" }
  if (existing.status !== "DRAFT") return { success: false, error: "Only DRAFT versions can be edited" }

  // Check version uniqueness (excluding current)
  const duplicate = await db.termsVersion.findFirst({
    where: { version: parsed.data.version, id: { not: parsed.data.id } },
  })
  if (duplicate) {
    return { success: false, error: `Version "${parsed.data.version}" already exists` }
  }

  await db.termsVersion.update({
    where: { id: parsed.data.id },
    data: {
      version: parsed.data.version,
      title: parsed.data.title,
      content: parsed.data.content,
      summary: parsed.data.summary || null,
      effectiveAt: parsed.data.effectiveAt,
    },
  })

  revalidatePath("/admin/terms")
  revalidatePath(`/admin/terms/${parsed.data.id}`)
  return { success: true }
}

// ─────────────────────────────────────────────
// PUBLISH (DRAFT → ACTIVE, old ACTIVE → SUPERSEDED)
// ─────────────────────────────────────────────

export async function publishTermsVersion(id: string): Promise<ActionResult> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const version = await db.termsVersion.findUnique({ where: { id } })
  if (!version) return { success: false, error: "Version not found" }
  if (version.status !== "DRAFT") return { success: false, error: "Only DRAFT versions can be published" }

  await db.$transaction(async (tx) => {
    // Supersede all currently active versions
    await tx.termsVersion.updateMany({
      where: { status: "ACTIVE" },
      data: { status: "SUPERSEDED" },
    })

    // Activate the new version
    await tx.termsVersion.update({
      where: { id },
      data: {
        status: "ACTIVE",
        publishedAt: new Date(),
      },
    })
  })

  revalidatePath("/admin/terms")
  revalidatePath(`/admin/terms/${id}`)
  return { success: true }
}
