"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/shared/date-picker"
import { MEASUREMENT_FREQUENCIES } from "@/lib/constants"
import { createObjective, updateObjective, getClausesForStandard, type ObjectiveFormValues } from "./actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  targetValue: z.coerce.number().positive("Target must be positive"),
  unit: z.string().max(50).optional(),
  measurementFrequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]),
  dueDate: z.coerce.date().optional(),
  standardId: z.string().optional(),
  standardClauseId: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
})

interface ObjectiveFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  objective?: {
    id: string
    title: string
    description: string | null
    targetValue: number
    unit: string | null
    measurementFrequency: string
    dueDate: Date | null
    standardId: string | null
    standardClauseId: string | null
    ownerId: string
  }
  standards: { id: string; code: string; name: string }[]
  members: { id: string; name: string }[]
}

export function ObjectiveForm({ open, onOpenChange, objective, standards, members }: ObjectiveFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!objective

  const [clauses, setClauses] = useState<{ id: string; clauseNumber: string; title: string }[]>([])
  const [selectedStandardId, setSelectedStandardId] = useState(objective?.standardId || "")

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: objective?.title ?? "",
      description: objective?.description ?? "",
      targetValue: objective?.targetValue ?? 100,
      unit: objective?.unit ?? "",
      measurementFrequency: (objective?.measurementFrequency as ObjectiveFormValues["measurementFrequency"]) ?? "MONTHLY",
      dueDate: objective?.dueDate ?? undefined,
      standardId: objective?.standardId ?? undefined,
      standardClauseId: objective?.standardClauseId ?? undefined,
      ownerId: objective?.ownerId ?? "",
    },
  })

  useEffect(() => {
    if (selectedStandardId) {
      getClausesForStandard(selectedStandardId).then(setClauses)
    } else {
      setClauses([])
    }
  }, [selectedStandardId])

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = isEditing
        ? await updateObjective(objective.id, values)
        : await createObjective(values)

      if (result.success) {
        toast.success(isEditing ? "Objective updated" : "Objective created")
        onOpenChange(false)
        form.reset()
        setSelectedStandardId("")
        setClauses([])
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Objective" : "New Objective"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="e.g. Reduce customer complaints by 20%" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the objective and how it will be measured..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Value</FormLabel>
                    <FormControl><Input type="number" step="any" placeholder="100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl><Input placeholder="e.g. %, hours, defects" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="measurementFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(MEASUREMENT_FREQUENCIES).map(([v, c]) => (
                          <SelectItem key={v} value={v}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger></FormControl>
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

            {/* Standard & Clause linking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="standardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISO Standard (optional)</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        setSelectedStandardId(val)
                        form.setValue("standardClauseId", undefined)
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {standards.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="standardClauseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clause (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={clauses.length === 0}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder={clauses.length === 0 ? "Select standard first" : "None"} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {clauses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>§{c.clauseNumber} — {c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
