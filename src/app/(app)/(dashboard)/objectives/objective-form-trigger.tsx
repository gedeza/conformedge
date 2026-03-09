"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ObjectiveForm } from "./objective-form"
import { canCreate } from "@/lib/permissions"

interface ObjectiveFormTriggerProps {
  standards: { id: string; code: string; name: string }[]
  members: { id: string; name: string }[]
  role: string
}

export function ObjectiveFormTrigger({ standards, members, role }: ObjectiveFormTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!canCreate(role)) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Objective
      </Button>
      <ObjectiveForm open={open} onOpenChange={setOpen} standards={standards} members={members} />
    </>
  )
}
