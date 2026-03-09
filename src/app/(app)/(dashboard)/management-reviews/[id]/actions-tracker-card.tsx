"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus, Trash2, CheckCircle2, Clock, CircleDot, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/status-badge"
import { DatePicker } from "@/components/shared/date-picker"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { addReviewAction, updateActionStatus, deleteReviewAction } from "../actions"
import { canEdit, canDelete } from "@/lib/permissions"

interface ReviewAction {
  id: string
  description: string
  status: string
  dueDate: Date | null
  completedAt: Date | null
  assignee: { id: string; firstName: string; lastName: string } | null
}

interface ActionsTrackerCardProps {
  reviewId: string
  actions: ReviewAction[]
  members: { id: string; name: string }[]
  role: string
}

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  OPEN: CircleDot,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
}

export function ActionsTrackerCard({ reviewId, actions, members, role }: ActionsTrackerCardProps) {
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [newDescription, setNewDescription] = useState("")
  const [newDueDate, setNewDueDate] = useState<Date | undefined>()
  const [newAssigneeId, setNewAssigneeId] = useState<string>("")

  function handleAdd() {
    if (!newDescription.trim()) {
      toast.error("Description is required")
      return
    }
    startTransition(async () => {
      const result = await addReviewAction(reviewId, {
        description: newDescription.trim(),
        dueDate: newDueDate,
        assigneeId: newAssigneeId || undefined,
      })
      if (result.success) {
        toast.success("Action item added")
        setNewDescription("")
        setNewDueDate(undefined)
        setNewAssigneeId("")
        setShowAdd(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleStatusChange(actionId: string, newStatus: string) {
    startTransition(async () => {
      const result = await updateActionStatus(actionId, newStatus)
      if (result.success) {
        toast.success("Action status updated")
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(actionId: string) {
    startTransition(async () => {
      const result = await deleteReviewAction(actionId)
      if (result.success) {
        toast.success("Action item deleted")
      } else {
        toast.error(result.error)
      }
    })
  }

  const completedCount = actions.filter((a) => a.status === "COMPLETED").length

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Action Items ({completedCount}/{actions.length} completed)
          </CardTitle>
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
            <Input
              placeholder="Action item description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <DatePicker value={newDueDate} onChange={setNewDueDate} />
              <Select value={newAssigneeId} onValueChange={setNewAssigneeId}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Assignee..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} disabled={isPending}>Add</Button>
            </div>
          </div>
        )}

        {actions.length === 0 && !showAdd && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No action items yet. Add actions from the review discussion.
          </p>
        )}

        {actions.map((action) => {
          const Icon = STATUS_ICON[action.status] || CircleDot
          const isTerminal = action.status === "COMPLETED" || action.status === "CANCELLED"

          return (
            <div key={action.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <Icon className={`h-4 w-4 mt-0.5 ${
                    action.status === "COMPLETED" ? "text-green-500" :
                    action.status === "CANCELLED" ? "text-gray-400" :
                    action.status === "IN_PROGRESS" ? "text-yellow-500" :
                    "text-blue-500"
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm ${isTerminal ? "line-through text-muted-foreground" : ""}`}>
                      {action.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {action.assignee && (
                        <span>{action.assignee.firstName} {action.assignee.lastName}</span>
                      )}
                      {action.dueDate && (
                        <span>Due: {format(new Date(action.dueDate), "MMM d, yyyy")}</span>
                      )}
                      {action.completedAt && (
                        <span>Completed: {format(new Date(action.completedAt), "MMM d, yyyy")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {canEdit(role) && !isTerminal && (
                    <Select
                      value={action.status}
                      onValueChange={(v) => handleStatusChange(action.id, v)}
                    >
                      <SelectTrigger className="h-7 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {isTerminal && (
                    <StatusBadge type="reviewAction" value={action.status} />
                  )}
                  {canDelete(role) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(action.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
