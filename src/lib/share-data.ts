import { db } from "@/lib/db"
import type { ShareLink } from "@/generated/prisma/client"

/**
 * Read-only data fetchers for shared views.
 * Use shareLink.organizationId for scoping instead of getAuthContext().
 */

export async function getSharedDocument(shareLink: ShareLink) {
  if (shareLink.type !== "DOCUMENT" || !shareLink.entityId) return null

  return db.document.findFirst({
    where: { id: shareLink.entityId, organizationId: shareLink.organizationId },
    include: {
      project: { select: { id: true, name: true } },
      uploadedBy: { select: { firstName: true, lastName: true } },
      parentDocument: { select: { id: true, title: true, version: true } },
      classifications: {
        include: {
          standardClause: {
            include: { standard: { select: { id: true, code: true, name: true } } },
          },
        },
      },
      approvalRequests: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          steps: {
            orderBy: { stepOrder: "asc" },
            include: { assignedTo: { select: { firstName: true, lastName: true } } },
          },
        },
      },
    },
  })
}

export async function getSharedAuditPack(shareLink: ShareLink) {
  if (shareLink.type !== "AUDIT_PACK" || !shareLink.entityId) return null

  return db.auditPack.findFirst({
    where: { id: shareLink.entityId, organizationId: shareLink.organizationId },
    include: {
      organization: { select: { name: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      project: {
        include: {
          documents: {
            select: {
              id: true,
              title: true,
              status: true,
              fileType: true,
              version: true,
              classifications: {
                select: {
                  standardClause: {
                    select: {
                      clauseNumber: true,
                      standard: { select: { code: true } },
                    },
                  },
                },
              },
            },
          },
          assessments: {
            select: {
              title: true,
              overallScore: true,
              riskLevel: true,
              completedDate: true,
              standard: { select: { code: true } },
            },
          },
          capas: {
            select: {
              title: true,
              type: true,
              status: true,
              priority: true,
              dueDate: true,
            },
          },
          checklists: {
            select: {
              title: true,
              completionPercentage: true,
              status: true,
              standard: { select: { code: true } },
            },
          },
        },
      },
    },
  })
}

interface PortalConfig {
  documents?: boolean
  assessments?: boolean
  capas?: boolean
  checklists?: boolean
  subcontractors?: boolean
}

export async function getSharedPortalData(shareLink: ShareLink) {
  if (shareLink.type !== "PORTAL") return null

  const config = (shareLink.portalConfig as PortalConfig | null) ?? { documents: true }
  const orgId = shareLink.organizationId

  const [docData, assessmentData, capaData, checklistData, subcontractorData] = await Promise.all([
    config.documents
      ? db.document.findMany({
          where: { organizationId: orgId },
          select: {
            id: true,
            title: true,
            status: true,
            version: true,
            fileType: true,
            createdAt: true,
            classifications: {
              select: {
                standardClause: {
                  select: { clauseNumber: true, standard: { select: { code: true } } },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      : Promise.resolve([]),
    config.assessments
      ? db.assessment.findMany({
          where: { organizationId: orgId },
          select: {
            id: true,
            title: true,
            overallScore: true,
            riskLevel: true,
            completedDate: true,
            standard: { select: { code: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      : Promise.resolve([]),
    config.capas
      ? db.capa.findMany({
          where: { organizationId: orgId },
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            priority: true,
            dueDate: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      : Promise.resolve([]),
    config.checklists
      ? db.complianceChecklist.findMany({
          where: { organizationId: orgId },
          select: {
            id: true,
            title: true,
            completionPercentage: true,
            status: true,
            standard: { select: { code: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      : Promise.resolve([]),
    config.subcontractors
      ? db.subcontractor.findMany({
          where: { organizationId: orgId },
          select: {
            id: true,
            name: true,
            tier: true,
            beeLevel: true,
            certifications: {
              select: { name: true, expiresAt: true },
            },
          },
          orderBy: { name: "asc" },
          take: 50,
        })
      : Promise.resolve([]),
  ])

  // Summary metrics
  const metrics = {
    documentCount: config.documents ? docData.length : undefined,
    avgComplianceScore: config.assessments && assessmentData.length > 0
      ? assessmentData.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) / assessmentData.length
      : undefined,
    openCapas: config.capas
      ? capaData.filter((c) => c.status !== "CLOSED").length
      : undefined,
    checklistCompletion: config.checklists && checklistData.length > 0
      ? checklistData.reduce((sum, c) => sum + c.completionPercentage, 0) / checklistData.length
      : undefined,
  }

  return {
    config,
    metrics,
    documents: docData,
    assessments: assessmentData,
    capas: capaData,
    checklists: checklistData,
    subcontractors: subcontractorData,
  }
}
