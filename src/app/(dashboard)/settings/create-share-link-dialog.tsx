"use client"

import { useState, useTransition } from "react"
import { addDays, addHours } from "date-fns"
import { Plus, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import { createShareLink } from "./share-link-actions"

interface CreateShareLinkDialogProps {
  documents: { id: string; title: string }[]
  auditPacks: { id: string; title: string }[]
  prefilledType?: "DOCUMENT" | "AUDIT_PACK" | "PORTAL"
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
  documents,
  auditPacks,
  prefilledType,
  prefilledEntityId,
  trigger,
}: CreateShareLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [type, setType] = useState<"DOCUMENT" | "AUDIT_PACK" | "PORTAL">(prefilledType ?? "DOCUMENT")
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
    setType(prefilledType ?? "DOCUMENT")
    setEntityId(prefilledEntityId ?? "")
    setLabel("")
    setRecipientEmail("")
    setRecipientName("")
    setExpiryPreset("7d")
    setMaxViews("")
    setAllowDownload(true)
    setPortalDocuments(true)
    setPortalAssessments(false)
    setPortalCapas(false)
    setPortalChecklists(false)
    setPortalSubcontractors(false)
    setCreatedUrl(null)
    setCopied(false)
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) resetForm()
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await createShareLink({
        type,
        entityId: type !== "PORTAL" ? entityId : undefined,
        label,
        recipientEmail: recipientEmail || undefined,
        recipientName: recipientName || undefined,
        expiresAt: getExpiryDate(expiryPreset),
        maxViews: maxViews ? parseInt(maxViews, 10) : undefined,
        allowDownload,
        portalConfig: type === "PORTAL" ? {
          documents: portalDocuments,
          assessments: portalAssessments,
          capas: portalCapas,
          checklists: portalChecklists,
          subcontractors: portalSubcontractors,
        } : undefined,
      })

      if (result.success && result.data) {
        setCreatedUrl(result.data.url)
        toast.success("Share link created")
      } else {
        toast.error(result.error ?? "Failed to create share link")
      }
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
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Create Share Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{createdUrl ? "Share Link Created" : "Create Share Link"}</DialogTitle>
          <DialogDescription>
            {createdUrl
              ? "Copy this link — it won't be shown again."
              : "Create a time-limited link for external access."
            }
          </DialogDescription>
        </DialogHeader>

        {createdUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={createdUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This URL contains a secret token. Save it now — it cannot be retrieved later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)} disabled={!!prefilledType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCUMENT">Document</SelectItem>
                  <SelectItem value="AUDIT_PACK">Audit Pack</SelectItem>
                  <SelectItem value="PORTAL">Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "DOCUMENT" && (
              <div className="space-y-2">
                <Label>Document</Label>
                <Select value={entityId} onValueChange={setEntityId} disabled={!!prefilledEntityId}>
                  <SelectTrigger><SelectValue placeholder="Select a document" /></SelectTrigger>
                  <SelectContent>
                    {documents.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === "AUDIT_PACK" && (
              <div className="space-y-2">
                <Label>Audit Pack</Label>
                <Select value={entityId} onValueChange={setEntityId} disabled={!!prefilledEntityId}>
                  <SelectTrigger><SelectValue placeholder="Select an audit pack" /></SelectTrigger>
                  <SelectContent>
                    {auditPacks.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === "PORTAL" && (
              <div className="space-y-2">
                <Label>Portal Sections</Label>
                <div className="space-y-2">
                  {[
                    { id: "documents", label: "Documents", checked: portalDocuments, set: setPortalDocuments },
                    { id: "assessments", label: "Assessments", checked: portalAssessments, set: setPortalAssessments },
                    { id: "capas", label: "CAPAs", checked: portalCapas, set: setPortalCapas },
                    { id: "checklists", label: "Checklists", checked: portalChecklists, set: setPortalChecklists },
                    { id: "subcontractors", label: "Subcontractors", checked: portalSubcontractors, set: setPortalSubcontractors },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox id={item.id} checked={item.checked} onCheckedChange={(v) => item.set(!!v)} />
                      <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. SABS audit 2026" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Name (optional)</Label>
                <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Recipient Email (optional)</Label>
                <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="john@example.com" type="email" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expires In</Label>
                <Select value={expiryPreset} onValueChange={setExpiryPreset}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPIRY_PRESETS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Views (optional)</Label>
                <Input
                  type="number"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  placeholder="Unlimited"
                  min={1}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="allowDownload" checked={allowDownload} onCheckedChange={(v) => setAllowDownload(!!v)} />
              <Label htmlFor="allowDownload" className="font-normal">Allow file downloads</Label>
            </div>
          </div>
        )}

        <DialogFooter>
          {createdUrl ? (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isPending || !label || (type !== "PORTAL" && !entityId)}
            >
              {isPending ? "Creating…" : "Create Link"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
