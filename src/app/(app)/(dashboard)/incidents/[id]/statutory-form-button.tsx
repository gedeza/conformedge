"use client"

import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function StatutoryFormButton({ incidentId, incidentType }: { incidentId: string; incidentType: string }) {
  function download(type: "wcl2" | "saps277") {
    window.open(`/api/incidents/${incidentId}/statutory-form?type=${type}`, "_blank")
  }

  function downloadInvestigationReport() {
    window.open(`/api/incidents/${incidentId}/investigation-report`, "_blank")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Reports & Forms
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={downloadInvestigationReport}>
          Investigation Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download("wcl2")}>
          W.Cl.2 — Injury on Duty (IOD)
        </DropdownMenuItem>
        {incidentType === "FATALITY" && (
          <DropdownMenuItem onClick={() => download("saps277")}>
            SAPS 277 — Fatality Notice
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
