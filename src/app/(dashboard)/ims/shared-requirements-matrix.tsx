"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { SharedRequirementsRow } from "@/lib/ims/types"
import type { CoverageStatus } from "@/app/(dashboard)/gap-analysis/gap-analysis-core"

interface SharedRequirementsMatrixProps {
  rows: SharedRequirementsRow[]
}

const STATUS_CONFIG: Record<CoverageStatus, { label: string; className: string }> = {
  COVERED: { label: "Covered", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  PARTIAL: { label: "Partial", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  GAP: { label: "Gap", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
}

export function SharedRequirementsMatrix({ rows }: SharedRequirementsMatrixProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shared Requirements Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No shared HLS requirements found. This matrix requires at least 2 active standards with cross-references.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Collect all unique standard codes from cells
  const standardCodes = Array.from(
    new Set(rows.flatMap((r) => r.cells.map((c) => c.standardCode)))
  ).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Requirements Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">HLS Clause Group</TableHead>
                {standardCodes.map((code) => (
                  <TableHead key={code} className="text-center min-w-[120px]">
                    {code}
                  </TableHead>
                ))}
                <TableHead className="w-[100px] text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.hlsGroup}
                  className={cn(
                    row.hasInconsistency && "bg-amber-50/50 dark:bg-amber-950/10"
                  )}
                >
                  <TableCell className="font-medium">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground mr-1.5">
                        {row.hlsGroup}.
                      </span>
                      {row.hlsTitle}
                    </div>
                  </TableCell>
                  {standardCodes.map((code) => {
                    const cell = row.cells.find((c) => c.standardCode === code)
                    if (!cell) {
                      return (
                        <TableCell key={code} className="text-center">
                          <span className="text-xs text-muted-foreground">N/A</span>
                        </TableCell>
                      )
                    }
                    const config = STATUS_CONFIG[cell.status]
                    return (
                      <TableCell key={code} className="text-center">
                        <Badge variant="outline" className={cn("text-[10px]", config.className)}>
                          {config.label}
                        </Badge>
                      </TableCell>
                    )
                  })}
                  <TableCell className="text-center">
                    {row.hasInconsistency ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Inconsistent
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Aligned
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
