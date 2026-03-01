import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { format } from "date-fns"
import React from "react"
import { db } from "@/lib/db"
import { validateShareToken, logShareAccess } from "@/lib/share-link"
import { AuditPackPDF } from "@/lib/pdf/audit-pack-pdf"
import { captureError } from "@/lib/error-tracking"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const shareLink = await validateShareToken(token)

    if (!shareLink) {
      return NextResponse.json({ error: "Invalid or expired share link" }, { status: 403 })
    }

    if (shareLink.type !== "AUDIT_PACK") {
      return NextResponse.json({ error: "This link is not for an audit pack" }, { status: 400 })
    }

    if (!shareLink.allowDownload) {
      return NextResponse.json({ error: "Downloads not permitted for this link" }, { status: 403 })
    }

    const pack = await db.auditPack.findFirst({
      where: { id: shareLink.entityId!, organizationId: shareLink.organizationId },
      include: {
        organization: { select: { name: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        project: {
          include: {
            documents: {
              select: {
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
                questions: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    question: true,
                    answers: {
                      take: 1,
                      orderBy: { createdAt: "desc" },
                      select: { answer: true, score: true },
                    },
                  },
                },
              },
            },
            capas: {
              select: {
                title: true,
                type: true,
                status: true,
                priority: true,
                rootCause: true,
                dueDate: true,
                capaActions: {
                  select: {
                    description: true,
                    isCompleted: true,
                    dueDate: true,
                  },
                },
              },
            },
            checklists: {
              select: {
                title: true,
                completionPercentage: true,
                status: true,
                standard: { select: { code: true } },
                items: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    description: true,
                    isCompliant: true,
                    standardClause: {
                      select: { clauseNumber: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!pack || !pack.project) {
      return NextResponse.json({ error: "Audit pack not found" }, { status: 404 })
    }

    // Log the PDF download
    logShareAccess({
      shareLinkId: shareLink.id,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: request.headers.get("user-agent") ?? null,
      action: "DOWNLOAD_PDF",
    })

    const pdfElement = React.createElement(AuditPackPDF, {
      title: pack.title,
      description: pack.description ?? undefined,
      organizationName: pack.organization.name,
      projectName: pack.project.name,
      createdBy: `${pack.createdBy.firstName} ${pack.createdBy.lastName}`,
      generatedDate: format(pack.generatedAt ?? new Date(), "PPP"),
      documents: pack.project.documents.map((d) => ({
        title: d.title,
        status: d.status,
        fileType: d.fileType,
        version: d.version,
        classifications: d.classifications.map((c) => ({
          clauseNumber: c.standardClause.clauseNumber,
          standard: c.standardClause.standard.code,
        })),
      })),
      assessments: pack.project.assessments.map((a) => ({
        title: a.title,
        score: a.overallScore,
        riskLevel: a.riskLevel,
        standard: a.standard.code,
        completedDate: a.completedDate ? format(a.completedDate, "PP") : null,
        questions: a.questions.map((q) => ({
          question: q.question,
          answer: q.answers[0]?.answer ?? null,
          score: q.answers[0]?.score ?? null,
        })),
      })),
      capas: pack.project.capas.map((c) => ({
        title: c.title,
        type: c.type,
        status: c.status,
        priority: c.priority,
        rootCause: c.rootCause,
        dueDate: c.dueDate ? format(c.dueDate, "PP") : null,
        actions: c.capaActions.map((a) => ({
          description: a.description,
          isCompleted: a.isCompleted,
          dueDate: a.dueDate ? format(a.dueDate, "PP") : null,
        })),
      })),
      checklists: pack.project.checklists.map((cl) => ({
        title: cl.title,
        completion: cl.completionPercentage,
        standard: cl.standard.code,
        status: cl.status,
        items: cl.items.map((item) => ({
          description: item.description,
          isCompliant: item.isCompliant,
          clauseNumber: item.standardClause?.clauseNumber ?? null,
        })),
      })),
    })

    const buffer = await renderToBuffer(pdfElement)
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pack.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
      },
    })
  } catch (error) {
    captureError(error, { source: "shared.pdf" })
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
