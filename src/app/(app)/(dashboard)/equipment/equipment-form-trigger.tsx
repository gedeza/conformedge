"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EquipmentForm } from "./equipment-form"
import { canCreate } from "@/lib/permissions"

interface EquipmentFormTriggerProps {
  projects: { id: string; name: string }[]
  role: string
}

export function EquipmentFormTrigger({ projects, role }: EquipmentFormTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!canCreate(role)) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Register Equipment
      </Button>
      <EquipmentForm open={open} onOpenChange={setOpen} projects={projects} />
    </>
  )
}
