import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React from "react"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { EquipmentCardPDF } from "@/lib/pdf/equipment-card-pdf"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { dbOrgId } = await getAuthContext()

    // Billing gate
    const billing = await getBillingContext(dbOrgId)
    const gate = checkFeatureAccess(billing, "equipmentManagement")
    if (!gate.allowed) {
      return NextResponse.json({ error: gate.reason }, { status: 402 })
    }

    const [equipment, org] = await Promise.all([
      db.equipment.findFirst({
        where: { id, organizationId: dbOrgId },
        include: {
          project: { select: { name: true } },
          calibrationRecords: {
            include: { recordedBy: { select: { firstName: true, lastName: true } } },
            orderBy: { calibrationDate: "desc" },
          },
          maintenanceRecords: {
            include: { recordedBy: { select: { firstName: true, lastName: true } } },
            orderBy: { scheduledDate: "desc" },
          },
          repairRecords: {
            include: {
              recordedBy: { select: { firstName: true, lastName: true } },
              capa: { select: { title: true, status: true } },
            },
            orderBy: { repairDate: "desc" },
          },
        },
      }),
      db.organization.findUnique({ where: { id: dbOrgId }, select: { name: true } }),
    ])

    if (!equipment) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }

    const element = React.createElement(EquipmentCardPDF, {
      organizationName: org?.name ?? "Organization",
      generatedDate: format(new Date(), "dd MMMM yyyy"),
      equipment,
    })

    const buffer = await renderToBuffer(element as unknown as React.ReactElement<DocumentProps>)

    const filename = `${equipment.assetNumber}-${equipment.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Equipment card PDF error:", error)
    return NextResponse.json({ error: "PDF export failed. Please try again." }, { status: 500 })
  }
}
