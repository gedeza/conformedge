import { renderToBuffer } from "@react-pdf/renderer"
import { ReferralPartnerPDF } from "@/lib/pdf/referral-partner-pdf"
import { NextResponse } from "next/server"
import React from "react"

export async function GET() {
  try {
    const buffer = await renderToBuffer(
      React.createElement(ReferralPartnerPDF) as any
    )
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="ConformEdge-Referral-Partner.pdf"',
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Referral partner PDF error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
