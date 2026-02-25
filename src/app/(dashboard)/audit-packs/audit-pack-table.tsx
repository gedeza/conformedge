"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { AUDIT_PACK_STATUSES } from "@/lib/constants"
import { getColumns, type AuditPackRow } from "./columns"
import { deleteAuditPack } from "./actions"

interface AuditPackTableProps {
  data: AuditPackRow[]
}

export function AuditPackTable({ data }: AuditPackTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<AuditPackRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onDelete: (pack) => setDeleteTarget(pack),
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteAuditPack(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Audit pack deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(AUDIT_PACK_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search audit packs..."
        filterKey="status"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Audit Pack"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
