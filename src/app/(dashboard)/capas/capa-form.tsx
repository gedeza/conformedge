"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/shared/date-picker"
import { CAPA_STATUSES, CAPA_PRIORITIES, CAPA_TYPES } from "@/lib/constants"
import { createCapa, updateCapa, type CapaFormValues } from "./actions"
import type { RootCauseData, RootCauseWhy } from "@/types"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["CORRECTIVE", "PREVENTIVE"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "VERIFICATION", "CLOSED"]).default("OPEN"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  rootCause: z.string().max(2000).optional(),
  rootCauseData: z.any().optional(),
  dueDate: z.coerce.date().optional(),
  projectId: z.string().optional(),
  assignedToId: z.string().optional(),
})

const ROOT_CAUSE_CATEGORIES = [
  { value: "human", label: "Human" },
  { value: "machine", label: "Machine" },
  { value: "material", label: "Material" },
  { value: "method", label: "Method" },
  { value: "environment", label: "Environment" },
  { value: "measurement", label: "Measurement" },
] as const

type RootCauseCategory = typeof ROOT_CAUSE_CATEGORIES[number]["value"]

function createEmptyWhy(index: number): RootCauseWhy {
  return { question: `Why ${index + 1}?`, answer: "" }
}

interface CapaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  capa?: {
    id: string
    title: string
    description: string | null
    type: string
    status: string
    priority: string
    rootCause: string | null
    rootCauseData?: RootCauseData | null
    dueDate: Date | null
    projectId: string | null
    assignedToId: string | null
  }
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
}

function parseExistingRootCauseData(capa?: CapaFormProps["capa"]) {
  if (!capa?.rootCauseData) return null
  try {
    const data = capa.rootCauseData as RootCauseData
    if (data.method === "5-whys" || data.method === "simple") return data
    return null
  } catch {
    return null
  }
}

export function CapaForm({ open, onOpenChange, capa, projects, members }: CapaFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!capa

  const existingData = parseExistingRootCauseData(capa)

  const [rcMethod, setRcMethod] = useState<"simple" | "5-whys">(
    existingData?.method ?? "simple"
  )
  const [rcCategory, setRcCategory] = useState<RootCauseCategory | "">(
    existingData?.category ?? ""
  )
  const [whys, setWhys] = useState<RootCauseWhy[]>(
    existingData?.method === "5-whys" && existingData.whys.length > 0
      ? existingData.whys
      : [createEmptyWhy(0)]
  )
  const [fiveWhysRootCause, setFiveWhysRootCause] = useState(
    existingData?.method === "5-whys" ? existingData.rootCause : ""
  )
  const [containmentAction, setContainmentAction] = useState(
    existingData?.containmentAction ?? ""
  )

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: capa?.title ?? "",
      description: capa?.description ?? "",
      type: (capa?.type as CapaFormValues["type"]) ?? "CORRECTIVE",
      status: (capa?.status as CapaFormValues["status"]) ?? "OPEN",
      priority: (capa?.priority as CapaFormValues["priority"]) ?? "MEDIUM",
      rootCause: capa?.rootCause ?? "",
      dueDate: capa?.dueDate ?? undefined,
      projectId: capa?.projectId ?? undefined,
      assignedToId: capa?.assignedToId ?? undefined,
    },
  })

  function addWhy() {
    if (whys.length >= 5) return
    setWhys([...whys, createEmptyWhy(whys.length)])
  }

  function removeWhy(index: number) {
    if (whys.length <= 1) return
    setWhys(whys.filter((_, i) => i !== index))
  }

  function updateWhyAnswer(index: number, answer: string) {
    setWhys(whys.map((w, i) => i === index ? { ...w, answer } : w))
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      let submitValues = { ...values }

      if (rcMethod === "simple") {
        submitValues.rootCauseData = {
          method: "simple" as const,
          whys: [],
          rootCause: values.rootCause ?? "",
        }
      } else {
        const rootCauseData: RootCauseData = {
          method: "5-whys",
          category: rcCategory || undefined,
          whys: whys.filter(w => w.answer.trim()),
          rootCause: fiveWhysRootCause,
          containmentAction: containmentAction || undefined,
        }
        submitValues = {
          ...values,
          rootCauseData,
        }
      }

      const result = isEditing
        ? await updateCapa(capa.id, submitValues)
        : await createCapa(submitValues)

      if (result.success) {
        toast.success(isEditing ? "CAPA updated" : "CAPA created")
        onOpenChange(false)
        form.reset()
        // Reset 5-whys state
        setRcMethod("simple")
        setRcCategory("")
        setWhys([createEmptyWhy(0)])
        setFiveWhysRootCause("")
        setContainmentAction("")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit CAPA" : "New CAPA"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="CAPA title" {...field} /></FormControl>
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
                  <FormControl><Textarea placeholder="Describe the issue..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(CAPA_TYPES).map(([v, c]) => (
                          <SelectItem key={v} value={v}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(CAPA_STATUSES).filter(([k]) => k !== "OVERDUE").map(([v, c]) => (
                          <SelectItem key={v} value={v}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(CAPA_PRIORITIES).map(([v, c]) => (
                          <SelectItem key={v} value={v}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Root Cause Analysis Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Root Cause Analysis</Label>
                <div className="flex rounded-md border">
                  <button
                    type="button"
                    onClick={() => setRcMethod("simple")}
                    className={`px-3 py-1 text-xs font-medium rounded-l-md transition-colors ${
                      rcMethod === "simple"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setRcMethod("5-whys")}
                    className={`px-3 py-1 text-xs font-medium rounded-r-md transition-colors ${
                      rcMethod === "5-whys"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    5-Whys
                  </button>
                </div>
              </div>

              {rcMethod === "simple" ? (
                <FormField
                  control={form.control}
                  name="rootCause"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Root cause analysis..." rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select
                      value={rcCategory}
                      onValueChange={(val) => setRcCategory(val as RootCauseCategory)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOT_CAUSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Why chain */}
                  <div className="space-y-2">
                    {whys.map((w, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Why {index + 1}?</Label>
                          {whys.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWhy(index)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <Textarea
                          value={w.answer}
                          onChange={(e) => updateWhyAnswer(index, e.target.value)}
                          placeholder={`Why did ${index === 0 ? "this problem occur" : "that happen"}?`}
                          rows={1}
                          className="text-sm resize-none min-h-[2.25rem]"
                        />
                      </div>
                    ))}
                    {whys.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addWhy}
                        className="w-full h-7 text-xs"
                        disabled={!whys[whys.length - 1]?.answer.trim()}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Why {whys.length + 1}
                      </Button>
                    )}
                  </div>

                  {/* Final root cause */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Root Cause (final determination)</Label>
                    <Textarea
                      value={fiveWhysRootCause}
                      onChange={(e) => setFiveWhysRootCause(e.target.value)}
                      placeholder="The ultimate root cause determined from the analysis..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Containment action */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Containment Action (optional)</Label>
                    <Textarea
                      value={containmentAction}
                      onChange={(e) => setContainmentAction(e.target.value)}
                      placeholder="Immediate containment action taken..."
                      rows={1}
                      className="text-sm resize-none min-h-[2.25rem]"
                    />
                  </div>
                </div>
              )}
            </div>

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
                    <FormLabel>Assigned To</FormLabel>
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
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project (optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
