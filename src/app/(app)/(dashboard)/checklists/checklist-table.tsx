"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CHECKLIST_STATUSES } from "@/lib/constants"
import { getColumns, type ChecklistRow } from "./columns"
import { ChecklistForm } from "./checklist-form"
import { deleteChecklist } from "./actions"

interface ChecklistTableProps {
  data: ChecklistRow[]
  standards: { id: string; code: string; name: string }[]
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
  role: string
}

export function ChecklistTable({ data, standards, projects, members, role }: ChecklistTableProps) {
  const [editItem, setEditItem] = useState<ChecklistRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ChecklistRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (c) => setEditItem(c),
    onDelete: (c) => setDeleteTarget(c),
    role,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteChecklist(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Checklist deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(CHECKLIST_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search checklists..."
        filterKey="status"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <ChecklistForm
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        checklist={editItem ? {
          id: editItem.id,
          title: editItem.title,
          description: null,
          standardId: "",
          projectId: editItem.project?.id ?? null,
          assignedToId: editItem.assignedTo ? "" : null,
        } : undefined}
        standards={standards}
        projects={projects}
        members={members}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Checklist"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
