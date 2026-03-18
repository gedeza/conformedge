"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { createQuotation, updateQuotation } from "./actions"
import type { QuotationDetail } from "./actions"
import { toast } from "sonner"

// ── Form schema — all prices in RANDS (user-friendly) ──

const lineItemSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: z.number().int().min(1, "Min 1"),
  unitPriceRands: z.number().min(0, "Must be 0 or more"),
})

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientCompany: z.string().optional(),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  clientVatNumber: z.string().optional(),
  clientRegNumber: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item"),
  depositPercent: z.number().int().min(0).max(100).optional(),
  validityDays: z.number().int().min(1).default(30),
  notes: z.string().optional(),
  terms: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface QuotationFormProps {
  quotation?: QuotationDetail
}

/** Format number as R XX,XXX.XX */
function formatRands(rands: number): string {
  return `R${rands.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Convert cents (from DB) to rands (for form) */
function centsToRands(cents: number): number {
  return cents / 100
}

/** Convert rands (from form) to cents (for DB) */
function randsToCents(rands: number): number {
  return Math.round(rands * 100)
}

export function QuotationForm({ quotation }: QuotationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Convert existing line items from cents (DB) to rands (form)
  const existingLineItems = quotation
    ? (quotation.lineItems as Array<{ description: string; quantity: number; unitPriceCents: number; totalCents: number }>).map(
        (item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceRands: centsToRands(item.unitPriceCents),
        })
      )
    : undefined

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      clientName: quotation?.clientName ?? "",
      clientCompany: quotation?.clientCompany ?? "",
      clientEmail: quotation?.clientEmail ?? "",
      clientPhone: quotation?.clientPhone ?? "",
      clientAddress: quotation?.clientAddress ?? "",
      clientVatNumber: quotation?.clientVatNumber ?? "",
      clientRegNumber: quotation?.clientRegNumber ?? "",
      lineItems: existingLineItems ?? [{ description: "", quantity: 1, unitPriceRands: 0 }],
      depositPercent: quotation?.depositPercent ?? undefined,
      validityDays: 30,
      notes: quotation?.notes ?? "",
      terms: quotation?.terms ?? "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  })

  // Live calculations — all in Rands
  const watchLineItems = form.watch("lineItems")
  const subtotalRands = watchLineItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPriceRands || 0),
    0
  )
  const vatRands = Math.round(subtotalRands * 0.15 * 100) / 100
  const totalRands = Math.round((subtotalRands + vatRands) * 100) / 100
  const depositPercent = form.watch("depositPercent")
  const depositRands = depositPercent
    ? Math.round(totalRands * (depositPercent / 100) * 100) / 100
    : 0

  function onSubmit(values: FormValues) {
    setError(null)

    // Convert Rands → Cents for the server action (DB stores cents)
    const data = {
      ...values,
      lineItems: values.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPriceCents: randsToCents(item.unitPriceRands),
        totalCents: randsToCents(item.quantity * item.unitPriceRands),
      })),
    }

    startTransition(async () => {
      const result = quotation
        ? await updateQuotation(quotation.id, data)
        : await createQuotation(data)

      if (!result.success) {
        setError(result.error ?? "Something went wrong")
        toast.error(result.error ?? "Something went wrong")
        return
      }

      toast.success(quotation ? "Quotation updated" : "Quotation created")
      if (!quotation && "id" in result && result.id) {
        router.push(`/admin/quotations/${result.id}`)
      } else {
        router.push("/admin/quotations")
      }
      router.refresh()
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Client Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientName">Contact Name *</Label>
            <Input id="clientName" {...form.register("clientName")} />
            {form.formState.errors.clientName && (
              <p className="text-xs text-red-500">{form.formState.errors.clientName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientCompany">Company</Label>
            <Input id="clientCompany" {...form.register("clientCompany")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input id="clientEmail" type="email" {...form.register("clientEmail")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Phone</Label>
            <Input id="clientPhone" {...form.register("clientPhone")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="clientAddress">Address</Label>
            <Textarea id="clientAddress" rows={2} {...form.register("clientAddress")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientVatNumber">VAT Number</Label>
            <Input id="clientVatNumber" {...form.register("clientVatNumber")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientRegNumber">Registration Number</Label>
            <Input id="clientRegNumber" {...form.register("clientRegNumber")} />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            Line Items
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: "", quantity: 1, unitPriceRands: 0 })}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit Price (R)</div>
              <div className="col-span-2 text-right">Line Total</div>
              <div className="col-span-1" />
            </div>
            {fields.map((field, index) => {
              const qty = watchLineItems[index]?.quantity || 0
              const unitPrice = watchLineItems[index]?.unitPriceRands || 0
              const lineTotal = qty * unitPrice
              return (
                <div key={field.id} className="grid sm:grid-cols-12 gap-2 items-start">
                  <div className="sm:col-span-5">
                    <Input
                      placeholder="Description"
                      {...form.register(`lineItems.${index}.description`)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      {...form.register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="e.g. 84990"
                      {...form.register(`lineItems.${index}.unitPriceRands`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-end text-sm font-medium pt-2">
                    {formatRands(lineTotal)}
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length <= 1}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div className="mt-6 flex flex-col items-end space-y-1 border-t pt-4">
            <div className="flex w-72 justify-between text-sm">
              <span className="text-muted-foreground">Subtotal (excl. VAT):</span>
              <span>{formatRands(subtotalRands)}</span>
            </div>
            <div className="flex w-72 justify-between text-sm">
              <span className="text-muted-foreground">VAT (15%):</span>
              <span>{formatRands(vatRands)}</span>
            </div>
            <div className="flex w-72 justify-between text-sm font-bold border-t pt-1">
              <span>Total (incl. VAT):</span>
              <span>{formatRands(totalRands)}</span>
            </div>
            {depositPercent && depositPercent > 0 && (
              <div className="flex w-72 justify-between text-sm font-medium text-amber-700 pt-1">
                <span>Deposit ({depositPercent}%):</span>
                <span>{formatRands(depositRands)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Options</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="depositPercent">Deposit %</Label>
            <Input
              id="depositPercent"
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 50"
              {...form.register("depositPercent", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validityDays">Validity (days)</Label>
            <Input
              id="validityDays"
              type="number"
              min={1}
              {...form.register("validityDays", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Additional notes for the client..."
              {...form.register("notes")}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="terms">Custom Terms (optional)</Label>
            <Textarea
              id="terms"
              rows={3}
              placeholder="Leave blank for default terms..."
              {...form.register("terms")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {quotation ? "Update Quotation" : "Create Quotation"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
