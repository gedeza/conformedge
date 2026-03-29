"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { canEdit, canDelete } from "@/lib/permissions"
import { OBLIGATION_TYPES } from "./schema"

export type ObligationRow = {
  id: string
  title: string
  obligationType: string
  status: string
  effectiveDate: Date | null
  expiryDate: Date | null
  vendor: { id: string; name: string } | null
  project: { id: string; name: string } | null
  responsibleUser: { id: string; firstName: string; lastName: string } | null
  document: { id: string; title: string; status: string } | null
  standardClause: { id: string; clauseNumber: string; title: string; standard: { code: string; name: string } } | null
  createdAt: Date
}

interface ColumnActions {
  onEdit: (item: ObligationRow) => void
  onDelete: (item: ObligationRow) => void
  role: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  REVOKED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  NOT_APPLICABLE: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
}

function getTypeLabel(type: string): string {
  return OBLIGATION_TYPES.find((t) => t.value === type)?.label ?? type
}

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
}

function getExpiryBadge(expiryDate: Date | null, status: string) {
  if (!expiryDate || status !== "ACTIVE") return null
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) return <Badge variant="destructive" className="text-xs">Expired</Badge>
  if (daysLeft <= 30) return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">Expires in {daysLeft}d</Badge>
  return null
}

export function getColumns(actions: ColumnActions): ColumnDef<ObligationRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Title <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <Link href={`/obligations/${row.original.id}`} className="font-medium hover:underline">
            {row.getValue("title")}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">{getTypeLabel(row.original.obligationType)}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={STATUS_COLORS[status] ?? ""}>
              {status.replace("_", " ")}
            </Badge>
            {getExpiryBadge(row.original.expiryDate, status)}
          </div>
        )
      },
      filterFn: (row, _id, value) => value.includes(row.getValue("status")),
    },
    {
      accessorKey: "vendor",
      header: "Vendor / Contractor",
      cell: ({ row }) => {
        const vendor = row.original.vendor
        if (!vendor) return <span className="text-muted-foreground">—</span>
        return (
          <Link href={`/vendors/${vendor.id}`} className="hover:underline text-sm">
            {vendor.name}
          </Link>
        )
      },
    },
    {
      accessorKey: "expiryDate",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Expiry <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.expiryDate),
    },
    {
      accessorKey: "standardClause",
      header: "Regulatory Clause",
      cell: ({ row }) => {
        const clause = row.original.standardClause
        if (!clause) return <span className="text-muted-foreground">—</span>
        return (
          <span className="text-sm">
            <span className="font-mono text-xs text-muted-foreground">{clause.standard.code}</span>{" "}
            {clause.clauseNumber}
          </span>
        )
      },
    },
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => {
        const project = row.original.project
        if (!project) return <span className="text-muted-foreground">—</span>
        return <span className="text-sm">{project.name}</span>
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
              <DropdownMenuItem asChild>
                <Link href={`/obligations/${row.original.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> View
                </Link>
              </DropdownMenuItem>
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
