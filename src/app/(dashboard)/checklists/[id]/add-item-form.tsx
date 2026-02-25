"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addChecklistItem } from "../actions"

export function AddItemForm({ checklistId }: { checklistId: string }) {
  const [showInput, setShowInput] = useState(false)
  const [description, setDescription] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!description.trim()) return

    startTransition(async () => {
      const result = await addChecklistItem(checklistId, description)
      if (result.success) {
        toast.success("Item added")
        setDescription("")
        setShowInput(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  if (!showInput) {
    return (
      <Button size="sm" variant="outline" onClick={() => setShowInput(true)}>
        <Plus className="mr-1 h-4 w-4" /> Add Item
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Item description"
        className="w-64"
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <Button size="sm" onClick={handleAdd} disabled={isPending}>
        {isPending ? "Adding..." : "Add"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowInput(false)}>Cancel</Button>
    </div>
  )
}
