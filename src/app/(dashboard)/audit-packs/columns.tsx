"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { MoreHorizontal, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"

export type AuditPackRow = {
  id: string
  title: string
  status: string
  generatedAt: Date | null
  createdAt: Date
  project: { id: string; name: string } | null
  createdBy: { firstName: string; lastName: string }
}

interface ColumnActions {
  onDelete: (pack: AuditPackRow) => void
}

export function getColumns(actions: ColumnActions): ColumnDef<AuditPackRow>[] {
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
        <Link href={`/audit-packs/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="auditPack" value={row.getValue("status")} />,
    },
    {
      id: "project",
      header: "Project",
      cell: ({ row }) => {
        const p = row.original.project
        return p ? (
          <Link href={`/projects/${p.id}`} className="hover:underline text-sm">{p.name}</Link>
        ) : "—"
      },
    },
    {
      id: "createdBy",
      header: "Created By",
      cell: ({ row }) => `${row.original.createdBy.firstName} ${row.original.createdBy.lastName}`,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => format(row.getValue("createdAt") as Date, "MMM d, yyyy"),
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
            <DropdownMenuItem onClick={() => actions.onDelete(row.original)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
