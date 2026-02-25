"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CapaForm } from "./capa-form"

interface CapaFormTriggerProps {
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
}

export function CapaFormTrigger({ projects, members }: CapaFormTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New CAPA
      </Button>
      <CapaForm open={open} onOpenChange={setOpen} projects={projects} members={members} />
    </>
  )
}
