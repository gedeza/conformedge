"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { canEdit, canDelete } from "@/lib/permissions"

export type IncidentRow = {
  id: string
  title: string
  description: string | null
  incidentType: string
  status: string
  severity: string
  incidentDate: Date
  location: string | null
  injuredParty: string | null
  witnesses: string | null
  immediateAction: string | null
  rootCause: string | null
  rootCauseData: unknown
  incidentTime: string | null
  lostDays: number | null
  bodyPartInjured: string | null
  natureOfInjury: string | null
  treatmentType: string | null
  contributingFactors: unknown
  isReportable: boolean
  mhsaSection: string | null
  investigationDue: Date | null
  // Personnel involved
  victimOccupation: string | null
  victimStaffNo: string | null
  victimDepartment: string | null
  victimIdNumber: string | null
  victimNationality: string | null
  victimContractor: string | null
  immediateSupervisor: string | null
  // Medical treatment
  victimDateOfBirth: Date | null
  treatingDoctor: string | null
  hospitalClinic: string | null
  // Consequence & Impact
  estimatedCost: unknown // Decimal
  spillVolume: unknown // Decimal
  impactAreas: unknown // Json
  nonInjuriousType: string | null
  // Outcome
  returnedToWork: boolean | null
  returnedToWorkDate: Date | null
  createdAt: Date
  project: { id: string; name: string } | null
  reportedBy: { id: string; firstName: string; lastName: string } | null
  investigator: { id: string; firstName: string; lastName: string } | null
  capa: { id: string; title: string; status: string } | null
}

interface ColumnActions {
  onEdit: (incident: IncidentRow) => void
  onDelete: (incident: IncidentRow) => void
  role: string
}

export function getColumns(actions: ColumnActions): ColumnDef<IncidentRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`/incidents/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      accessorKey: "incidentType",
      header: "Type",
      cell: ({ row }) => <StatusBadge type="incidentType" value={row.getValue("incidentType")} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="incident" value={row.getValue("status")} />,
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => <StatusBadge type="risk" value={row.getValue("severity")} />,
    },
    {
      accessorKey: "incidentDate",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => format(new Date(row.getValue("incidentDate")), "MMM d, yyyy"),
    },
    {
      id: "reportedBy",
      header: "Reported By",
      cell: ({ row }) => {
        const r = row.original.reportedBy
        return r ? `${r.firstName} ${r.lastName}` : "—"
      },
    },
    {
      id: "investigator",
      header: "Investigator",
      cell: ({ row }) => {
        const inv = row.original.investigator
        return inv ? `${inv.firstName} ${inv.lastName}` : "Unassigned"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        if (!canEdit(actions.role) && !canDelete(actions.role)) return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit(actions.role) && (
                <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              {canDelete(actions.role) && (
                <DropdownMenuItem onClick={() => actions.onDelete(row.original)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
