"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface CsvExportButtonProps {
  type: "organizations" | "users" | "subscriptions"
  label?: string
}

export function CsvExportButton({ type, label }: CsvExportButtonProps) {
  function handleExport() {
    window.open(`/api/admin/export?type=${type}`, "_blank")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      {label ?? "Export CSV"}
    </Button>
  )
}
