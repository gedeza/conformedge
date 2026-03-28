"use client"

import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  equipmentId: string
}

export function EquipmentCardButton({ equipmentId }: Props) {
  return (
    <Button
      variant="outline"
      onClick={() => window.open(`/api/equipment/${equipmentId}/card-pdf`, "_blank")}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Download Card
    </Button>
  )
}
