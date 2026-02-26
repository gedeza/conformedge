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
import { canEdit, canDelete } from "@/lib/permissions"

export type DocumentRow = {
  id: string
  title: string
  status: string
  fileType: string | null
  fileSize: number | null
  expiresAt: Date | null
  createdAt: Date
  project: { id: string; name: string } | null
  uploadedBy: { id: string; firstName: string; lastName: string }
  classifications: Array<{
    id: string
    standardClause: {
      clauseNumber: string
      standard: { code: string }
    }
  }>
}

interface ColumnActions {
  onEdit: (doc: DocumentRow) => void
  onDelete: (doc: DocumentRow) => void
  role: string
}

export function getColumns(actions: ColumnActions): ColumnDef<DocumentRow>[] {
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
        <Link href={`/documents/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="document" value={row.getValue("status")} />,
    },
    {
      id: "project",
      header: "Project",
      cell: ({ row }) => {
        const p = row.original.project
        return p ? (
          <Link href={`/projects/${p.id}`} className="hover:underline text-sm">
            {p.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      id: "clauses",
      header: "Classifications",
      cell: ({ row }) => {
        const cls = row.original.classifications
        if (cls.length === 0) return <span className="text-muted-foreground text-sm">None</span>
        return (
          <div className="flex flex-wrap gap-1">
            {cls.slice(0, 3).map((c) => (
              <Badge key={c.id} variant="outline" className="text-xs">
                {c.standardClause.standard.code} {c.standardClause.clauseNumber}
              </Badge>
            ))}
            {cls.length > 3 && (
              <Badge variant="outline" className="text-xs">+{cls.length - 3}</Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => format(row.getValue("createdAt") as Date, "MMM d, yyyy"),
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
