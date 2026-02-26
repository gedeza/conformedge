"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { DocumentForm } from "./document-form"
import { canCreate } from "@/lib/permissions"

interface DocumentFormTriggerProps {
  projects: { id: string; name: string }[]
  role: string
}

export function DocumentFormTrigger({ projects, role }: DocumentFormTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!canCreate(role)) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
      <DocumentForm open={open} onOpenChange={setOpen} projects={projects} />
    </>
  )
}
