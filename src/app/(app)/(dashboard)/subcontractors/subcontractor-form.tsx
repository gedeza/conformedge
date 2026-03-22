"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  ChevronRight, ChevronLeft, Check,
  Building2, Contact, ShieldCheck, Hammer,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/shared/date-picker"
import { SUBCONTRACTOR_TIERS } from "@/lib/constants"
import { createSubcontractor, updateSubcontractor, type SubcontractorFormValues } from "./actions"

/* ─────────────── Constants ─────────────── */

const TRADE_OPTIONS = [
  "Civil", "Structural", "Electrical", "Mechanical", "Plumbing",
  "HVAC", "Fire Protection", "Painting", "Scaffolding", "Demolition",
  "Earthworks", "Piling", "Roofing", "Welding", "Other",
] as const

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  registrationNumber: z.string().max(50).optional(),
  beeLevel: z.coerce.number().min(1).max(8).optional(),
  safetyRating: z.coerce.number().min(0).max(100).optional(),
  tier: z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE", "UNRATED"]).default("UNRATED"),
  contactPerson: z.string().max(200).optional(),
  contactEmail: z.string().email().max(200).optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional(),
  physicalAddress: z.string().max(500).optional(),
  taxClearanceExpiry: z.coerce.date().optional(),
  liabilityExpiry: z.coerce.date().optional(),
})

/* ─────────────── Steps ─────────────── */

const STEPS = [
  { id: "company", title: "Company Details", description: "Registration and address", icon: Building2 },
  { id: "contact", title: "Contact Info", description: "People and numbers", icon: Contact },
  { id: "compliance", title: "Compliance", description: "Ratings and certifications", icon: ShieldCheck },
  { id: "trades", title: "Trade Types", description: "Services offered", icon: Hammer },
] as const

type StepId = typeof STEPS[number]["id"]

const STEP_FIELDS: Record<StepId, string[]> = {
  company: ["name"],
  contact: [],
  compliance: [],
  trades: [],
}

/* ─────────────── Step Indicator ─────────────── */

function StepIndicator({ steps, currentStep, onStepClick, completedSteps }: {
  steps: typeof STEPS
  currentStep: number
  onStepClick: (index: number) => void
  completedSteps: Set<number>
}) {
  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index === currentStep
        const isCompleted = completedSteps.has(index)
        const isPast = index < currentStep
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => onStepClick(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left w-full ${
                isActive ? "bg-primary text-primary-foreground shadow-sm"
                : isCompleted || isPast ? "bg-primary/10 text-primary hover:bg-primary/15"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-semibold ${
                isActive ? "bg-primary-foreground/20 text-primary-foreground"
                : isCompleted ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-muted-foreground"
              }`}>
                {isCompleted && !isActive ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-xs font-medium truncate">{step.title}</p>
                <p className={`text-[10px] truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{step.description}</p>
              </div>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className={`h-4 w-4 shrink-0 mx-1 ${isPast ? "text-primary" : "text-muted-foreground/40"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────── Props ─────────────── */

interface SubcontractorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subcontractor?: {
    id: string
    name: string
    registrationNumber: string | null
    beeLevel: string | null
    safetyRating: number | null
    tier: string
    contactPerson: string | null
    contactEmail: string | null
    contactPhone: string | null
    physicalAddress: string | null
    tradeTypes: unknown
    taxClearanceExpiry: Date | null
    liabilityExpiry: Date | null
  }
}

/* ─────────────── Main Component ─────────────── */

export function SubcontractorForm({ open, onOpenChange, subcontractor }: SubcontractorFormProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const isEditing = !!subcontractor
  const [selectedTrades, setSelectedTrades] = useState<string[]>(
    (subcontractor?.tradeTypes as string[]) ?? []
  )

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: subcontractor?.name ?? "",
      registrationNumber: subcontractor?.registrationNumber ?? "",
      beeLevel: subcontractor?.beeLevel ? Number(subcontractor.beeLevel) : undefined,
      safetyRating: subcontractor?.safetyRating ?? undefined,
      tier: (subcontractor?.tier as SubcontractorFormValues["tier"]) ?? "UNRATED",
      contactPerson: subcontractor?.contactPerson ?? "",
      contactEmail: subcontractor?.contactEmail ?? "",
      contactPhone: subcontractor?.contactPhone ?? "",
      physicalAddress: subcontractor?.physicalAddress ?? "",
      taxClearanceExpiry: subcontractor?.taxClearanceExpiry ?? undefined,
      liabilityExpiry: subcontractor?.liabilityExpiry ?? undefined,
    },
  })

  useEffect(() => {
    if (subcontractor) {
      form.reset({
        name: subcontractor.name,
        registrationNumber: subcontractor.registrationNumber ?? "",
        beeLevel: subcontractor.beeLevel ? Number(subcontractor.beeLevel) : undefined,
        safetyRating: subcontractor.safetyRating ?? undefined,
        tier: (subcontractor.tier as SubcontractorFormValues["tier"]) ?? "UNRATED",
        contactPerson: subcontractor.contactPerson ?? "",
        contactEmail: subcontractor.contactEmail ?? "",
        contactPhone: subcontractor.contactPhone ?? "",
        physicalAddress: subcontractor.physicalAddress ?? "",
        taxClearanceExpiry: subcontractor.taxClearanceExpiry ?? undefined,
        liabilityExpiry: subcontractor.liabilityExpiry ?? undefined,
      })
      setSelectedTrades((subcontractor.tradeTypes as string[]) ?? [])
    } else {
      form.reset({
        name: "", registrationNumber: "", beeLevel: undefined, safetyRating: undefined,
        tier: "UNRATED", contactPerson: "", contactEmail: "", contactPhone: "",
        physicalAddress: "", taxClearanceExpiry: undefined, liabilityExpiry: undefined,
      })
      setSelectedTrades([])
    }
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }, [subcontractor, form])

  useEffect(() => { if (!open) { setCurrentStep(0); setCompletedSteps(new Set()) } }, [open])

  /* ── Navigation ── */
  async function goToStep(index: number) {
    if (index > currentStep) {
      const fieldsToValidate = STEP_FIELDS[STEPS[currentStep].id]
      if (fieldsToValidate.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valid = await form.trigger(fieldsToValidate as any)
        if (!valid) return
      }
      setCompletedSteps(prev => new Set([...prev, currentStep]))
    }
    setCurrentStep(index)
  }
  async function nextStep() { await goToStep(currentStep + 1) }
  function prevStep() { setCurrentStep(Math.max(0, currentStep - 1)) }

  /* ── Submit ── */
  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const submitValues = { ...values, tradeTypes: selectedTrades.length > 0 ? selectedTrades : undefined }
      const result = isEditing
        ? await updateSubcontractor(subcontractor.id, submitValues)
        : await createSubcontractor(submitValues)
      if (result.success) {
        toast.success(isEditing ? "Subcontractor updated" : "Subcontractor added")
        onOpenChange(false)
        form.reset()
        setSelectedTrades([])
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="px-6 pt-6 pb-4 border-b space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {isEditing ? "Edit Subcontractor" : "Add Subcontractor"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the subcontractor details." : "Register a new subcontractor with their compliance details."}
            </DialogDescription>
          </DialogHeader>
          <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={goToStep} completedSteps={completedSteps} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form id="subcontractor-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* ═══════════ STEP 1: Company Details ═══════════ */}
              {currentStep === 0 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Company Details</h3>
                  </div>
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl><Input placeholder="e.g. ABC Construction (Pty) Ltd" {...field} className="h-10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="registrationNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>CIPC Registration No.</FormLabel>
                        <FormControl><Input placeholder="e.g. 2020/123456/07" {...field} className="h-10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="physicalAddress" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Physical Address</FormLabel>
                        <FormControl><Input placeholder="City / Province" {...field} className="h-10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              {/* ═══════════ STEP 2: Contact Info ═══════════ */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Contact className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Contact Information</h3>
                  </div>
                  <FormField control={form.control} name="contactPerson" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl><Input placeholder="Full name of primary contact" {...field} className="h-10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="contactEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="email@company.co.za" {...field} className="h-10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="083 123 4567" {...field} className="h-10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              {/* ═══════════ STEP 3: Compliance ═══════════ */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Compliance & Rating</h3>
                  </div>
                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Performance Ratings</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField control={form.control} name="beeLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>B-BBEE Level</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select level..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              {[1,2,3,4,5,6,7,8].map(l => (
                                <SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="safetyRating" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Rating (%)</FormLabel>
                          <FormControl><Input type="number" min={0} max={100} placeholder="e.g. 95" {...field} value={field.value ?? ""} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="tier" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contractor Tier</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select tier..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              {Object.entries(SUBCONTRACTOR_TIERS).map(([v, c]) => (
                                <SelectItem key={v} value={v}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Certification Expiry Dates</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="taxClearanceExpiry" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Clearance Expiry</FormLabel>
                          <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="liabilityExpiry" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Public Liability Expiry</FormLabel>
                          <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════ STEP 4: Trade Types ═══════════ */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Hammer className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Trade Types</h3>
                    {selectedTrades.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">{selectedTrades.length} selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Select all trade types this subcontractor can perform.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-lg border p-4 bg-background">
                    {TRADE_OPTIONS.map(trade => (
                      <label key={trade} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selectedTrades.includes(trade)}
                          onChange={() => {
                            setSelectedTrades(prev =>
                              prev.includes(trade) ? prev.filter(t => t !== trade) : [...prev, trade]
                            )
                          }}
                          className="rounded border-gray-300 h-4 w-4 accent-blue-600"
                        />
                        {trade}
                      </label>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <Label className="text-sm font-semibold">Subcontractor Summary</Label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Company:</span>
                        <span className="ml-2 font-medium">{form.watch("name") || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tier:</span>
                        <span className="ml-2">
                          <Badge variant="outline" className="text-xs">
                            {SUBCONTRACTOR_TIERS[form.watch("tier") as keyof typeof SUBCONTRACTOR_TIERS]?.label}
                          </Badge>
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">B-BBEE:</span>
                        <span className="ml-2">{form.watch("beeLevel") ? `Level ${form.watch("beeLevel")}` : "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trades:</span>
                        <span className="ml-2">{selectedTrades.length > 0 ? selectedTrades.join(", ") : "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </form>
          </Form>
        </div>

        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</div>
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            ) : (
              <Button type="submit" form="subcontractor-form" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Subcontractor" : "Add Subcontractor"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
