"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PROJECT_STATUSES } from "@/lib/constants"
import { getColumns, type ProjectRow } from "./columns"
import { ProjectForm } from "./project-form"
import { deleteProject } from "./actions"

interface ProjectTableProps {
  data: ProjectRow[]
}

export function ProjectTable({ data }: ProjectTableProps) {
  const [editProject, setEditProject] = useState<ProjectRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (project) => setEditProject(project),
    onDelete: (project) => setDeleteTarget(project),
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteProject(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Project deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(PROJECT_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search projects..."
        filterKey="status"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <ProjectForm
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        project={editProject ? {
          id: editProject.id,
          name: editProject.name,
          description: null,
          status: editProject.status,
          startDate: editProject.startDate,
          endDate: editProject.endDate,
        } : undefined}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
