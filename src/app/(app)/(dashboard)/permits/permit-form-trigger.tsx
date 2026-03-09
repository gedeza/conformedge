"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PermitForm } from "./permit-form"
import { canCreate } from "@/lib/permissions"

interface PermitFormTriggerProps {
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
  role: string
}

export function PermitFormTrigger({ projects, members, role }: PermitFormTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!canCreate(role)) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Permit
      </Button>
      <PermitForm open={open} onOpenChange={setOpen} projects={projects} members={members} />
    </>
  )
}
