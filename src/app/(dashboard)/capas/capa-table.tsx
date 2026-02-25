"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CAPA_STATUSES } from "@/lib/constants"
import { getColumns, type CapaRow } from "./columns"
import { CapaForm } from "./capa-form"
import { deleteCapa } from "./actions"

interface CapaTableProps {
  data: CapaRow[]
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
}

export function CapaTable({ data, projects, members }: CapaTableProps) {
  const [editItem, setEditItem] = useState<CapaRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CapaRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (c) => setEditItem(c),
    onDelete: (c) => setDeleteTarget(c),
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteCapa(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("CAPA deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(CAPA_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search CAPAs..."
        filterKey="status"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <CapaForm
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        capa={editItem ? {
          id: editItem.id,
          title: editItem.title,
          description: null,
          type: editItem.type,
          status: editItem.status,
          priority: editItem.priority,
          rootCause: null,
          dueDate: editItem.dueDate,
          projectId: editItem.project?.id ?? null,
          assignedToId: editItem.assignedTo ? "" : null,
        } : undefined}
        projects={projects}
        members={members}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete CAPA"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
