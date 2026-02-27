"use client"

import { useState, useTransition, useMemo } from "react"
import { toast } from "sonner"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  SelectGroup, SelectLabel,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { addClauseTag } from "./actions"

interface Clause {
  id: string
  clauseNumber: string
  title: string
  description: string | null
  parentId: string | null
}

interface Standard {
  id: string
  code: string
  name: string
  clauses: Clause[]
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

  // Group clauses: top-level parents (no parentId) each contain their children
  const groupedClauses = useMemo(() => {
    if (!currentStandard) return []

    const clauses = currentStandard.clauses
    const parents = clauses.filter((c) => !c.parentId)
    const childMap = new Map<string, Clause[]>()

    for (const clause of clauses) {
      if (clause.parentId) {
        const siblings = childMap.get(clause.parentId) ?? []
        siblings.push(clause)
        childMap.set(clause.parentId, siblings)
      }
    }

    return parents.map((parent) => ({
      parent,
      children: childMap.get(parent.id) ?? [],
    }))
  }, [currentStandard])

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
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Select clause" />
          </SelectTrigger>
          <SelectContent>
            {groupedClauses.map(({ parent, children }) => (
              <SelectGroup key={parent.id}>
                <SelectLabel className="text-xs font-semibold text-muted-foreground">
                  {parent.clauseNumber} — {parent.title}
                </SelectLabel>
                {children.length > 0 ? (
                  children.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.clauseNumber} — {c.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={parent.id}>
                    {parent.clauseNumber} — {parent.title}
                  </SelectItem>
                )}
              </SelectGroup>
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
