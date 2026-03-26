"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { VendorForm } from "./vendor-form"
import { canCreate } from "@/lib/permissions"

interface VendorFormTriggerProps {
  role: string
}

export function VendorFormTrigger({ role }: VendorFormTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!canCreate(role)) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Vendor
      </Button>
      <VendorForm open={open} onOpenChange={setOpen} />
    </>
  )
}
