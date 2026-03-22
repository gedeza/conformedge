"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { INCIDENT_STATUSES } from "@/lib/constants"
import { getColumns, type IncidentRow } from "./columns"
import { IncidentForm } from "./incident-form"
import { deleteIncident } from "./actions"

interface IncidentTableProps {
  data: IncidentRow[]
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
  role: string
}

export function IncidentTable({ data, projects, members, role }: IncidentTableProps) {
  const [editItem, setEditItem] = useState<IncidentRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IncidentRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (i) => setEditItem(i),
    onDelete: (i) => setDeleteTarget(i),
    role,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteIncident(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Incident deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(INCIDENT_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search incidents..."
        filterKey="status"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <IncidentForm
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        incident={editItem ? {
          id: editItem.id,
          title: editItem.title,
          description: editItem.description,
          incidentType: editItem.incidentType,
          severity: editItem.severity,
          incidentDate: editItem.incidentDate,
          location: editItem.location,
          injuredParty: editItem.injuredParty,
          witnesses: editItem.witnesses,
          immediateAction: editItem.immediateAction,
          rootCause: editItem.rootCause,
          rootCauseData: editItem.rootCauseData as import("@/types").RootCauseData | null,
          incidentTime: editItem.incidentTime ?? null,
          lostDays: editItem.lostDays ?? null,
          bodyPartInjured: editItem.bodyPartInjured ?? null,
          natureOfInjury: editItem.natureOfInjury ?? null,
          treatmentType: editItem.treatmentType ?? null,
          contributingFactors: editItem.contributingFactors,
          isReportable: editItem.isReportable ?? false,
          mhsaSection: editItem.mhsaSection ?? null,
          investigationDue: editItem.investigationDue,
          projectId: editItem.project?.id ?? null,
          investigatorId: editItem.investigator?.id ?? null,
          // Personnel involved
          victimOccupation: editItem.victimOccupation ?? null,
          victimStaffNo: editItem.victimStaffNo ?? null,
          victimDepartment: editItem.victimDepartment ?? null,
          victimIdNumber: editItem.victimIdNumber ?? null,
          victimNationality: editItem.victimNationality ?? null,
          victimContractor: editItem.victimContractor ?? null,
          immediateSupervisor: editItem.immediateSupervisor ?? null,
          // Medical treatment
          victimDateOfBirth: editItem.victimDateOfBirth ?? null,
          treatingDoctor: editItem.treatingDoctor ?? null,
          hospitalClinic: editItem.hospitalClinic ?? null,
          // Consequence & Impact
          estimatedCost: editItem.estimatedCost ? Number(editItem.estimatedCost) : null,
          spillVolume: editItem.spillVolume ? Number(editItem.spillVolume) : null,
          impactAreas: editItem.impactAreas,
          nonInjuriousType: editItem.nonInjuriousType ?? null,
          // Outcome
          returnedToWork: editItem.returnedToWork ?? null,
          returnedToWorkDate: editItem.returnedToWorkDate ?? null,
        } : undefined}
        projects={projects}
        members={members}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Incident"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
