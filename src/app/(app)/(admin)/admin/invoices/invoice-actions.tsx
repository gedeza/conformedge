"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"
import { adminMarkInvoicePaid } from "./actions"

interface InvoiceActionsProps {
  invoiceId: string
}

export function InvoiceActions({ invoiceId }: InvoiceActionsProps) {
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [bankRef, setBankRef] = useState("")

  function handleMarkPaid() {
    startTransition(async () => {
      const result = await adminMarkInvoicePaid(invoiceId, bankRef || undefined)
      if (result.success) {
        toast.success("Invoice marked as paid")
        setOpen(false)
        setBankRef("")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mark Paid
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Invoice as Paid</DialogTitle>
          <DialogDescription>
            Confirm this invoice has been paid. Optionally add a bank reference number.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Bank Reference (optional)</Label>
            <Input
              placeholder="e.g. FNB-ABC123456"
              value={bankRef}
              onChange={(e) => setBankRef(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleMarkPaid} disabled={pending}>
            {pending ? "Updating..." : "Confirm Paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
