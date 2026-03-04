"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AuditPackForm } from "./audit-pack-form"
import { canCreate } from "@/lib/permissions"

interface AuditPackFormTriggerProps {
  projects: { id: string; name: string }[]
  role: string
}

export function AuditPackFormTrigger({ projects, role }: AuditPackFormTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!canCreate(role)) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Audit Pack
      </Button>
      <AuditPackForm open={open} onOpenChange={setOpen} projects={projects} />
    </>
  )
}
