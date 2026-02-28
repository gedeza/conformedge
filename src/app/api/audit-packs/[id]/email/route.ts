import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { format } from "date-fns"
import React from "react"
import { z } from "zod"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { sendAuditPackEmail } from "@/lib/email"
import { AuditPackPDF } from "@/lib/pdf/audit-pack-pdf"
import { captureError } from "@/lib/error-tracking"

const emailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  subject: z.string().min(1).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUserId, dbOrgId } = await getAuthContext()
    const { id } = await params

    const body = await request.json()
    const parsed = emailSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { to, subject } = parsed.data

    const pack = await db.auditPack.findFirst({
      where: { id, organizationId: dbOrgId },
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

    // Generate PDF (same logic as the GET /pdf route)
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
    const pdfBuffer = Buffer.from(buffer)

    const emailSubject = subject ?? `Audit Pack: ${pack.title}`
    const result = await sendAuditPackEmail({
      to,
      subject: emailSubject,
      packTitle: pack.title,
      organizationName: pack.organization.name,
      pdfBuffer,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 502 }
      )
    }

    logAuditEvent({
      action: "EMAIL_SENT",
      entityType: "AuditPack",
      entityId: pack.id,
      metadata: {
        to: Array.isArray(to) ? to : [to],
        subject: emailSubject,
      },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    captureError(error, { source: "auditPack.email" })
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
