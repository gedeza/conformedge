"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { OBJECTIVE_STATUSES } from "@/lib/constants"
import { getColumns, type ObjectiveRow } from "./columns"
import { ObjectiveForm } from "./objective-form"
import { deleteObjective } from "./actions"

interface ObjectiveTableProps {
  data: ObjectiveRow[]
  standards: { id: string; code: string; name: string }[]
  members: { id: string; name: string }[]
  role: string
}

export function ObjectiveTable({ data, standards, members, role }: ObjectiveTableProps) {
  const [editItem, setEditItem] = useState<ObjectiveRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ObjectiveRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (o) => setEditItem(o),
    onDelete: (o) => setDeleteTarget(o),
    role,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteObjective(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Objective deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(OBJECTIVE_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search objectives..."
        filterKey="derivedStatus"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <ObjectiveForm
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        objective={editItem ? {
          id: editItem.id,
          title: editItem.title,
          description: editItem.description,
          targetValue: editItem.targetValue,
          unit: editItem.unit,
          measurementFrequency: editItem.measurementFrequency,
          dueDate: editItem.dueDate,
          standardId: editItem.standard?.id ?? null,
          standardClauseId: editItem.standardClause?.id ?? null,
          ownerId: editItem.owner?.id ?? "",
        } : undefined}
        standards={standards}
        members={members}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Objective"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? All measurements will be lost.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
