"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ChecklistForm } from "./checklist-form"

interface ChecklistFormTriggerProps {
  standards: { id: string; code: string; name: string }[]
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
}

export function ChecklistFormTrigger({ standards, projects, members }: ChecklistFormTriggerProps) {
  const [open, setOpen] = useState(false)

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
