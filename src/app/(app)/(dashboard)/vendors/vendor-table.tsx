"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { VENDOR_TIERS } from "@/lib/constants"
import { getColumns, type VendorRow } from "./columns"
import { VendorForm } from "./vendor-form"
import { deleteVendor } from "./actions"

interface VendorTableProps {
  data: VendorRow[]
  role: string
}

export function VendorTable({ data, role }: VendorTableProps) {
  const [editSub, setEditSub] = useState<VendorRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<VendorRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (sub) => setEditSub(sub),
    onDelete: (sub) => setDeleteTarget(sub),
    role,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteVendor(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Vendor deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(VENDOR_TIERS).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search vendors..."
        filterKey="tier"
        filterOptions={filterOptions}
        filterPlaceholder="All tiers"
      />
      <VendorForm
        open={!!editSub}
        onOpenChange={(open) => !open && setEditSub(null)}
        vendor={editSub ?? undefined}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Vendor"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
