"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { canEdit, canDelete } from "@/lib/permissions"

export type SubcontractorRow = {
  id: string
  name: string
  registrationNumber: string | null
  beeLevel: string | null
  safetyRating: number | null
  tier: string
  createdAt: Date
  _count: { certifications: number }
  certifications: Array<{ id: string; expiresAt: Date | null }>
}

interface ColumnActions {
  onEdit: (sub: SubcontractorRow) => void
  onDelete: (sub: SubcontractorRow) => void
  role: string
}

function getCertExpiryStatus(certs: Array<{ expiresAt: Date | null }>) {
  const now = new Date()
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  let expired = 0
  let expiring = 0

  for (const cert of certs) {
    if (!cert.expiresAt) continue
    if (new Date(cert.expiresAt) < now) expired++
    else if (new Date(cert.expiresAt) < thirtyDays) expiring++
  }

  return { expired, expiring }
}

export function getColumns(actions: ColumnActions): ColumnDef<SubcontractorRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`/subcontractors/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "tier",
      header: "Tier",
      cell: ({ row }) => <StatusBadge type="subcontractor" value={row.getValue("tier")} />,
    },
    {
      accessorKey: "beeLevel",
      header: "BEE Level",
      cell: ({ row }) => {
        const level = row.getValue("beeLevel") as string | null
        return level ? `Level ${level}` : "—"
      },
    },
    {
      accessorKey: "safetyRating",
      header: "Safety",
      cell: ({ row }) => {
        const rating = row.getValue("safetyRating") as number | null
        return rating !== null ? `${rating.toFixed(0)}%` : "—"
      },
    },
    {
      id: "certifications",
      header: "Certifications",
      cell: ({ row }) => {
        const { expired, expiring } = getCertExpiryStatus(row.original.certifications)
        const total = row.original._count.certifications
        return (
          <div className="flex items-center gap-1">
            <span className="text-sm">{total}</span>
            {expired > 0 && <Badge variant="outline" className="bg-red-100 text-red-800">{expired} expired</Badge>}
            {expiring > 0 && <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{expiring} expiring</Badge>}
          </div>
        )
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
