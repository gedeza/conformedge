import { NextResponse } from "next/server"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React from "react"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { EquipmentRegisterPDF } from "@/lib/pdf/equipment-register-pdf"

export async function GET() {
  try {
    const { dbOrgId } = await getAuthContext()

    // Billing gate: equipment management required
    const billing = await getBillingContext(dbOrgId)
    const gate = checkFeatureAccess(billing, "equipmentManagement")
    if (!gate.allowed) {
      return NextResponse.json({ error: gate.reason }, { status: 402 })
    }

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const [equipment, org, totalActive, underRepair, quarantined, overdueCalibrations, upcomingMaintenance] =
      await Promise.all([
        db.equipment.findMany({
          where: { organizationId: dbOrgId },
          include: {
            project: { select: { name: true } },
            _count: { select: { calibrationRecords: true, maintenanceRecords: true, repairRecords: true } },
          },
          orderBy: { assetNumber: "asc" },
        }),
        db.organization.findUnique({ where: { id: dbOrgId }, select: { name: true } }),
        db.equipment.count({ where: { organizationId: dbOrgId, status: "ACTIVE" } }),
        db.equipment.count({ where: { organizationId: dbOrgId, status: "UNDER_REPAIR" } }),
        db.equipment.count({ where: { organizationId: dbOrgId, status: "QUARANTINED" } }),
        db.equipment.count({ where: { organizationId: dbOrgId, status: "ACTIVE", nextCalibrationDue: { lt: now } } }),
        db.maintenanceRecord.count({
          where: { organizationId: dbOrgId, status: "SCHEDULED", scheduledDate: { lte: thirtyDaysFromNow } },
        }),
      ])

    const element = React.createElement(EquipmentRegisterPDF, {
      organizationName: org?.name ?? "Organization",
      generatedDate: format(now, "dd MMMM yyyy"),
      equipment,
      metrics: { totalActive, underRepair, quarantined, overdueCalibrations, upcomingMaintenance },
    })

    const buffer = await renderToBuffer(element as unknown as React.ReactElement<DocumentProps>)
    const date = now.toISOString().split("T")[0]

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="equipment-register-${date}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Equipment register PDF error:", error)
    return NextResponse.json({ error: "PDF export failed. Please try again." }, { status: 500 })
  }
}
