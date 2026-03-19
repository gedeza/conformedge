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
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/shared/date-picker"
import { WORK_PERMIT_TYPES, RISK_LEVELS } from "@/lib/constants"
import { createPermit, updatePermit, type PermitFormValues } from "./actions"

const PPE_OPTIONS = [
  "Hard Hat", "Safety Boots", "Safety Glasses", "Hi-Vis Vest",
  "Gloves (leather)", "Gloves (chemical)", "Respirator / Dust Mask",
  "Full Face Shield", "Welding Shield", "Safety Harness / Lanyard",
  "Hearing Protection", "Fire Retardant Clothing", "Chemical Suit",
  "Life Jacket", "Other",
] as const

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
  const [selectedPPE, setSelectedPPE] = useState<string[]>(
    permit?.ppeRequirements ? permit.ppeRequirements.split(",").map(s => s.trim()).filter(Boolean) : []
  )

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

  const permitType = form.watch("permitType")

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
      setSelectedPPE(permit.ppeRequirements ? permit.ppeRequirements.split(",").map(s => s.trim()).filter(Boolean) : [])
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
      setSelectedPPE([])
    }
  }, [permit, form])

  function togglePPE(item: string) {
    const updated = selectedPPE.includes(item)
      ? selectedPPE.filter(p => p !== item)
      : [...selectedPPE, item]
    setSelectedPPE(updated)
    form.setValue("ppeRequirements", updated.join(", "))
  }

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
      const submitValues = {
        ...values,
        ppeRequirements: selectedPPE.length > 0 ? selectedPPE.join(", ") : undefined,
        checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
      }

      const result = isEditing
        ? await updatePermit(permit.id, submitValues)
        : await createPermit(submitValues)

      if (result.success) {
        toast.success(isEditing ? "Permit updated" : "Permit created")
        onOpenChange(false)
        form.reset()
        setChecklistItems([])
        setSelectedPPE([])
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Permit" : "Create Work Permit"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">

            {/* Section 1: Work Details */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Work Details</Label>
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Work Description / Title</FormLabel>
                  <FormControl><Input placeholder="Brief description of work to be performed" {...field} className="h-8 text-xs" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField control={form.control} name="permitType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Permit Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(WORK_PERMIT_TYPES).map(([v, c]) => (
                          <SelectItem key={v} value={v}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="riskLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Risk Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(RISK_LEVELS).map(([v, c]) => (
                          <SelectItem key={v} value={v}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Location / Site Area</FormLabel>
                    <FormControl><Input placeholder="e.g. Building A, Level 3" {...field} className="h-8 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Scope of Work</FormLabel>
                  <FormControl><Textarea placeholder="Detailed description of the work to be performed..." rows={2} className="text-xs" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Section 2: Hazard & Risk Assessment */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Hazard &amp; Risk Assessment</Label>
              <FormField control={form.control} name="hazardsIdentified" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Hazards Identified</FormLabel>
                  <FormControl><Textarea placeholder="List all identified hazards associated with this work..." rows={2} className="text-xs" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="precautions" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Precautions / Control Measures</FormLabel>
                  <FormControl><Textarea placeholder="Safety measures and controls to mitigate hazards..." rows={2} className="text-xs" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Conditional fields per permit type */}
              {permitType === "HOT_WORK" && (
                <div className="rounded-md bg-red-50/50 dark:bg-red-950/20 p-2 text-xs text-red-800 dark:text-red-200 space-y-1">
                  <p className="font-semibold">Hot Work Requirements:</p>
                  <p>Ensure fire watcher is assigned, fire extinguisher is within 10m, and combustible materials are cleared from the work area. Gas testing must be completed before work begins.</p>
                </div>
              )}
              {permitType === "CONFINED_SPACE" && (
                <div className="rounded-md bg-purple-50/50 dark:bg-purple-950/20 p-2 text-xs text-purple-800 dark:text-purple-200 space-y-1">
                  <p className="font-semibold">Confined Space Requirements:</p>
                  <p>Atmospheric testing (O2, LEL, H2S, CO) must be completed before entry. A standby person must be stationed at the entry point at all times. Rescue plan must be in place.</p>
                </div>
              )}
              {permitType === "WORKING_AT_HEIGHTS" && (
                <div className="rounded-md bg-sky-50/50 dark:bg-sky-950/20 p-2 text-xs text-sky-800 dark:text-sky-200 space-y-1">
                  <p className="font-semibold">Working at Heights Requirements:</p>
                  <p>Fall protection required above 2m. Safety harness must be inspected and anchored. Scaffolding must be certified. Ensure edge protection and toe boards are in place.</p>
                </div>
              )}
              {permitType === "ELECTRICAL" && (
                <div className="rounded-md bg-yellow-50/50 dark:bg-yellow-950/20 p-2 text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                  <p className="font-semibold">Electrical Work Requirements:</p>
                  <p>Lock-out/Tag-out (LOTO) procedures must be followed. Only qualified electricians may perform work. Voltage testing must be completed before work begins.</p>
                </div>
              )}
              {permitType === "EXCAVATION" && (
                <div className="rounded-md bg-amber-50/50 dark:bg-amber-950/20 p-2 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <p className="font-semibold">Excavation Requirements:</p>
                  <p>Underground services must be located and marked. Shoring required for depths exceeding 1.5m. Barricading and signage must be in place around the excavation.</p>
                </div>
              )}
            </div>

            {/* Section 3: Safety Controls & PPE */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">
                Safety Controls &amp; PPE
                {selectedPPE.length > 0 && (
                  <span className="ml-1 text-blue-600 font-normal">({selectedPPE.length} selected)</span>
                )}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 rounded-md border p-2 bg-background">
                {PPE_OPTIONS.map(ppe => (
                  <label key={ppe} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={selectedPPE.includes(ppe)}
                      onChange={() => togglePPE(ppe)}
                      className="rounded border-gray-300 h-3 w-3 accent-blue-600"
                    />
                    {ppe}
                  </label>
                ))}
              </div>
              <FormField control={form.control} name="emergencyProcedures" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Emergency Procedures</FormLabel>
                  <FormControl><Textarea placeholder="Emergency response steps, assembly point, emergency contacts..." rows={2} className="text-xs" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Section 4: Validity & Assignment */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Validity &amp; Assignment</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="validFrom" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Valid From</FormLabel>
                    <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="validTo" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Valid To</FormLabel>
                    <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="projectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="issuedById" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Authorised Issuer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Auto on approval" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Safety Checklist Builder */}
            {!isEditing && (
              <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                <Label className="text-sm font-medium">
                  Safety Checklist Items
                  {checklistItems.length > 0 && (
                    <span className="ml-1 text-blue-600 font-normal">({checklistItems.length})</span>
                  )}
                </Label>
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md bg-background px-2 py-1">
                    <span className="text-xs flex-1">{index + 1}. {item}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add checklist item..."
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem() } }}
                    className="h-8 text-xs"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addChecklistItem} disabled={!newItem.trim()}>
                    <Plus className="h-3.5 w-3.5" />
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
