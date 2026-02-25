"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus, Check, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/shared/date-picker"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { addCapaAction, toggleCapaActionComplete } from "../actions"

const actionFormSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  dueDate: z.coerce.date().optional(),
  assignedToId: z.string().optional(),
})

interface ActionItemListProps {
  capaId: string
  actions: Array<{
    id: string
    description: string
    isCompleted: boolean
    dueDate: Date | null
    completedDate: Date | null
    assignedTo: { id: string; firstName: string; lastName: string } | null
  }>
  members: { id: string; name: string }[]
}

export function ActionItemList({ capaId, actions, members }: ActionItemListProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof actionFormSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(actionFormSchema) as any,
    defaultValues: { description: "", dueDate: undefined, assignedToId: undefined },
  })

  function onSubmit(values: z.infer<typeof actionFormSchema>) {
    startTransition(async () => {
      const result = await addCapaAction(capaId, values)
      if (result.success) {
        toast.success("Action added")
        form.reset()
        setShowForm(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleToggle(actionId: string) {
    startTransition(async () => {
      const result = await toggleCapaActionComplete(actionId, capaId)
      if (!result.success) toast.error(result.error)
    })
  }

  const completed = actions.filter((a) => a.isCompleted).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Action Items ({completed}/{actions.length} completed)</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> Add Action
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="rounded-md border p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Input placeholder="What needs to be done?" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <DatePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assignedToId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {members.map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? "Adding..." : "Add"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No action items yet.</p>
        ) : (
          <div className="space-y-2">
            {actions.map((action) => (
              <div key={action.id} className="flex items-start gap-3 rounded-md border p-3">
                <Checkbox
                  checked={action.isCompleted}
                  onCheckedChange={() => handleToggle(action.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <p className={action.isCompleted ? "line-through text-muted-foreground" : "font-medium"}>
                    {action.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {action.assignedTo && (
                      <span>{action.assignedTo.firstName} {action.assignedTo.lastName}</span>
                    )}
                    {action.dueDate && <span>Due: {format(action.dueDate, "MMM d")}</span>}
                    {action.completedDate && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                        Done {format(action.completedDate, "MMM d")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
