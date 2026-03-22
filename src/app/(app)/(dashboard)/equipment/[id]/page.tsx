import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft, Wrench, MapPin, Calendar, Shield, Package,
  CalendarCheck, Settings, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/shared/status-badge"
import { getEquipmentDetail } from "../actions"
import { CalibrationTab } from "./calibration-tab"
import { MaintenanceTab } from "./maintenance-tab"
import { RepairTab } from "./repair-tab"
import { EquipmentStatusActions } from "./equipment-status-actions"
import { getAuthContext } from "@/lib/auth"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EquipmentDetailPage({ params }: Props) {
  const { id } = await params
  const equipment = await getEquipmentDetail(id)
  if (!equipment) notFound()

  const { role } = await getAuthContext()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/equipment"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{equipment.name}</h1>
            <Badge variant="outline" className="font-mono">{equipment.assetNumber}</Badge>
            <StatusBadge type="equipment" value={equipment.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {equipment.category}
            {equipment.location && ` — ${equipment.location}`}
          </p>
        </div>
        <EquipmentStatusActions equipmentId={equipment.id} currentStatus={equipment.status} role={role} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Package className="h-4 w-4" /> Manufacturer
            </div>
            <p className="font-medium">{equipment.manufacturer || "—"}</p>
            {equipment.model && <p className="text-xs text-muted-foreground">{equipment.model}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Wrench className="h-4 w-4" /> Serial Number
            </div>
            <p className="font-medium font-mono">{equipment.serialNumber || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Shield className="h-4 w-4" /> SWL
            </div>
            <p className="font-medium">{equipment.swl || "—"}</p>
            {equipment.ceMarking && <Badge variant="outline" className="mt-1 text-xs">CE</Badge>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CalendarCheck className="h-4 w-4" /> Next Calibration
            </div>
            {equipment.nextCalibrationDue ? (
              <p className={`font-medium ${new Date(equipment.nextCalibrationDue) < new Date() ? "text-red-600" : ""}`}>
                {format(new Date(equipment.nextCalibrationDue), "MMM d, yyyy")}
              </p>
            ) : (
              <p className="font-medium">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details + Description */}
      {(equipment.description || equipment.notes || equipment.purchaseDate || equipment.project) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {equipment.description && (
              <div>
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1">{equipment.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {equipment.project && (
                <div>
                  <span className="text-muted-foreground">Project:</span>
                  <p className="font-medium">{equipment.project.name}</p>
                </div>
              )}
              {equipment.purchaseDate && (
                <div>
                  <span className="text-muted-foreground">Purchased:</span>
                  <p>{format(new Date(equipment.purchaseDate), "MMM d, yyyy")}</p>
                </div>
              )}
              {equipment.commissionDate && (
                <div>
                  <span className="text-muted-foreground">Commissioned:</span>
                  <p>{format(new Date(equipment.commissionDate), "MMM d, yyyy")}</p>
                </div>
              )}
              {equipment.warrantyExpiry && (
                <div>
                  <span className="text-muted-foreground">Warranty:</span>
                  <p className={new Date(equipment.warrantyExpiry) < new Date() ? "text-red-600" : ""}>
                    {format(new Date(equipment.warrantyExpiry), "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
            {equipment.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1 whitespace-pre-wrap">{equipment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="calibration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calibration" className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            Calibration
            <Badge variant="secondary" className="ml-1">{equipment.calibrationRecords.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2">
            <Settings className="h-4 w-4" />
            Maintenance
            <Badge variant="secondary" className="ml-1">{equipment.maintenanceRecords.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="repairs" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Repairs
            <Badge variant="secondary" className="ml-1">{equipment.repairRecords.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calibration">
          <CalibrationTab
            equipmentId={equipment.id}
            records={equipment.calibrationRecords}
            role={role}
          />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceTab
            equipmentId={equipment.id}
            records={equipment.maintenanceRecords}
            role={role}
          />
        </TabsContent>

        <TabsContent value="repairs">
          <RepairTab
            equipmentId={equipment.id}
            records={equipment.repairRecords}
            role={role}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
