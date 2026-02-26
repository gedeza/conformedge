"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { RISK_LEVELS } from "@/lib/constants"
import { getColumns, type AssessmentRow } from "./columns"
import { AssessmentForm } from "./assessment-form"
import { deleteAssessment } from "./actions"

interface AssessmentTableProps {
  data: AssessmentRow[]
  standards: { id: string; code: string; name: string }[]
  projects: { id: string; name: string }[]
  role: string
}

export function AssessmentTable({ data, standards, projects, role }: AssessmentTableProps) {
  const [editItem, setEditItem] = useState<AssessmentRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AssessmentRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (a) => setEditItem(a),
    onDelete: (a) => setDeleteTarget(a),
    role,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteAssessment(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Assessment deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(RISK_LEVELS).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search assessments..."
        filterKey="riskLevel"
        filterOptions={filterOptions}
        filterPlaceholder="All risk levels"
      />
      <AssessmentForm
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        assessment={editItem ? {
          id: editItem.id,
          title: editItem.title,
          description: null,
          standardId: "",
          projectId: editItem.project?.id ?? null,
          scheduledDate: editItem.scheduledDate,
        } : undefined}
        standards={standards}
        projects={projects}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Assessment"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
