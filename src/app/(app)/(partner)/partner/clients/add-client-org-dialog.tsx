"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { addClientOrganization } from "../actions"
import { PARTNER_CLIENT_SIZES } from "@/lib/constants"

export function AddClientOrgDialog() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [orgId, setOrgId] = useState("")
  const [clientSize, setClientSize] = useState<string>("SMALL")
  const [customFee, setCustomFee] = useState("")
  const [notes, setNotes] = useState("")

  function handleSubmit() {
    if (!orgId.trim()) {
      toast.error("Organization ID is required")
      return
    }

    startTransition(async () => {
      const result = await addClientOrganization({
        organizationId: orgId.trim(),
        clientSize: clientSize as "SMALL" | "MEDIUM" | "LARGE",
        customFeeCents: customFee ? Math.round(parseFloat(customFee) * 100) : null,
        notes: notes || undefined,
      })

      if (result.success) {
        toast.success("Client organization added")
        setOpen(false)
        setOrgId("")
        setClientSize("SMALL")
        setCustomFee("")
        setNotes("")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Client Organization</DialogTitle>
          <DialogDescription>
            Link an existing organization to your partner account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgId">Organization ID</Label>
            <Input
              id="orgId"
              placeholder="Paste the organization UUID"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The client&apos;s organization ID from their Settings page.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientSize">Client Size</Label>
            <Select value={clientSize} onValueChange={setClientSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PARTNER_CLIENT_SIZES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label} — {config.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customFee">Custom Monthly Fee (R)</Label>
            <Input
              id="customFee"
              type="number"
              placeholder="Leave empty to use default for size"
              value={customFee}
              onChange={(e) => setCustomFee(e.target.value)}
              min={0}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Overrides the default tier fee for this client.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes about this client"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? "Adding..." : "Add Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
