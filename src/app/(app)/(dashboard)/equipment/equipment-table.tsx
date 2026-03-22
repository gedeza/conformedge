"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EQUIPMENT_STATUSES } from "@/lib/constants"
import { getColumns, type EquipmentRow } from "./columns"
import { EquipmentForm } from "./equipment-form"
import { deleteEquipment } from "./actions"

interface EquipmentTableProps {
  data: EquipmentRow[]
  projects: { id: string; name: string }[]
  role: string
}

export function EquipmentTable({ data, projects, role }: EquipmentTableProps) {
  const [editItem, setEditItem] = useState<EquipmentRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EquipmentRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (i) => setEditItem(i),
    onDelete: (i) => setDeleteTarget(i),
    role,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteEquipment(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Equipment decommissioned")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(EQUIPMENT_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search equipment..."
        filterKey="status"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <EquipmentForm
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        equipment={editItem ? {
          id: editItem.id,
          name: editItem.name,
          description: editItem.description,
          category: editItem.category,
          manufacturer: editItem.manufacturer,
          model: editItem.model,
          serialNumber: editItem.serialNumber,
          location: editItem.location,
          swl: editItem.swl,
          ceMarking: editItem.ceMarking,
          purchaseDate: editItem.purchaseDate,
          commissionDate: editItem.commissionDate,
          warrantyExpiry: editItem.warrantyExpiry,
          projectId: editItem.project?.id ?? null,
          specifications: editItem.specifications as Record<string, string> | null,
          notes: editItem.notes,
        } : undefined}
        projects={projects}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Decommission Equipment"
        description={`Are you sure you want to decommission "${deleteTarget?.name}" (${deleteTarget?.assetNumber})? The equipment and its history will be preserved but marked as decommissioned.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
