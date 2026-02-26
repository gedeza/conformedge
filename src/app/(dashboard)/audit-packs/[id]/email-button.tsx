"use client"

import { useState, useTransition } from "react"
import { Mail } from "lucide-react"
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
import { toast } from "sonner"

export function EmailButton({ auditPackId, packTitle }: { auditPackId: string; packTitle: string }) {
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState(`Audit Pack: ${packTitle}`)
  const [isPending, startTransition] = useTransition()

  function handleSend() {
    const emails = to.split(",").map((e) => e.trim()).filter(Boolean)
    if (emails.length === 0) {
      toast.error("Please enter at least one email address")
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/audit-packs/${auditPackId}/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: emails.length === 1 ? emails[0] : emails, subject }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          toast.error(data.error ?? "Failed to send email")
          return
        }

        toast.success("Audit pack sent by email")
        setOpen(false)
        setTo("")
      } catch {
        toast.error("Failed to send email")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" /> Send by Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Audit Pack</DialogTitle>
          <DialogDescription>
            Send &quot;{packTitle}&quot; as a PDF attachment via email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="to">Recipient(s)</Label>
            <Input
              id="to"
              type="text"
              placeholder="email@example.com, another@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Separate multiple addresses with commas</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isPending}>
            {isPending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
