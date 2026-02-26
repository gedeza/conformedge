"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ChecklistForm } from "./checklist-form"
import { canCreate } from "@/lib/permissions"

interface ChecklistFormTriggerProps {
  standards: { id: string; code: string; name: string }[]
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
  role: string
}

export function ChecklistFormTrigger({ standards, projects, members, role }: ChecklistFormTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!canCreate(role)) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Checklist
      </Button>
      <ChecklistForm open={open} onOpenChange={setOpen} standards={standards} projects={projects} members={members} />
    </>
  )
}
