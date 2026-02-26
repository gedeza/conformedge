"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { Progress } from "@/components/ui/progress"
import { canEdit, canDelete } from "@/lib/permissions"

export type ChecklistRow = {
  id: string
  title: string
  status: string
  completionPercentage: number
  createdAt: Date
  standard: { code: string; name: string }
  project: { id: string; name: string } | null
  assignedTo: { firstName: string; lastName: string } | null
  _count: { items: number }
}

interface ColumnActions {
  onEdit: (c: ChecklistRow) => void
  onDelete: (c: ChecklistRow) => void
  role: string
}

export function getColumns(actions: ColumnActions): ColumnDef<ChecklistRow>[] {
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
        <Link href={`/checklists/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      id: "standard",
      header: "Standard",
      cell: ({ row }) => <span className="text-sm">{row.original.standard.code}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="checklist" value={row.getValue("status")} />,
    },
    {
      accessorKey: "completionPercentage",
      header: "Progress",
      cell: ({ row }) => {
        const pct = row.getValue("completionPercentage") as number
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={pct} className="h-2 flex-1" />
            <span className="text-sm text-muted-foreground w-10">{pct.toFixed(0)}%</span>
          </div>
        )
      },
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => {
        const a = row.original.assignedTo
        return a ? (
          <span className="text-sm">{a.firstName} {a.lastName}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )
      },
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => <span className="text-sm">{row.original._count.items}</span>,
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
