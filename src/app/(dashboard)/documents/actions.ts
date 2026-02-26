"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import type { ActionResult } from "@/types"

const documentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "EXPIRED", "ARCHIVED"]).default("DRAFT"),
  projectId: z.string().optional(),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
  expiresAt: z.coerce.date().optional(),
})

export type DocumentFormValues = z.infer<typeof documentSchema>

export async function getDocuments() {
  const { dbOrgId } = await getAuthContext()

  return db.document.findMany({
    where: { organizationId: dbOrgId },
    include: {
      project: { select: { id: true, name: true } },
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      classifications: {
        include: {
          standardClause: {
            include: { standard: { select: { code: true, name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDocument(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.document.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      project: { select: { id: true, name: true } },
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      classifications: {
        include: {
          standardClause: {
            include: { standard: { select: { id: true, code: true, name: true } } },
          },
          verifiedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  })
}

export async function createDocument(values: DocumentFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = documentSchema.parse(values)

    const doc = await db.document.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        status: parsed.status,
        fileUrl: parsed.fileUrl,
        fileType: parsed.fileType,
        fileSize: parsed.fileSize,
        expiresAt: parsed.expiresAt,
        projectId: parsed.projectId || null,
        uploadedById: dbUserId,
        organizationId: dbOrgId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "Document",
      entityId: doc.id,
      metadata: { title: doc.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    return { success: true, data: { id: doc.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create document" }
  }
}

export async function updateDocument(id: string, values: DocumentFormValues): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = documentSchema.parse(values)

    const existing = await db.document.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!existing) return { success: false, error: "Document not found" }

    await db.document.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description,
        status: parsed.status,
        fileUrl: parsed.fileUrl ?? existing.fileUrl,
        fileType: parsed.fileType ?? existing.fileType,
        fileSize: parsed.fileSize ?? existing.fileSize,
        expiresAt: parsed.expiresAt,
        projectId: parsed.projectId || null,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "Document",
      entityId: id,
      metadata: { title: parsed.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    revalidatePath(`/documents/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update document" }
  }
}

export async function updateDocumentStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.document.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!existing) return { success: false, error: "Document not found" }

    await db.document.update({
      where: { id },
      data: { status: status as "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "EXPIRED" | "ARCHIVED" },
    })

    logAuditEvent({
      action: "STATUS_CHANGE",
      entityType: "Document",
      entityId: id,
      metadata: { from: existing.status, to: status },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    revalidatePath(`/documents/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update status" }
  }
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canDelete(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.document.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!existing) return { success: false, error: "Document not found" }

    await db.document.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "Document",
      entityId: id,
      metadata: { title: existing.title },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete document" }
  }
}

export async function addClauseTag(documentId: string, standardClauseId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const doc = await db.document.findFirst({
      where: { id: documentId, organizationId: dbOrgId },
    })
    if (!doc) return { success: false, error: "Document not found" }

    const existing = await db.documentClassification.findFirst({
      where: { documentId, standardClauseId },
    })
    if (existing) return { success: false, error: "Clause already tagged" }

    await db.documentClassification.create({
      data: {
        documentId,
        standardClauseId,
        confidence: 1.0,
        isVerified: true,
        verifiedById: dbUserId,
        verifiedAt: new Date(),
      },
    })

    logAuditEvent({
      action: "TAG_CLAUSE",
      entityType: "Document",
      entityId: documentId,
      metadata: { standardClauseId },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/documents/${documentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add tag" }
  }
}

export async function removeClauseTag(documentId: string, classificationId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const doc = await db.document.findFirst({
      where: { id: documentId, organizationId: dbOrgId },
    })
    if (!doc) return { success: false, error: "Document not found" }

    await db.documentClassification.delete({ where: { id: classificationId } })

    logAuditEvent({
      action: "UNTAG_CLAUSE",
      entityType: "Document",
      entityId: documentId,
      metadata: { classificationId },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/documents/${documentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove tag" }
  }
}

export async function getStandardsWithClauses() {
  return db.standard.findMany({
    where: { isActive: true },
    include: {
      clauses: {
        orderBy: { clauseNumber: "asc" },
        select: { id: true, clauseNumber: true, title: true },
      },
    },
    orderBy: { code: "asc" },
  })
}

export async function getProjectOptions() {
  const { dbOrgId } = await getAuthContext()
  return db.project.findMany({
    where: { organizationId: dbOrgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
