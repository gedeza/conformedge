"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProjectForm } from "./project-form"
import { canCreate } from "@/lib/permissions"

interface ProjectFormTriggerProps {
  role: string
}

export function ProjectFormTrigger({ role }: ProjectFormTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!canCreate(role)) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Project
      </Button>
      <ProjectForm open={open} onOpenChange={setOpen} />
    </>
  )
}
