"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DOCUMENT_STATUSES } from "@/lib/constants"
import { isExtractableMime } from "@/lib/ai/extractable-types"
import { canEdit } from "@/lib/permissions"
import { getColumns, type DocumentRow } from "./columns"
import { DocumentForm } from "./document-form"
import { deleteDocument } from "./actions"

interface DocumentTableProps {
  data: DocumentRow[]
  projects: { id: string; name: string }[]
  role: string
}

export function DocumentTable({ data, projects, role }: DocumentTableProps) {
  const [editDoc, setEditDoc] = useState<DocumentRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [classifying, setClassifying] = useState(false)

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleToggleAll(ids: string[]) {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      if (allSelected) return new Set()
      return new Set(ids)
    })
  }

  async function handleBulkClassify() {
    const selectedDocs = data.filter((d) => selectedIds.has(d.id))
    const extractable = selectedDocs.filter((d) => isExtractableMime(d.fileType))

    if (extractable.length === 0) {
      toast.error("No selected documents have extractable file types")
      return
    }

    setClassifying(true)
    toast.info(`Classifying ${extractable.length} document${extractable.length > 1 ? "s" : ""}...`)

    // Process in batches of 3 to avoid hitting API rate limits
    const BATCH_SIZE = 3
    const results: PromiseSettledResult<Response>[] = []
    for (let i = 0; i < extractable.length; i += BATCH_SIZE) {
      const batch = extractable.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.allSettled(
        batch.map((d) =>
          fetch(`/api/documents/${d.id}/classify`, { method: "POST" })
        )
      )
      results.push(...batchResults)
    }

    const succeeded = results.filter((r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<Response>).value.ok).length
    const failed = extractable.length - succeeded

    if (failed === 0) {
      toast.success(`${succeeded} document${succeeded > 1 ? "s" : ""} classified`)
    } else {
      toast.warning(`${succeeded} classified, ${failed} failed`)
    }

    setSelectedIds(new Set())
    setClassifying(false)
  }

  const columns = getColumns({
    onEdit: (doc) => setEditDoc(doc),
    onDelete: (doc) => setDeleteTarget(doc),
    role,
    selectedIds: canEdit(role) ? selectedIds : undefined,
    onToggleSelect: canEdit(role) ? handleToggleSelect : undefined,
    onToggleAll: canEdit(role) ? handleToggleAll : undefined,
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
      {selectedIds.size > 0 && canEdit(role) && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            size="sm"
            onClick={handleBulkClassify}
            disabled={classifying}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {classifying ? "Classifying..." : "Classify Selected"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      )}
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
