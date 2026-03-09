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
import { Progress } from "@/components/ui/progress"
import { canEdit, canDelete } from "@/lib/permissions"
import { deriveObjectiveStatus } from "@/lib/objective-status"

export type ObjectiveRow = {
  id: string
  title: string
  status: string
  targetValue: number
  currentValue: number
  unit: string | null
  measurementFrequency: string
  dueDate: Date | null
  createdAt: Date
  standard: { id: string; code: string; name: string } | null
  standardClause: { id: string; clauseNumber: string; title: string } | null
  owner: { id: string; firstName: string; lastName: string } | null
  _count: { measurements: number }
}

interface ColumnActions {
  onEdit: (obj: ObjectiveRow) => void
  onDelete: (obj: ObjectiveRow) => void
  role: string
}

export function getColumns(actions: ColumnActions): ColumnDef<ObjectiveRow>[] {
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
        <Link href={`/objectives/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      id: "derivedStatus",
      header: "Status",
      accessorFn: (row) => deriveObjectiveStatus({
        currentValue: row.currentValue,
        targetValue: row.targetValue,
        dueDate: row.dueDate ? new Date(row.dueDate) : null,
        createdAt: new Date(row.createdAt),
        status: row.status,
      }),
      cell: ({ getValue }) => <StatusBadge type="objective" value={getValue() as string} />,
      filterFn: (row, id, value) => {
        if (!value) return true
        return row.getValue(id) === value
      },
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const pct = row.original.targetValue > 0
          ? Math.min((row.original.currentValue / row.original.targetValue) * 100, 100)
          : 0
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={pct} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {row.original.currentValue}{row.original.unit ? ` ${row.original.unit}` : ""} / {row.original.targetValue}
            </span>
          </div>
        )
      },
    },
    {
      id: "standard",
      header: "Standard",
      cell: ({ row }) => {
        const s = row.original.standard
        const c = row.original.standardClause
        if (!s) return "—"
        return (
          <span className="text-sm">
            {s.code}{c ? ` §${c.clauseNumber}` : ""}
          </span>
        )
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.getValue("dueDate") as Date | null
        return date ? format(new Date(date), "MMM d, yyyy") : "—"
      },
    },
    {
      id: "owner",
      header: "Owner",
      cell: ({ row }) => {
        const o = row.original.owner
        return o ? `${o.firstName} ${o.lastName}` : "—"
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
