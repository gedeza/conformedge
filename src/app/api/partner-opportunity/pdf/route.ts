import { renderToBuffer } from "@react-pdf/renderer"
import { PartnerOpportunityPDF } from "@/lib/pdf/partner-opportunity-pdf"
import { NextResponse } from "next/server"
import React from "react"

export async function GET() {
  try {
    const buffer = await renderToBuffer(
      React.createElement(PartnerOpportunityPDF) as any
    )
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="ConformEdge-Partner-Opportunity.pdf"',
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Partner opportunity PDF error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
