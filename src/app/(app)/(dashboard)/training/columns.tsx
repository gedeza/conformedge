"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { TRAINING_CATEGORIES } from "./schema"

export type TrainingRow = {
  id: string
  title: string
  category: string
  status: string
  trainingDate: Date
  expiryDate: Date | null
  assessmentResult: string | null
  certificateNumber: string | null
  trainee: { id: string; firstName: string; lastName: string }
  site: { id: string; name: string; code: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  EXPIRED: "bg-red-100 text-red-800",
  REVOKED: "bg-gray-100 text-gray-800",
}

function getCategoryLabel(cat: string) {
  return TRAINING_CATEGORIES.find((c) => c.value === cat)?.label ?? cat
}

export const columns: ColumnDef<TrainingRow>[] = [
  {
    accessorKey: "title",
    header: "Training",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">{getCategoryLabel(row.original.category)}</p>
      </div>
    ),
  },
  {
    accessorKey: "trainee",
    header: "Trainee",
    cell: ({ row }) => `${row.original.trainee.firstName} ${row.original.trainee.lastName}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant="outline" className={STATUS_COLORS[status] ?? ""}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => value.includes(row.getValue("status")),
  },
  {
    accessorKey: "trainingDate",
    header: "Date",
    cell: ({ row }) => format(row.original.trainingDate, "PP"),
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry",
    cell: ({ row }) => {
      const expiry = row.original.expiryDate
      if (!expiry) return <span className="text-muted-foreground">—</span>
      const isExpired = row.original.status === "EXPIRED"
      return (
        <div>
          <span>{format(expiry, "PP")}</span>
          {isExpired && <Badge variant="destructive" className="ml-2 text-xs">Expired</Badge>}
        </div>
      )
    },
  },
  {
    accessorKey: "assessmentResult",
    header: "Result",
    cell: ({ row }) => row.original.assessmentResult ?? "—",
  },
  {
    accessorKey: "site",
    header: "Site",
    cell: ({ row }) => row.original.site?.name ?? "—",
  },
]
