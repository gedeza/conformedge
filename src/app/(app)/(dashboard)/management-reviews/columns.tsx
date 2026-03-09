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
import { Badge } from "@/components/ui/badge"
import { canEdit, canDelete } from "@/lib/permissions"

export type ReviewRow = {
  id: string
  title: string
  status: string
  reviewDate: Date
  location: string | null
  nextReviewDate: Date | null
  facilitator: { id: string; firstName: string; lastName: string }
  standards: { standard: { id: string; code: string; name: string } }[]
  _count: { agendaItems: number; actions: number; attendees: number }
}

interface ColumnActions {
  onEdit: (r: ReviewRow) => void
  onDelete: (r: ReviewRow) => void
  role: string
}

export function getColumns(actions: ColumnActions): ColumnDef<ReviewRow>[] {
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
        <Link href={`/management-reviews/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="managementReview" value={row.getValue("status") as string} />,
      filterFn: (row, id, value) => {
        if (!value) return true
        return row.getValue(id) === value
      },
    },
    {
      accessorKey: "reviewDate",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Review Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => format(new Date(row.getValue("reviewDate") as Date), "MMM d, yyyy"),
    },
    {
      id: "standards",
      header: "Standards",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.standards.map((s) => (
            <Badge key={s.standard.id} variant="outline" className="text-xs">
              {s.standard.code}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "facilitator",
      header: "Facilitator",
      cell: ({ row }) => {
        const f = row.original.facilitator
        return `${f.firstName} ${f.lastName}`
      },
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original._count.agendaItems} agenda, {row.original._count.actions} actions
        </span>
      ),
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
