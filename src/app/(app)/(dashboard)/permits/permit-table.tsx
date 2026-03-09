"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { WORK_PERMIT_STATUSES } from "@/lib/constants"
import { getColumns, type PermitRow } from "./columns"
import { PermitForm } from "./permit-form"
import { deletePermit } from "./actions"

interface PermitTableProps {
  data: PermitRow[]
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
  role: string
}

export function PermitTable({ data, projects, members, role }: PermitTableProps) {
  const [editItem, setEditItem] = useState<PermitRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PermitRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (p) => setEditItem(p),
    onDelete: (p) => setDeleteTarget(p),
    role,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deletePermit(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Permit deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(WORK_PERMIT_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search permits..."
        filterKey="status"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <PermitForm
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        permit={editItem ? {
          id: editItem.id,
          title: editItem.title,
          permitType: editItem.permitType,
          riskLevel: editItem.riskLevel,
          location: editItem.location,
          description: editItem.description,
          hazardsIdentified: editItem.hazardsIdentified,
          precautions: editItem.precautions,
          ppeRequirements: editItem.ppeRequirements,
          emergencyProcedures: editItem.emergencyProcedures,
          validFrom: editItem.validFrom,
          validTo: editItem.validTo,
          projectId: editItem.project?.id ?? null,
          issuedById: editItem.issuedBy?.id ?? null,
        } : undefined}
        projects={projects}
        members={members}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Permit"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
