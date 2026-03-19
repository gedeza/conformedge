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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/shared/date-picker"
import { SUBCONTRACTOR_TIERS } from "@/lib/constants"
import { createSubcontractor, updateSubcontractor, type SubcontractorFormValues } from "./actions"

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
    tradeTypes: unknown // Json
    taxClearanceExpiry: Date | null
    liabilityExpiry: Date | null
  }
}

export function SubcontractorForm({ open, onOpenChange, subcontractor }: SubcontractorFormProps) {
  const [isPending, startTransition] = useTransition()
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
        name: "",
        registrationNumber: "",
        beeLevel: undefined,
        safetyRating: undefined,
        tier: "UNRATED",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        physicalAddress: "",
        taxClearanceExpiry: undefined,
        liabilityExpiry: undefined,
      })
      setSelectedTrades([])
    }
  }, [subcontractor, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const submitValues = {
        ...values,
        tradeTypes: selectedTrades.length > 0 ? selectedTrades : undefined,
      }
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Subcontractor" : "Add Subcontractor"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">

            {/* Section 1: Company Details */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Company Details</Label>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Company Name</FormLabel>
                  <FormControl><Input placeholder="e.g. ABC Construction (Pty) Ltd" {...field} className="h-8 text-xs" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="registrationNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">CIPC Registration No</FormLabel>
                    <FormControl><Input placeholder="e.g. 2020/123456/07" {...field} className="h-8 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="physicalAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Physical Address</FormLabel>
                    <FormControl><Input placeholder="City / Province" {...field} className="h-8 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Contact Information</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField control={form.control} name="contactPerson" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Contact Person</FormLabel>
                    <FormControl><Input placeholder="Full name" {...field} className="h-8 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Email</FormLabel>
                    <FormControl><Input type="email" placeholder="email@company.co.za" {...field} className="h-8 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Phone</FormLabel>
                    <FormControl><Input placeholder="083 123 4567" {...field} className="h-8 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Section 3: Compliance & Rating */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Compliance &amp; Rating</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField control={form.control} name="beeLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">B-BBEE Level</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
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
                    <FormLabel className="text-xs">Safety Rating (%)</FormLabel>
                    <FormControl><Input type="number" min={0} max={100} placeholder="e.g. 95" {...field} value={field.value ?? ""} className="h-8 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tier" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select tier" /></SelectTrigger></FormControl>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="taxClearanceExpiry" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tax Clearance Expiry</FormLabel>
                    <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="liabilityExpiry" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Public Liability Expiry</FormLabel>
                    <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Section 4: Trade Types */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">
                Trade Types
                {selectedTrades.length > 0 && (
                  <span className="ml-1 text-blue-600 font-normal">({selectedTrades.length} selected)</span>
                )}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 rounded-md border p-2 bg-background">
                {TRADE_OPTIONS.map(trade => (
                  <label key={trade} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={selectedTrades.includes(trade)}
                      onChange={() => {
                        setSelectedTrades(prev =>
                          prev.includes(trade) ? prev.filter(t => t !== trade) : [...prev, trade]
                        )
                      }}
                      className="rounded border-gray-300 h-3 w-3 accent-blue-600"
                    />
                    {trade}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
