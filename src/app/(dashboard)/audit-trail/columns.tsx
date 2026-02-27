"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type AuditEventRow = {
  id: string
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: Date
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    imageUrl: string | null
  } | null
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
  STATUS_CHANGE: "bg-yellow-100 text-yellow-800",
  TAG_CLAUSE: "bg-purple-100 text-purple-800",
  UNTAG_CLAUSE: "bg-purple-100 text-purple-800",
  ADD_ACTION: "bg-teal-100 text-teal-800",
  COMPLETE_ACTION: "bg-emerald-100 text-emerald-800",
  UNCOMPLETE_ACTION: "bg-orange-100 text-orange-800",
  GENERATE_QUESTIONS: "bg-indigo-100 text-indigo-800",
  CALCULATE_SCORE: "bg-indigo-100 text-indigo-800",
  GENERATE_ITEMS: "bg-indigo-100 text-indigo-800",
  COMPILE: "bg-cyan-100 text-cyan-800",
}

const ENTITY_HREFS: Record<string, string> = {
  Project: "/projects",
  Document: "/documents",
  Assessment: "/assessments",
  Capa: "/capas",
  Checklist: "/checklists",
  Subcontractor: "/subcontractors",
  AuditPack: "/audit-packs",
}

function getMetadataLabel(metadata: Record<string, unknown> | null): string {
  if (!metadata) return ""
  if (metadata.title) return String(metadata.title)
  if (metadata.name) return String(metadata.name)
  if (metadata.description) return String(metadata.description).slice(0, 50)
  return ""
}

interface ColumnOptions {
  onViewDetail: (event: AuditEventRow) => void
}

export function getColumns({ onViewDetail }: ColumnOptions): ColumnDef<AuditEventRow>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d, yyyy HH:mm:ss")}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const action = row.original.action
        const color = ACTION_COLORS[action] ?? "bg-gray-100 text-gray-800"
        return (
          <Badge variant="outline" className={cn(color, "font-mono text-xs")}>
            {action}
          </Badge>
        )
      },
    },
    {
      accessorKey: "entityType",
      header: "Entity",
      cell: ({ row }) => {
        const { entityType, entityId, metadata } = row.original
        const href = ENTITY_HREFS[entityType]
        const label = getMetadataLabel(metadata as Record<string, unknown> | null)

        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{entityType}</span>
            {label && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {href ? (
                  <a href={`${href}/${entityId}`} className="hover:underline">
                    {label}
                  </a>
                ) : (
                  label
                )}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original.user
        if (!user) {
          return <span className="text-sm text-muted-foreground">System</span>
        }
        return (
          <div className="flex items-center gap-2">
            {user.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.imageUrl}
                alt=""
                className="size-6 rounded-full"
              />
            ) : (
              <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            )}
            <span className="text-sm">
              {user.firstName} {user.lastName}
            </span>
          </div>
        )
      },
    },
    {
      id: "detail",
      header: "",
      cell: ({ row }) => {
        const hasMetadata = row.original.metadata && Object.keys(row.original.metadata).length > 0
        if (!hasMetadata) return null
        return (
          <button
            onClick={() => onViewDetail(row.original)}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Details
          </button>
        )
      },
    },
  ]
}
