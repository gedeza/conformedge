"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Banknote,
  Trash2,
  Loader2,
} from "lucide-react"
import {
  sendQuotation,
  acceptQuotation,
  declineQuotation,
  convertToInvoice,
  markQuotationPaid,
  deleteQuotation,
} from "./actions"
import type { QuotationStatus } from "@/generated/prisma/client"
import { toast } from "sonner"

interface QuotationActionsProps {
  quotationId: string
  status: QuotationStatus
}

export function QuotationActions({ quotationId, status }: QuotationActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [bankRef, setBankRef] = useState("")

  function handleAction(
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
    redirectTo?: string
  ) {
    startTransition(async () => {
      const result = await action()
      if (!result.success) {
        toast.error(result.error ?? "Action failed")
        return
      }
      toast.success(successMessage)
      if (redirectTo) {
        router.push(redirectTo)
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Send */}
      {status === "DRAFT" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Mark as Sent
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Sent?</AlertDialogTitle>
              <AlertDialogDescription>
                This marks the quotation as sent to the client. You won&apos;t be able to edit it after this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={() =>
                  handleAction(() => sendQuotation(quotationId), "Quotation marked as sent")
                }
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Accept */}
      {status === "SENT" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-green-700">
              <CheckCircle className="h-3.5 w-3.5" />
              Accept
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Accept Quotation?</AlertDialogTitle>
              <AlertDialogDescription>
                Mark this quotation as accepted by the client.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={() =>
                  handleAction(() => acceptQuotation(quotationId), "Quotation accepted")
                }
              >
                Accept
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Decline */}
      {status === "SENT" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-red-700">
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Decline Quotation?</AlertDialogTitle>
              <AlertDialogDescription>
                Mark this quotation as declined by the client.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700"
                onClick={() =>
                  handleAction(() => declineQuotation(quotationId), "Quotation declined")
                }
              >
                Decline
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Convert to Invoice */}
      {status === "ACCEPTED" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-purple-700">
              <FileText className="h-3.5 w-3.5" />
              Convert to Invoice
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Convert to Proforma Invoice?</AlertDialogTitle>
              <AlertDialogDescription>
                This will assign an invoice number and change the status to Invoiced. A proforma invoice PDF will become available.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={() =>
                  handleAction(
                    () => convertToInvoice(quotationId),
                    "Converted to proforma invoice"
                  )
                }
              >
                Convert
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Mark Paid */}
      {status === "INVOICED" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-green-700">
              <Banknote className="h-3.5 w-3.5" />
              Mark Paid
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Paid?</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm that payment has been received for this invoice.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <Label htmlFor="bankRef">Bank Reference (optional)</Label>
              <Input
                id="bankRef"
                className="mt-1"
                value={bankRef}
                onChange={(e) => setBankRef(e.target.value)}
                placeholder="e.g. FNB-REF-123456"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={() =>
                  handleAction(
                    () => markQuotationPaid(quotationId, bankRef || undefined),
                    "Marked as paid"
                  )
                }
              >
                Confirm Payment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete */}
      {status === "DRAFT" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-red-600">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quotation?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The quotation will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700"
                onClick={() =>
                  handleAction(
                    () => deleteQuotation(quotationId),
                    "Quotation deleted",
                    "/admin/quotations"
                  )
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
