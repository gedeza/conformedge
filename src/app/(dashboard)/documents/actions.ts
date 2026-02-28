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

const PAGE_SIZE = 50

export async function getDocuments(page = 1) {
  const { dbOrgId } = await getAuthContext()

  const where = { organizationId: dbOrgId }

  const [documents, total] = await Promise.all([
    db.document.findMany({
      where,
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
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.document.count({ where }),
  ])

  return {
    documents,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  }
}

export async function getDocument(id: string) {
  const { dbOrgId } = await getAuthContext()

  return db.document.findFirst({
    where: { id, organizationId: dbOrgId },
    include: {
      project: { select: { id: true, name: true } },
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      parentDocument: { select: { id: true, title: true, version: true } },
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

export async function getDocumentVersions(id: string) {
  const { dbOrgId } = await getAuthContext()

  const versionSelect = {
    id: true,
    title: true,
    version: true,
    status: true,
    fileUrl: true,
    fileType: true,
    fileSize: true,
    createdAt: true,
    uploadedBy: { select: { id: true, firstName: true, lastName: true } },
    parentDocumentId: true,
  } as const

  // Fetch all documents in the org that have a parentDocumentId or are parents
  // This is a single query — we walk the tree in memory to find the chain
  const allOrgDocs = await db.document.findMany({
    where: { organizationId: dbOrgId },
    select: versionSelect,
  })

  // Build parent/child lookup maps
  const byId = new Map(allOrgDocs.map((d) => [d.id, d]))
  const target = byId.get(id)
  if (!target) return []

  // Walk up to find root
  let rootId = target.id
  let current = target
  while (current.parentDocumentId) {
    const parent = byId.get(current.parentDocumentId)
    if (!parent) break
    rootId = parent.id
    current = parent
  }

  // Collect all descendants from root
  const chain = new Set<string>([rootId])
  let added = true
  while (added) {
    added = false
    for (const doc of allOrgDocs) {
      if (doc.parentDocumentId && chain.has(doc.parentDocumentId) && !chain.has(doc.id)) {
        chain.add(doc.id)
        added = true
      }
    }
  }

  return allOrgDocs
    .filter((d) => chain.has(d.id))
    .sort((a, b) => b.version - a.version)
}

export async function uploadNewVersion(
  parentId: string,
  values: Pick<DocumentFormValues, "fileUrl" | "fileType" | "fileSize"> & { title?: string; description?: string }
): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const parent = await db.document.findFirst({
      where: { id: parentId, organizationId: dbOrgId },
      include: {
        classifications: true,
      },
    })
    if (!parent) return { success: false, error: "Document not found" }

    // Archive the current version
    await db.document.update({
      where: { id: parentId },
      data: { status: "ARCHIVED" },
    })

    // Create new version
    const newDoc = await db.document.create({
      data: {
        title: values.title || parent.title,
        description: values.description || parent.description,
        status: "DRAFT",
        fileUrl: values.fileUrl,
        fileType: values.fileType,
        fileSize: values.fileSize,
        projectId: parent.projectId,
        expiresAt: parent.expiresAt,
        uploadedById: dbUserId,
        organizationId: dbOrgId,
        version: parent.version + 1,
        parentDocumentId: parentId,
      },
    })

    // Copy clause classifications to new version
    if (parent.classifications.length > 0) {
      await db.documentClassification.createMany({
        data: parent.classifications.map((c) => ({
          documentId: newDoc.id,
          standardClauseId: c.standardClauseId,
          confidence: c.confidence,
          isVerified: c.isVerified,
          verifiedById: c.verifiedById,
          verifiedAt: c.verifiedAt,
        })),
      })
    }

    logAuditEvent({
      action: "NEW_VERSION",
      entityType: "Document",
      entityId: newDoc.id,
      metadata: {
        title: newDoc.title,
        version: newDoc.version,
        parentId: parentId,
        parentVersion: parent.version,
      },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/documents")
    revalidatePath(`/documents/${parentId}`)
    revalidatePath(`/documents/${newDoc.id}`)
    return { success: true, data: { id: newDoc.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to upload new version" }
  }
}

export async function getDocumentAuditHistory(documentId: string) {
  const { dbOrgId } = await getAuthContext()

  return db.auditTrailEvent.findMany({
    where: {
      organizationId: dbOrgId,
      entityType: "Document",
      entityId: documentId,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, imageUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
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

export async function bulkCreateDocuments(
  files: Array<{ title: string; fileUrl: string; fileType: string; fileSize: number; projectId?: string }>
): Promise<ActionResult<{ count: number; ids: string[] }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canCreate(role)) return { success: false, error: "Insufficient permissions" }

    const docs = await Promise.all(
      files.map((f) =>
        db.document.create({
          data: {
            title: f.title,
            fileUrl: f.fileUrl,
            fileType: f.fileType,
            fileSize: f.fileSize,
            projectId: f.projectId || null,
            uploadedById: dbUserId,
            organizationId: dbOrgId,
          },
        })
      )
    )

    for (const doc of docs) {
      logAuditEvent({
        action: "CREATE",
        entityType: "Document",
        entityId: doc.id,
        metadata: { title: doc.title, bulk: true },
        userId: dbUserId,
        organizationId: dbOrgId,
      })
    }

    revalidatePath("/documents")
    return { success: true, data: { count: docs.length, ids: docs.map((d) => d.id) } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Bulk upload failed" }
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

const VALID_DOCUMENT_STATUSES = ["DRAFT", "PENDING_REVIEW", "APPROVED", "EXPIRED", "ARCHIVED"] as const

export async function updateDocumentStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    if (!VALID_DOCUMENT_STATUSES.includes(status as typeof VALID_DOCUMENT_STATUSES[number])) {
      return { success: false, error: "Invalid document status" }
    }

    const existing = await db.document.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!existing) return { success: false, error: "Document not found" }

    await db.document.update({
      where: { id },
      data: { status: status as typeof VALID_DOCUMENT_STATUSES[number] },
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

export async function verifyClassification(documentId: string, classificationId: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canEdit(role)) return { success: false, error: "Insufficient permissions" }

    const doc = await db.document.findFirst({
      where: { id: documentId, organizationId: dbOrgId },
    })
    if (!doc) return { success: false, error: "Document not found" }

    const classification = await db.documentClassification.findFirst({
      where: { id: classificationId, documentId },
    })
    if (!classification) return { success: false, error: "Classification not found" }

    await db.documentClassification.update({
      where: { id: classificationId },
      data: {
        isVerified: true,
        verifiedById: dbUserId,
        verifiedAt: new Date(),
      },
    })

    logAuditEvent({
      action: "VERIFY_CLASSIFICATION",
      entityType: "Document",
      entityId: documentId,
      metadata: { classificationId },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath(`/documents/${documentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to verify classification" }
  }
}

export async function getStandardsWithClauses() {
  await getAuthContext()
  return db.standard.findMany({
    where: { isActive: true },
    include: {
      clauses: {
        orderBy: { clauseNumber: "asc" },
        select: { id: true, clauseNumber: true, title: true, description: true, parentId: true },
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
