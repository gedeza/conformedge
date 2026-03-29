"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ObligationForm } from "./obligation-form"

interface Props {
  vendors: { id: string; name: string }[]
  projects: { id: string; name: string }[]
  members: { id: string; firstName: string; lastName: string }[]
  clauses: { id: string; clauseNumber: string; title: string; standard: { code: string; name: string } }[]
}

export function ObligationFormTrigger({ vendors, projects, members, clauses }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" /> New Obligation
      </Button>
      <ObligationForm
        open={open}
        onOpenChange={setOpen}
        vendors={vendors}
        projects={projects}
        members={members}
        clauses={clauses}
      />
    </>
  )
}
