"use client"

import { useSearchParams } from "next/navigation"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ReportExportButtons() {
  const searchParams = useSearchParams()

  function exportUrl(type: "csv" | "pdf") {
    const params = new URLSearchParams(searchParams.toString())
    return `/api/reports/${type}${params.toString() ? `?${params}` : ""}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={exportUrl("csv")} download>
            Export CSV
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={exportUrl("pdf")} download>
            Export PDF
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
