import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { canEdit } from "@/lib/permissions"
import { logAuditEvent } from "@/lib/audit"
import { extractText, isExtractable } from "@/lib/ai/extract-text"
import { classifyDocument } from "@/lib/ai/classify-document"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { dbUserId, dbOrgId, role } = await getAuthContext()

    if (!canEdit(role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const doc = await db.document.findFirst({
      where: { id, organizationId: dbOrgId },
    })

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (!doc.fileUrl || !doc.fileType || !isExtractable(doc.fileType)) {
      return NextResponse.json(
        { error: "File type not supported for AI analysis" },
        { status: 400 }
      )
    }

    // Extract text
    const text = await extractText(doc.fileUrl, doc.fileType)

    if (text.trim().length < 50) {
      return NextResponse.json(
        { error: "Not enough text content to analyze. The file may be image-based." },
        { status: 400 }
      )
    }

    // Fetch standards with clauses
    const standards = await db.standard.findMany({
      where: { isActive: true },
      include: {
        clauses: {
          orderBy: { clauseNumber: "asc" },
          select: { id: true, clauseNumber: true, title: true },
        },
      },
      orderBy: { code: "asc" },
    })

    // Classify with AI
    const result = await classifyDocument(
      text,
      standards.map((s) => ({
        code: s.code,
        name: s.name,
        clauses: s.clauses.map((c) => ({
          clauseNumber: c.clauseNumber,
          title: c.title,
        })),
      }))
    )

    // Build a lookup: standardCode + clauseNumber → standardClauseId
    const clauseLookup = new Map<string, string>()
    for (const std of standards) {
      for (const clause of std.clauses) {
        clauseLookup.set(`${std.code}|${clause.clauseNumber}`, clause.id)
      }
    }

    // Resolve AI results to standardClauseIds, dedup by clause (keep highest confidence)
    const resolvedMap = new Map<string, { standardClauseId: string; confidence: number }>()
    for (const item of result.classifications) {
      const key = `${item.standardCode}|${item.clauseNumber}`
      const clauseId = clauseLookup.get(key)
      if (!clauseId) continue

      const existing = resolvedMap.get(clauseId)
      if (!existing || item.confidence > existing.confidence) {
        resolvedMap.set(clauseId, {
          standardClauseId: clauseId,
          confidence: item.confidence,
        })
      }
    }

    const resolved = Array.from(resolvedMap.values())

    // Delete existing unverified classifications (re-analysis replaces AI results)
    await db.documentClassification.deleteMany({
      where: {
        documentId: id,
        isVerified: false,
      },
    })

    // Create new classifications
    if (resolved.length > 0) {
      await db.documentClassification.createMany({
        data: resolved.map((r) => ({
          documentId: id,
          standardClauseId: r.standardClauseId,
          confidence: r.confidence,
          isVerified: false,
        })),
        skipDuplicates: true,
      })
    }

    logAuditEvent({
      action: "AI_CLASSIFY",
      entityType: "Document",
      entityId: id,
      metadata: {
        classificationsCount: resolved.length,
        summary: result.summary,
      },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    return NextResponse.json({
      success: true,
      count: resolved.length,
      summary: result.summary,
    })
  } catch (error) {
    console.error("AI classification error:", error instanceof Error ? error.stack : error)

    if (error instanceof Error && error.message.includes("429")) {
      return NextResponse.json(
        { error: "AI service is busy. Please try again in a moment." },
        { status: 429 }
      )
    }

    if (error instanceof Error && error.message.includes("credit balance")) {
      return NextResponse.json(
        { error: "AI service billing issue. Please check your Anthropic API plan." },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { error: "Classification failed. Please try again." },
      { status: 500 }
    )
  }
}
