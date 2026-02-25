"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { format, isBefore } from "date-fns"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"

export type CapaRow = {
  id: string
  title: string
  type: string
  status: string
  priority: string
  dueDate: Date | null
  createdAt: Date
  project: { id: string; name: string } | null
  assignedTo: { firstName: string; lastName: string } | null
  _count: { capaActions: number }
}

interface ColumnActions {
  onEdit: (capa: CapaRow) => void
  onDelete: (capa: CapaRow) => void
}

export function getColumns(actions: ColumnActions): ColumnDef<CapaRow>[] {
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
        <Link href={`/capas/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <StatusBadge type="priority" value={row.getValue("type") === "CORRECTIVE" ? "MEDIUM" : "LOW"} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const dueDate = row.original.dueDate
        const isOverdue = dueDate && status !== "CLOSED" && isBefore(new Date(dueDate), new Date())
        return <StatusBadge type="capa" value={isOverdue ? "OVERDUE" : status} />
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => <StatusBadge type="priority" value={row.getValue("priority")} />,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.getValue("dueDate") as Date | null
        return date ? format(date, "MMM d, yyyy") : "—"
      },
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => {
        const a = row.original.assignedTo
        return a ? `${a.firstName} ${a.lastName}` : "Unassigned"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onDelete(row.original)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
