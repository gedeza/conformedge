"use client"

import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EquipmentExportButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.open("/api/equipment/register-pdf", "_blank")}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Export Register
    </Button>
  )
}
