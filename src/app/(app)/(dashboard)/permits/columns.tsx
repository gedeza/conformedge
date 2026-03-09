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

export type PermitRow = {
  id: string
  title: string
  permitNumber: string | null
  permitType: string
  status: string
  riskLevel: string
  location: string
  validFrom: Date
  validTo: Date
  createdAt: Date
  project: { id: string; name: string } | null
  requestedBy: { id: string; firstName: string; lastName: string } | null
  issuedBy: { id: string; firstName: string; lastName: string } | null
  _count: { checklistItems: number; extensions: number }
}

interface ColumnActions {
  onEdit: (permit: PermitRow) => void
  onDelete: (permit: PermitRow) => void
  role: string
}

export function getColumns(actions: ColumnActions): ColumnDef<PermitRow>[] {
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
        <div>
          <Link href={`/permits/${row.original.id}`} className="font-medium hover:underline">
            {row.getValue("title")}
          </Link>
          {row.original.permitNumber && (
            <p className="text-xs text-muted-foreground">{row.original.permitNumber}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "permitType",
      header: "Type",
      cell: ({ row }) => <StatusBadge type="permitType" value={row.getValue("permitType")} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="permit" value={row.getValue("status")} />,
    },
    {
      accessorKey: "riskLevel",
      header: "Risk",
      cell: ({ row }) => <StatusBadge type="risk" value={row.getValue("riskLevel")} />,
    },
    {
      id: "validity",
      header: "Validity",
      cell: ({ row }) => (
        <div className="text-xs">
          <div>{format(new Date(row.original.validFrom), "MMM d")} - {format(new Date(row.original.validTo), "MMM d, yyyy")}</div>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <span className="text-sm truncate max-w-[150px] block">{row.getValue("location")}</span>,
    },
    {
      id: "requestedBy",
      header: "Requested By",
      cell: ({ row }) => {
        const r = row.original.requestedBy
        return r ? `${r.firstName} ${r.lastName}` : "-"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isDraft = row.original.status === "DRAFT"
        const isCancelled = row.original.status === "CANCELLED"
        if (!canEdit(actions.role) && !canDelete(actions.role)) return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit(actions.role) && isDraft && (
                <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              {canDelete(actions.role) && (isDraft || isCancelled) && (
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
