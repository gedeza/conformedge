"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AGENDA_ITEM_TYPES } from "@/lib/constants"
import { addAgendaItem, updateAgendaItem, deleteAgendaItem } from "../actions"
import { canEdit, canDelete } from "@/lib/permissions"

interface AgendaItem {
  id: string
  type: string
  title: string
  notes: string | null
  sortOrder: number
}

interface AgendaItemsCardProps {
  reviewId: string
  items: AgendaItem[]
  role: string
}

export function AgendaItemsCard({ reviewId, items, role }: AgendaItemsCardProps) {
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState("")

  // Add form state
  const [newType, setNewType] = useState<string>("")
  const [newTitle, setNewTitle] = useState("")

  function handleAdd() {
    if (!newType || !newTitle.trim()) {
      toast.error("Type and title are required")
      return
    }
    startTransition(async () => {
      const result = await addAgendaItem(reviewId, {
        type: newType as keyof typeof AGENDA_ITEM_TYPES,
        title: newTitle.trim(),
        sortOrder: items.length,
      })
      if (result.success) {
        toast.success("Agenda item added")
        setNewType("")
        setNewTitle("")
        setShowAdd(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleSaveNotes(itemId: string) {
    startTransition(async () => {
      const result = await updateAgendaItem(itemId, { notes: notesValue })
      if (result.success) {
        toast.success("Notes saved")
        setEditingNotesId(null)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(itemId: string) {
    startTransition(async () => {
      const result = await deleteAgendaItem(itemId)
      if (result.success) {
        toast.success("Agenda item removed")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Agenda Items ({items.length})</CardTitle>
          {canEdit(role) && (
            <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <div className="rounded-md border p-3 space-y-2 bg-muted/30">
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AGENDA_ITEM_TYPES).map(([value, config]) => (
                  <SelectItem key={value} value={value}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Agenda item title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} disabled={isPending}>Add</Button>
            </div>
          </div>
        )}

        {items.length === 0 && !showAdd && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No agenda items yet. Add ISO-required inputs for the review.
          </p>
        )}

        {items.map((item) => {
          const typeConfig = AGENDA_ITEM_TYPES[item.type as keyof typeof AGENDA_ITEM_TYPES]
          const isExpanded = expandedId === item.id
          const isEditingNotes = editingNotesId === item.id

          return (
            <div key={item.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 cursor-pointer flex-1"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : item.id)
                    if (!isExpanded && item.notes) {
                      setNotesValue(item.notes)
                    }
                  }}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Badge variant="secondary" className="text-xs">{typeConfig?.label ?? item.type}</Badge>
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                {canDelete(role) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {isExpanded && (
                <div className="mt-2 pl-6 space-y-2">
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        rows={3}
                        className="text-sm"
                        placeholder="Add discussion notes..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingNotesId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleSaveNotes(item.id)} disabled={isPending}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {item.notes ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No notes recorded.</p>
                      )}
                      {canEdit(role) && (
                        <Button
                          variant="link"
                          size="sm"
                          className="px-0 h-6 text-xs"
                          onClick={() => {
                            setEditingNotesId(item.id)
                            setNotesValue(item.notes ?? "")
                          }}
                        >
                          {item.notes ? "Edit notes" : "Add notes"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
