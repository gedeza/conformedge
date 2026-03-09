"use client"

import { useEffect, useState, useTransition } from "react"
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
import { DatePicker } from "@/components/shared/date-picker"
import { WORK_PERMIT_TYPES, RISK_LEVELS } from "@/lib/constants"
import { createPermit, updatePermit, type PermitFormValues } from "./actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  permitType: z.enum(["HOT_WORK", "CONFINED_SPACE", "WORKING_AT_HEIGHTS", "ELECTRICAL", "EXCAVATION", "LIFTING", "GENERAL"]),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  location: z.string().min(1, "Location is required").max(500),
  description: z.string().min(1, "Description is required").max(5000),
  hazardsIdentified: z.string().max(5000).optional(),
  precautions: z.string().max(5000).optional(),
  ppeRequirements: z.string().max(2000).optional(),
  emergencyProcedures: z.string().max(5000).optional(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  projectId: z.string().optional(),
  issuedById: z.string().optional(),
})

interface PermitFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permit?: {
    id: string
    title: string
    permitType: string
    riskLevel: string
    location: string
    description: string
    hazardsIdentified?: string | null
    precautions?: string | null
    ppeRequirements?: string | null
    emergencyProcedures?: string | null
    validFrom: Date
    validTo: Date
    projectId: string | null
    issuedById: string | null
  }
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
}

export function PermitForm({ open, onOpenChange, permit, projects, members }: PermitFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!permit
  const [checklistItems, setChecklistItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: permit?.title ?? "",
      permitType: (permit?.permitType as PermitFormValues["permitType"]) ?? "GENERAL",
      riskLevel: (permit?.riskLevel as PermitFormValues["riskLevel"]) ?? "MEDIUM",
      location: permit?.location ?? "",
      description: permit?.description ?? "",
      hazardsIdentified: permit?.hazardsIdentified ?? "",
      precautions: permit?.precautions ?? "",
      ppeRequirements: permit?.ppeRequirements ?? "",
      emergencyProcedures: permit?.emergencyProcedures ?? "",
      validFrom: permit?.validFrom ?? new Date(),
      validTo: permit?.validTo ?? new Date(Date.now() + 8 * 60 * 60 * 1000),
      projectId: permit?.projectId ?? undefined,
      issuedById: permit?.issuedById ?? undefined,
    },
  })

  useEffect(() => {
    if (permit) {
      form.reset({
        title: permit.title,
        permitType: (permit.permitType as PermitFormValues["permitType"]) ?? "GENERAL",
        riskLevel: (permit.riskLevel as PermitFormValues["riskLevel"]) ?? "MEDIUM",
        location: permit.location,
        description: permit.description,
        hazardsIdentified: permit.hazardsIdentified ?? "",
        precautions: permit.precautions ?? "",
        ppeRequirements: permit.ppeRequirements ?? "",
        emergencyProcedures: permit.emergencyProcedures ?? "",
        validFrom: permit.validFrom,
        validTo: permit.validTo,
        projectId: permit.projectId ?? undefined,
        issuedById: permit.issuedById ?? undefined,
      })
    } else {
      form.reset({
        title: "",
        permitType: "GENERAL",
        riskLevel: "MEDIUM",
        location: "",
        description: "",
        hazardsIdentified: "",
        precautions: "",
        ppeRequirements: "",
        emergencyProcedures: "",
        validFrom: new Date(),
        validTo: new Date(Date.now() + 8 * 60 * 60 * 1000),
        projectId: undefined,
        issuedById: undefined,
      })
      setChecklistItems([])
    }
  }, [permit, form])

  function addChecklistItem() {
    if (newItem.trim()) {
      setChecklistItems([...checklistItems, newItem.trim()])
      setNewItem("")
    }
  }

  function removeChecklistItem(index: number) {
    setChecklistItems(checklistItems.filter((_, i) => i !== index))
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const submitValues = { ...values, checklistItems: checklistItems.length > 0 ? checklistItems : undefined }

      const result = isEditing
        ? await updatePermit(permit.id, submitValues)
        : await createPermit(submitValues)

      if (result.success) {
        toast.success(isEditing ? "Permit updated" : "Permit created")
        onOpenChange(false)
        form.reset()
        setChecklistItems([])
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Permit" : "Create Work Permit"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Work description" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="permitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permit Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(WORK_PERMIT_TYPES).map(([v, c]) => (
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
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(RISK_LEVELS).map(([v, c]) => (
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="Site / area" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Work</FormLabel>
                  <FormControl><Textarea placeholder="Describe the work to be performed..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hazardsIdentified"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hazards Identified</FormLabel>
                  <FormControl><Textarea placeholder="List identified hazards..." rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="precautions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precautions / Controls</FormLabel>
                  <FormControl><Textarea placeholder="Safety measures and controls..." rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ppeRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PPE Requirements</FormLabel>
                  <FormControl><Textarea placeholder="Hard hat, safety glasses, gloves..." rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyProcedures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Procedures</FormLabel>
                  <FormControl><Textarea placeholder="Emergency response steps..." rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid To</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
              <FormField
                control={form.control}
                name="issuedById"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuer (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Auto on approval" /></SelectTrigger></FormControl>
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

            {/* Safety Checklist Builder */}
            {!isEditing && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Safety Checklist Items</p>
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm flex-1">{index + 1}. {item}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add checklist item..."
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem() } }}
                    className="text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addChecklistItem} disabled={!newItem.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update" : "Create Permit"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
