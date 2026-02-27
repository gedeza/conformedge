"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  X,
} from "lucide-react"
import { getColumns, type AuditEventRow } from "./columns"
import {
  getAuditEvents,
  exportAuditEvents,
  type AuditEventFilters,
} from "./actions"

interface AuditTrailTableProps {
  initialEvents: AuditEventRow[]
  initialPagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  filterOptions: {
    actions: string[]
    entityTypes: string[]
    users: { id: string; name: string }[]
  }
}

export function AuditTrailTable({
  initialEvents,
  initialPagination,
  filterOptions,
}: AuditTrailTableProps) {
  const [events, setEvents] = useState(initialEvents)
  const [pagination, setPagination] = useState(initialPagination)
  const [filters, setFilters] = useState<AuditEventFilters>({})
  const [detailEvent, setDetailEvent] = useState<AuditEventRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const columns = getColumns({ onViewDetail: setDetailEvent })

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function fetchEvents(newFilters: AuditEventFilters, page: number) {
    startTransition(async () => {
      const result = await getAuditEvents(newFilters, page)
      setEvents(result.events as unknown as AuditEventRow[])
      setPagination(result.pagination)
    })
  }

  function updateFilter(key: keyof AuditEventFilters, value: string) {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    fetchEvents(newFilters, 1)
  }

  function clearFilters() {
    setFilters({})
    fetchEvents({}, 1)
  }

  function goToPage(page: number) {
    fetchEvents(filters, page)
  }

  async function handleExport() {
    try {
      const csv = await exportAuditEvents(filters)
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Audit trail exported")
    } catch {
      toast.error("Failed to export audit trail")
    }
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select
            value={filters.action ?? ""}
            onValueChange={(v) => updateFilter("action", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {filterOptions.actions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.entityType ?? ""}
            onValueChange={(v) =>
              updateFilter("entityType", v === "all" ? "" : v)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              {filterOptions.entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.userId ?? ""}
            onValueChange={(v) => updateFilter("userId", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {filterOptions.users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            placeholder="From"
            value={filters.dateFrom ?? ""}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="w-[150px]"
          />

          <Input
            type="date"
            placeholder="To"
            value={filters.dateTo ?? ""}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className="w-[150px]"
          />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}

          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className={cn("rounded-md border", isPending && "opacity-60")}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No audit events found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {events.length} of {pagination.total} event(s)
            {pagination.totalPages > 1 &&
              ` — Page ${pagination.page} of ${pagination.totalPages}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={
                pagination.page >= pagination.totalPages || isPending
              }
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailEvent}
        onOpenChange={(open) => !open && setDetailEvent(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Event Detail</DialogTitle>
          </DialogHeader>
          {detailEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Action</p>
                  <Badge variant="outline" className="mt-1 font-mono">
                    {detailEvent.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Entity</p>
                  <p className="mt-1 font-medium">{detailEvent.entityType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entity ID</p>
                  <p className="mt-1 font-mono text-xs break-all">
                    {detailEvent.entityId}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p className="mt-1">
                    {detailEvent.user
                      ? `${detailEvent.user.firstName} ${detailEvent.user.lastName}`
                      : "System"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Timestamp</p>
                  <p className="mt-1">
                    {new Date(detailEvent.createdAt).toLocaleString("en-ZA", {
                      timeZone: "Africa/Johannesburg",
                      dateStyle: "full",
                      timeStyle: "medium",
                    })}
                  </p>
                </div>
              </div>
              {detailEvent.metadata &&
                Object.keys(detailEvent.metadata).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Metadata
                    </p>
                    <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-60">
                      {JSON.stringify(detailEvent.metadata, null, 2)}
                    </pre>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
