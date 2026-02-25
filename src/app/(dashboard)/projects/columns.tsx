"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"

export type ProjectRow = {
  id: string
  name: string
  status: string
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
  _count: {
    documents: number
    assessments: number
    capas: number
    checklists: number
  }
}

interface ColumnActions {
  onEdit: (project: ProjectRow) => void
  onDelete: (project: ProjectRow) => void
}

export function getColumns(actions: ColumnActions): ColumnDef<ProjectRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link
          href={`/projects/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge type="project" value={row.getValue("status")} />
      ),
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        const date = row.getValue("startDate") as Date | null
        return date ? format(date, "MMM d, yyyy") : "—"
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.getValue("endDate") as Date | null
        return date ? format(date, "MMM d, yyyy") : "—"
      },
    },
    {
      id: "counts",
      header: "Items",
      cell: ({ row }) => {
        const c = row.original._count
        return (
          <div className="flex gap-1">
            {c.documents > 0 && <Badge variant="outline">{c.documents} docs</Badge>}
            {c.assessments > 0 && <Badge variant="outline">{c.assessments} assess</Badge>}
            {c.capas > 0 && <Badge variant="outline">{c.capas} CAPAs</Badge>}
            {c.checklists > 0 && <Badge variant="outline">{c.checklists} checks</Badge>}
          </div>
        )
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
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.onDelete(row.original)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
