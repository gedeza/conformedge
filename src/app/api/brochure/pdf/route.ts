import { renderToBuffer } from "@react-pdf/renderer"
import { BrochurePDF } from "@/lib/pdf/brochure-pdf"
import { NextResponse } from "next/server"
import React from "react"

export async function GET() {
  try {
    const buffer = await renderToBuffer(
      React.createElement(BrochurePDF) as any
    )
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="ConformEdge-Brochure.pdf"',
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Brochure PDF error:", error)
    return NextResponse.json({ error: "Failed to generate brochure" }, { status: 500 })
  }
}
