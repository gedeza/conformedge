"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"

export type AssessmentRow = {
  id: string
  title: string
  overallScore: number | null
  riskLevel: string | null
  scheduledDate: Date | null
  completedDate: Date | null
  createdAt: Date
  standard: { code: string; name: string }
  project: { id: string; name: string } | null
  assessor: { firstName: string; lastName: string }
  _count: { questions: number }
}

interface ColumnActions {
  onEdit: (a: AssessmentRow) => void
  onDelete: (a: AssessmentRow) => void
}

export function getColumns(actions: ColumnActions): ColumnDef<AssessmentRow>[] {
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
        <Link href={`/assessments/${row.original.id}`} className="font-medium hover:underline">
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
      accessorKey: "overallScore",
      header: "Score",
      cell: ({ row }) => {
        const score = row.getValue("overallScore") as number | null
        return score !== null ? `${score.toFixed(1)}%` : "—"
      },
    },
    {
      accessorKey: "riskLevel",
      header: "Risk",
      cell: ({ row }) => {
        const level = row.getValue("riskLevel") as string | null
        return level ? <StatusBadge type="risk" value={level} /> : "—"
      },
    },
    {
      id: "questions",
      header: "Questions",
      cell: ({ row }) => <span className="text-sm">{row.original._count.questions}</span>,
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
            <DropdownMenuItem asChild>
              <Link href={`/assessments/${row.original.id}/conduct`}>
                <Play className="mr-2 h-4 w-4" /> Conduct
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
