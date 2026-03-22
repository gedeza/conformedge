"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  ChevronRight, ChevronLeft, Check,
  Package, MapPin, Settings,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/shared/date-picker"
import { EQUIPMENT_CATEGORIES } from "@/lib/constants"
import { createEquipment, updateEquipment, type EquipmentFormValues } from "./actions"

/* ─────────────── Schema ─────────────── */

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(5000).optional(),
  category: z.string().min(1, "Category is required"),
  manufacturer: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  serialNumber: z.string().max(200).optional(),
  location: z.string().max(500).optional(),
  swl: z.string().max(100).optional(),
  ceMarking: z.boolean().default(false),
  purchaseDate: z.coerce.date().optional(),
  commissionDate: z.coerce.date().optional(),
  warrantyExpiry: z.coerce.date().optional(),
  projectId: z.string().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  notes: z.string().max(5000).optional(),
})

type FormValues = z.infer<typeof formSchema>

/* ─────────────── Steps ─────────────── */

const STEPS = [
  { id: "basic", title: "Basic Information", description: "Equipment identity", icon: Package },
  { id: "location", title: "Dates & Location", description: "Where and when", icon: MapPin },
  { id: "specs", title: "Specifications", description: "Technical details", icon: Settings },
] as const

type StepId = typeof STEPS[number]["id"]

const STEP_FIELDS: Record<StepId, string[]> = {
  basic: ["name", "category"],
  location: [],
  specs: [],
}

/* ─────────────── Props ─────────────── */

interface EquipmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: {
    id: string
    name: string
    description: string | null
    category: string
    manufacturer: string | null
    model: string | null
    serialNumber: string | null
    location: string | null
    swl: string | null
    ceMarking: boolean
    purchaseDate: Date | null
    commissionDate: Date | null
    warrantyExpiry: Date | null
    projectId: string | null
    specifications: Record<string, string> | null
    notes: string | null
  }
  projects: { id: string; name: string }[]
}

export function EquipmentForm({ open, onOpenChange, equipment, projects }: EquipmentFormProps) {
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!equipment

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      category: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      location: "",
      swl: "",
      ceMarking: false,
      projectId: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (open) {
      setStep(0)
      if (equipment) {
        form.reset({
          name: equipment.name,
          description: equipment.description || "",
          category: equipment.category,
          manufacturer: equipment.manufacturer || "",
          model: equipment.model || "",
          serialNumber: equipment.serialNumber || "",
          location: equipment.location || "",
          swl: equipment.swl || "",
          ceMarking: equipment.ceMarking,
          purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate) : undefined,
          commissionDate: equipment.commissionDate ? new Date(equipment.commissionDate) : undefined,
          warrantyExpiry: equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry) : undefined,
          projectId: equipment.projectId || "",
          specifications: equipment.specifications || undefined,
          notes: equipment.notes || "",
        })
      } else {
        form.reset({
          name: "", description: "", category: "", manufacturer: "", model: "",
          serialNumber: "", location: "", swl: "", ceMarking: false,
          projectId: "", notes: "",
        })
      }
    }
  }, [open, equipment, form])

  async function handleNext() {
    const currentStep = STEPS[step]
    const fields = STEP_FIELDS[currentStep.id]
    if (fields.length > 0) {
      const valid = await form.trigger(fields as (keyof FormValues)[])
      if (!valid) return
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  function handleSubmit() {
    startTransition(async () => {
      const values = form.getValues() as EquipmentFormValues
      const result = isEdit
        ? await updateEquipment(equipment!.id, values)
        : await createEquipment(values)

      if (result.success) {
        toast.success(isEdit ? "Equipment updated" : "Equipment registered")
        onOpenChange(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  const currentStep = STEPS[step]
  const isLastStep = step === STEPS.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Equipment" : "Register Equipment"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update equipment details." : "Add new equipment to your asset register."}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = i === step
            const isCompleted = i < step
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors w-full ${
                    isActive ? "bg-primary text-primary-foreground" :
                    isCompleted ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  <div className="text-left hidden sm:block">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs opacity-70">{s.description}</div>
                  </div>
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>
            )
          })}
        </div>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {/* Step 1: Basic Information */}
            {currentStep.id === "basic" && (
              <>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Name *</FormLabel>
                    <FormControl><Input placeholder="e.g. Chain Block 5T" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {EQUIPMENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="manufacturer" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl><Input placeholder="e.g. Kito" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl><Input placeholder="Model number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="serialNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl><Input placeholder="Serial / ID number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Equipment description..." rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            {/* Step 2: Dates & Location */}
            {currentStep.id === "location" && (
              <>
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="e.g. Site A, Warehouse 2" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {projects.length > 0 && (
                  <FormField control={form.control} name="projectId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Project</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <DatePicker value={field.value} onChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="commissionDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Date</FormLabel>
                      <DatePicker value={field.value} onChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="warrantyExpiry" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Expiry</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            {/* Step 3: Specifications */}
            {currentStep.id === "specs" && (
              <>
                <FormField control={form.control} name="swl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safe Working Load (SWL)</FormLabel>
                    <FormControl><Input placeholder="e.g. 5 tonnes" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ceMarking" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>CE Marking</FormLabel>
                      <p className="text-sm text-muted-foreground">Equipment has valid CE marking</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes, proof load formulas, legislation references..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => step > 0 ? setStep(step - 1) : onOpenChange(false)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {step > 0 ? "Back" : "Cancel"}
              </Button>
              <Button type="button" onClick={handleNext} disabled={isPending}>
                {isLastStep ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {isPending ? "Saving..." : isEdit ? "Update Equipment" : "Register Equipment"}
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
