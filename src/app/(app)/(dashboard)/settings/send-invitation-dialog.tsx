"use client"

import { useState, useTransition } from "react"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { sendInvitation } from "./invitation-actions"

const INVITE_ROLES = [
  { value: "ADMIN", label: "Admin", description: "Full access to all features" },
  { value: "MANAGER", label: "Manager", description: "Create and edit entities" },
  { value: "AUDITOR", label: "Auditor", description: "Conduct assessments and audits" },
  { value: "VIEWER", label: "Viewer", description: "Read-only access" },
] as const

export function SendInvitationDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("VIEWER")
  const [customMessage, setCustomMessage] = useState("")

  function resetForm() {
    setEmail("")
    setRole("VIEWER")
    setCustomMessage("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await sendInvitation({
        email: email.trim(),
        role: role as "ADMIN" | "MANAGER" | "AUDITOR" | "VIEWER",
        customMessage: customMessage.trim() || undefined,
      })

      if (result.success) {
        toast.success(`Invitation sent to ${email}`)
        resetForm()
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation email via ConformEdge. The recipient will receive a link to join your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={setRole} disabled={isPending}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVITE_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex flex-col">
                        <span>{r.label}</span>
                        <span className="text-xs text-muted-foreground">{r.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-message">Personal message (optional)</Label>
              <Textarea
                id="invite-message"
                placeholder="Hey, join our team on ConformEdge to help manage our ISO compliance..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                maxLength={500}
                rows={3}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground text-right">
                {customMessage.length}/500
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !email.trim()}>
              {isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
