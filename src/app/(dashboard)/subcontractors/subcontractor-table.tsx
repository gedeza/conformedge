"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { SUBCONTRACTOR_TIERS } from "@/lib/constants"
import { getColumns, type SubcontractorRow } from "./columns"
import { SubcontractorForm } from "./subcontractor-form"
import { deleteSubcontractor } from "./actions"

interface SubcontractorTableProps {
  data: SubcontractorRow[]
  role: string
}

export function SubcontractorTable({ data, role }: SubcontractorTableProps) {
  const [editSub, setEditSub] = useState<SubcontractorRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubcontractorRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (sub) => setEditSub(sub),
    onDelete: (sub) => setDeleteTarget(sub),
    role,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteSubcontractor(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Subcontractor deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(SUBCONTRACTOR_TIERS).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search subcontractors..."
        filterKey="tier"
        filterOptions={filterOptions}
        filterPlaceholder="All tiers"
      />
      <SubcontractorForm
        open={!!editSub}
        onOpenChange={(open) => !open && setEditSub(null)}
        subcontractor={editSub ?? undefined}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Subcontractor"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
