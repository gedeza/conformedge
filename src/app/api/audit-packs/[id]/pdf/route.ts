import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { format } from "date-fns"
import React from "react"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { AuditPackPDF } from "@/lib/pdf/audit-pack-pdf"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbOrgId } = await getAuthContext()
    const { id } = await params

    const pack = await db.auditPack.findFirst({
      where: { id, organizationId: dbOrgId },
      include: {
        project: {
          include: {
            documents: { select: { title: true, status: true, fileType: true } },
            assessments: {
              select: {
                title: true,
                overallScore: true,
                riskLevel: true,
                standard: { select: { code: true } },
              },
            },
            capas: { select: { title: true, type: true, status: true, priority: true } },
            checklists: {
              select: {
                title: true,
                completionPercentage: true,
                standard: { select: { code: true } },
              },
            },
          },
        },
      },
    })

    if (!pack || !pack.project) {
      return NextResponse.json({ error: "Audit pack not found" }, { status: 404 })
    }

    const pdfElement = React.createElement(AuditPackPDF, {
      title: pack.title,
      projectName: pack.project.name,
      generatedDate: format(pack.generatedAt ?? new Date(), "PPP"),
      documents: pack.project.documents,
      assessments: pack.project.assessments.map((a) => ({
        title: a.title,
        score: a.overallScore,
        riskLevel: a.riskLevel,
        standard: a.standard.code,
      })),
      capas: pack.project.capas,
      checklists: pack.project.checklists.map((c) => ({
        title: c.title,
        completion: c.completionPercentage,
        standard: c.standard.code,
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
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
