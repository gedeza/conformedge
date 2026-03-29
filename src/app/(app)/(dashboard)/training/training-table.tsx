"use client"

import { useState } from "react"
import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { columns, type TrainingRow } from "./columns"

interface TrainingTableProps {
  data: TrainingRow[]
}

export function TrainingTable({ data }: TrainingTableProps) {
  const [columnFilters, setColumnFilters] = useState<any[]>([])

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No training records found.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link href={`/training/${row.original.id}`} className="block">
                    {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
                  </Link>
                </TableCell>
                {row.getVisibleCells().slice(1).map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
