"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SubcontractorForm } from "./subcontractor-form"

export function SubcontractorFormTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Subcontractor
      </Button>
      <SubcontractorForm open={open} onOpenChange={setOpen} />
    </>
  )
}
