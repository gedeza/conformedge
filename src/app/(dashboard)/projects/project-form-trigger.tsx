"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProjectForm } from "./project-form"

export function ProjectFormTrigger() {
  const [open, setOpen] = useState(false)

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
