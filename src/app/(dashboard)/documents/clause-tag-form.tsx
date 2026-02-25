"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { addClauseTag } from "./actions"

interface Standard {
  id: string
  code: string
  name: string
  clauses: { id: string; clauseNumber: string; title: string }[]
}

interface ClauseTagFormProps {
  documentId: string
  standards: Standard[]
}

export function ClauseTagForm({ documentId, standards }: ClauseTagFormProps) {
  const [selectedStandard, setSelectedStandard] = useState("")
  const [selectedClause, setSelectedClause] = useState("")
  const [isPending, startTransition] = useTransition()

  const currentStandard = standards.find((s) => s.id === selectedStandard)

  function handleAdd() {
    if (!selectedClause) return

    startTransition(async () => {
      const result = await addClauseTag(documentId, selectedClause)
      if (result.success) {
        toast.success("Clause tag added")
        setSelectedStandard("")
        setSelectedClause("")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex items-end gap-2">
      <div className="space-y-1">
        <label className="text-sm font-medium">Standard</label>
        <Select
          value={selectedStandard}
          onValueChange={(v) => { setSelectedStandard(v); setSelectedClause("") }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select standard" />
          </SelectTrigger>
          <SelectContent>
            {standards.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.code}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Clause</label>
        <Select
          value={selectedClause}
          onValueChange={setSelectedClause}
          disabled={!selectedStandard}
        >
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Select clause" />
          </SelectTrigger>
          <SelectContent>
            {currentStandard?.clauses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.clauseNumber} — {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleAdd} disabled={!selectedClause || isPending} size="sm">
        <Plus className="mr-1 h-4 w-4" />
        {isPending ? "Adding..." : "Add"}
      </Button>
    </div>
  )
}
