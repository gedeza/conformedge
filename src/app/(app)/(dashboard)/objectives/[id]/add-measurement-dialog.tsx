"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Gauge } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addMeasurement } from "../actions"

const schema = z.object({
  value: z.coerce.number(),
  notes: z.string().max(500).optional(),
})

interface AddMeasurementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  objectiveId: string
  unit: string | null
  targetValue: number
}

export function AddMeasurementDialog({ open, onOpenChange, objectiveId, unit, targetValue }: AddMeasurementDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof schema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { value: 0, notes: "" },
  })

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      const result = await addMeasurement(objectiveId, values)
      if (result.success) {
        toast.success("Measurement recorded")
        onOpenChange(false)
        form.reset()
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Record Measurement
          </DialogTitle>
          <DialogDescription>
            Target: {targetValue}{unit ? ` ${unit}` : ""}. Enter the current measured value.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="value" render={({ field }) => (
              <FormItem>
                <FormLabel>Value{unit ? ` (${unit})` : ""} *</FormLabel>
                <FormControl><Input type="number" step="any" placeholder={`Target: ${targetValue}`} {...field} className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea placeholder="Any context about this measurement..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Record Measurement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
