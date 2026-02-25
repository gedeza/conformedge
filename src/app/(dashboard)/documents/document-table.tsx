"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DOCUMENT_STATUSES } from "@/lib/constants"
import { getColumns, type DocumentRow } from "./columns"
import { DocumentForm } from "./document-form"
import { deleteDocument } from "./actions"

interface DocumentTableProps {
  data: DocumentRow[]
  projects: { id: string; name: string }[]
}

export function DocumentTable({ data, projects }: DocumentTableProps) {
  const [editDoc, setEditDoc] = useState<DocumentRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (doc) => setEditDoc(doc),
    onDelete: (doc) => setDeleteTarget(doc),
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteDocument(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Document deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(DOCUMENT_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search documents..."
        filterKey="status"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <DocumentForm
        open={!!editDoc}
        onOpenChange={(open) => !open && setEditDoc(null)}
        document={editDoc ? {
          id: editDoc.id,
          title: editDoc.title,
          description: null,
          status: editDoc.status,
          projectId: editDoc.project?.id,
          expiresAt: editDoc.expiresAt,
          fileUrl: null,
        } : undefined}
        projects={projects}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Document"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
