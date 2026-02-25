"use client"

import { useTransition } from "react"
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
import { SUBCONTRACTOR_TIERS } from "@/lib/constants"
import { createSubcontractor, updateSubcontractor, type SubcontractorFormValues } from "./actions"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  registrationNumber: z.string().max(50).optional(),
  beeLevel: z.coerce.number().min(1).max(8).optional(),
  safetyRating: z.coerce.number().min(0).max(100).optional(),
  tier: z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE", "UNRATED"]).default("UNRATED"),
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
  }
}

export function SubcontractorForm({ open, onOpenChange, subcontractor }: SubcontractorFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!subcontractor

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: subcontractor?.name ?? "",
      registrationNumber: subcontractor?.registrationNumber ?? "",
      beeLevel: subcontractor?.beeLevel ? Number(subcontractor.beeLevel) : undefined,
      safetyRating: subcontractor?.safetyRating ?? undefined,
      tier: (subcontractor?.tier as SubcontractorFormValues["tier"]) ?? "UNRATED",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = isEditing
        ? await updateSubcontractor(subcontractor.id, values)
        : await createSubcontractor(values)

      if (result.success) {
        toast.success(isEditing ? "Subcontractor updated" : "Subcontractor added")
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Subcontractor" : "Add Subcontractor"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ABC Construction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="CIPC registration" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="beeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BEE Level (1-8)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={8} placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="safetyRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Rating (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} placeholder="95" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SUBCONTRACTOR_TIERS).map(([v, c]) => (
                        <SelectItem key={v} value={v}>{c.label}</SelectItem>
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
                {isPending ? "Saving..." : isEditing ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
