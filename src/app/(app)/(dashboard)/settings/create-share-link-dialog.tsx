"use client"

import { useState, useTransition } from "react"
import { addDays, addHours } from "date-fns"
import { Plus, Copy, Check, Link2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { createShareLink } from "./share-link-actions"

interface CreateShareLinkDialogProps {
  documents: { id: string; title: string }[]
  auditPacks: { id: string; title: string }[]
  subcontractors?: { id: string; name: string }[]
  prefilledType?: "DOCUMENT" | "AUDIT_PACK" | "PORTAL" | "SUBCONTRACTOR"
  prefilledEntityId?: string
  trigger?: React.ReactNode
}

const EXPIRY_PRESETS = [
  { label: "24 hours", value: "24h" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
] as const

function getExpiryDate(preset: string): Date {
  switch (preset) {
    case "24h": return addHours(new Date(), 24)
    case "7d": return addDays(new Date(), 7)
    case "30d": return addDays(new Date(), 30)
    case "90d": return addDays(new Date(), 90)
    default: return addDays(new Date(), 7)
  }
}

export function CreateShareLinkDialog({
  documents, auditPacks, subcontractors = [],
  prefilledType, prefilledEntityId, trigger,
}: CreateShareLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [type, setType] = useState<"DOCUMENT" | "AUDIT_PACK" | "PORTAL" | "SUBCONTRACTOR">(prefilledType ?? "DOCUMENT")
  const [entityId, setEntityId] = useState(prefilledEntityId ?? "")
  const [label, setLabel] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [expiryPreset, setExpiryPreset] = useState("7d")
  const [maxViews, setMaxViews] = useState("")
  const [allowDownload, setAllowDownload] = useState(true)
  const [portalDocuments, setPortalDocuments] = useState(true)
  const [portalAssessments, setPortalAssessments] = useState(false)
  const [portalCapas, setPortalCapas] = useState(false)
  const [portalChecklists, setPortalChecklists] = useState(false)
  const [portalSubcontractors, setPortalSubcontractors] = useState(false)

  function resetForm() {
    setType(prefilledType ?? "DOCUMENT"); setEntityId(prefilledEntityId ?? "")
    setLabel(""); setRecipientEmail(""); setRecipientName("")
    setExpiryPreset("7d"); setMaxViews(""); setAllowDownload(true)
    setPortalDocuments(true); setPortalAssessments(false); setPortalCapas(false)
    setPortalChecklists(false); setPortalSubcontractors(false)
    setCreatedUrl(null); setCopied(false)
  }

  function handleOpenChange(val: boolean) { setOpen(val); if (!val) resetForm() }

  function handleSubmit() {
    startTransition(async () => {
      const result = await createShareLink({
        type,
        entityId: type !== "PORTAL" ? entityId || undefined : undefined,
        label, recipientEmail: recipientEmail || undefined,
        recipientName: recipientName || undefined,
        expiresAt: getExpiryDate(expiryPreset),
        maxViews: maxViews ? parseInt(maxViews, 10) : undefined,
        allowDownload,
        portalConfig: type === "PORTAL" ? {
          documents: portalDocuments, assessments: portalAssessments,
          capas: portalCapas, checklists: portalChecklists, subcontractors: portalSubcontractors,
        } : undefined,
      })
      if (result.success && result.data) { setCreatedUrl(result.data.url); toast.success("Share link created") }
      else toast.error(result.error ?? "Failed to create share link")
    })
  }

  async function handleCopy() {
    if (!createdUrl) return
    await navigator.clipboard.writeText(createdUrl)
    setCopied(true)
    toast.success("Link copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Create Share Link</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {createdUrl ? "Share Link Created" : "Create Share Link"}
          </DialogTitle>
          <DialogDescription>
            {createdUrl
              ? "Copy this link — it won't be shown again."
              : "Create a time-limited link for external access."}
          </DialogDescription>
        </DialogHeader>

        {createdUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={createdUrl} readOnly className="font-mono text-xs h-10" />
              <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This URL contains a secret token. Save it now — it cannot be retrieved later.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Type & Entity */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-sm font-semibold">What to Share</Label>
              <div className="space-y-3">
                <Select value={type} onValueChange={(v) => setType(v as typeof type)} disabled={!!prefilledType}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCUMENT">Document</SelectItem>
                    <SelectItem value="AUDIT_PACK">Audit Pack</SelectItem>
                    <SelectItem value="PORTAL">Portal</SelectItem>
                    <SelectItem value="SUBCONTRACTOR">Subcontractor</SelectItem>
                  </SelectContent>
                </Select>

                {type === "DOCUMENT" && (
                  <Select value={entityId} onValueChange={setEntityId} disabled={!!prefilledEntityId}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select document..." /></SelectTrigger>
                    <SelectContent>
                      {documents.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}

                {type === "AUDIT_PACK" && (
                  <Select value={entityId} onValueChange={setEntityId} disabled={!!prefilledEntityId}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select audit pack..." /></SelectTrigger>
                    <SelectContent>
                      {auditPacks.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}

                {type === "SUBCONTRACTOR" && (
                  <Select value={entityId} onValueChange={setEntityId} disabled={!!prefilledEntityId}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select subcontractor..." /></SelectTrigger>
                    <SelectContent>
                      {subcontractors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}

                {type === "PORTAL" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Portal Sections</Label>
                    <div className="grid grid-cols-2 gap-2 rounded-md border p-3 bg-background">
                      {[
                        { id: "documents", label: "Documents", checked: portalDocuments, set: setPortalDocuments },
                        { id: "assessments", label: "Assessments", checked: portalAssessments, set: setPortalAssessments },
                        { id: "capas", label: "CAPAs", checked: portalCapas, set: setPortalCapas },
                        { id: "checklists", label: "Checklists", checked: portalChecklists, set: setPortalChecklists },
                        { id: "subcontractors", label: "Subcontractors", checked: portalSubcontractors, set: setPortalSubcontractors },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center gap-2 py-1">
                          <Checkbox id={item.id} checked={item.checked} onCheckedChange={(v) => item.set(!!v)} />
                          <Label htmlFor={item.id} className="font-normal text-sm">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Label & Recipient */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-sm font-semibold">Recipient</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Label *</Label>
                  <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. SABS audit 2026" className="h-10" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Recipient Name</Label>
                    <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="John Smith" className="h-10" />
                  </div>
                  <div>
                    <Label className="text-sm">Recipient Email</Label>
                    <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="john@example.com" type="email" className="h-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-sm font-semibold">Security</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Expires In</Label>
                  <Select value={expiryPreset} onValueChange={setExpiryPreset}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPIRY_PRESETS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Max Views</Label>
                  <Input type="number" value={maxViews} onChange={(e) => setMaxViews(e.target.value)} placeholder="Unlimited" min={1} className="h-10" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="allowDownload" checked={allowDownload} onCheckedChange={(v) => setAllowDownload(!!v)} />
                <Label htmlFor="allowDownload" className="font-normal text-sm">Allow file downloads</Label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {createdUrl ? (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isPending || !label || (type !== "PORTAL" && !entityId)}>
              {isPending ? "Creating..." : "Create Link"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
