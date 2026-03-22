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
import { canEdit, canDelete } from "@/lib/permissions"

export type EquipmentRow = {
  id: string
  assetNumber: string
  name: string
  description: string | null
  category: string
  manufacturer: string | null
  model: string | null
  serialNumber: string | null
  status: string
  location: string | null
  swl: string | null
  ceMarking: boolean
  purchaseDate: Date | null
  commissionDate: Date | null
  warrantyExpiry: Date | null
  nextCalibrationDue: Date | null
  specifications: unknown
  notes: string | null
  createdAt: Date
  project: { id: string; name: string } | null
  _count: {
    calibrationRecords: number
    maintenanceRecords: number
    repairRecords: number
  }
}

interface ColumnActions {
  onEdit: (item: EquipmentRow) => void
  onDelete: (item: EquipmentRow) => void
  role: string
}

export function getColumns(actions: ColumnActions): ColumnDef<EquipmentRow>[] {
  return [
    {
      accessorKey: "assetNumber",
      header: "Asset #",
      cell: ({ row }) => (
        <Link href={`/equipment/${row.original.id}`} className="font-mono font-medium hover:underline">
          {row.getValue("assetNumber")}
        </Link>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`/equipment/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "serialNumber",
      header: "Serial No.",
      cell: ({ row }) => row.getValue("serialNumber") || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="equipment" value={row.getValue("status")} />,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => row.getValue("location") || "—",
    },
    {
      accessorKey: "nextCalibrationDue",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Next Calibration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("nextCalibrationDue") as Date | null
        if (!date) return "—"
        const isOverdue = new Date(date) < new Date()
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {format(new Date(date), "MMM d, yyyy")}
          </span>
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
                  <Trash2 className="mr-2 h-4 w-4" /> Decommission
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
