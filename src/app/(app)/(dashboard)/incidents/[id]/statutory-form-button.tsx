"use client"

import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StatutoryFormButtonProps {
  incidentId: string
  incidentType: string
  mhsaSection?: string
  isReportable?: boolean
}

export function StatutoryFormButton({ incidentId, incidentType, mhsaSection, isReportable }: StatutoryFormButtonProps) {
  function download(type: "wcl2" | "saps277" | "mhsa11" | "mhsa23" | "mhsa24") {
    window.open(`/api/incidents/${incidentId}/statutory-form?type=${type}`, "_blank")
  }

  function downloadInvestigationReport() {
    window.open(`/api/incidents/${incidentId}/investigation-report`, "_blank")
  }

  const showMhsa11 = mhsaSection === "11" || isReportable
  const showMhsa23 = mhsaSection === "23" || isReportable
  const showMhsa24 = mhsaSection === "24"
  const showMhsaForms = showMhsa11 || showMhsa23 || showMhsa24

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
        {showMhsaForms && <DropdownMenuSeparator />}
        {showMhsa11 && (
          <DropdownMenuItem onClick={() => download("mhsa11")}>
            MHSA Section 11 — Serious Accident
          </DropdownMenuItem>
        )}
        {showMhsa23 && (
          <DropdownMenuItem onClick={() => download("mhsa23")}>
            MHSA Section 23 — Dangerous Occurrence
          </DropdownMenuItem>
        )}
        {showMhsa24 && (
          <DropdownMenuItem onClick={() => download("mhsa24")}>
            MHSA Section 24 — Occupational Disease
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
