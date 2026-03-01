"use client"

import { useState, useTransition } from "react"
import { format, differenceInDays } from "date-fns"
import { Shield, Upload, Building2, FileDown, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addPortalCertification } from "./subcontractor-portal-actions"
import { isR2Key } from "@/lib/r2-utils"

interface Certification {
  id: string
  name: string
  issuedBy: string | null
  issuedDate: Date | null
  expiresAt: Date | null
  fileUrl: string | null
  status: string | null
  reviewNotes: string | null
  createdAt: Date
}

interface SubcontractorData {
  id: string
  name: string
  registrationNumber: string | null
  beeLevel: string | null
  safetyRating: number | null
  tier: string
  certifications: Certification[]
}

interface SubcontractorPortalProps {
  subcontractor: SubcontractorData
  token: string
  allowDownload: boolean
}

function getExpiryBadge(expiresAt: Date | null) {
  if (!expiresAt) return <Badge variant="outline">No expiry</Badge>
  const days = differenceInDays(new Date(expiresAt), new Date())
  if (days < 0) return <Badge variant="outline" className="bg-red-100 text-red-800">Expired</Badge>
  if (days <= 30) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Expiring in {days}d</Badge>
  return <Badge variant="outline" className="bg-green-100 text-green-800">Valid</Badge>
}

export function SubcontractorPortal({ subcontractor, token, allowDownload }: SubcontractorPortalProps) {
  const [certs, setCerts] = useState(subcontractor.certifications)

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle>{subcontractor.name}</CardTitle>
              {subcontractor.registrationNumber && (
                <p className="text-sm text-muted-foreground">{subcontractor.registrationNumber}</p>
              )}
            </div>
            <div className="ml-auto">
              <StatusBadge type="subcontractor" value={subcontractor.tier} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">BEE Level</span>
              <p className="mt-1 font-medium">{subcontractor.beeLevel ? `Level ${subcontractor.beeLevel}` : "N/A"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Safety Rating</span>
              <p className="mt-1 font-medium">{subcontractor.safetyRating !== null ? `${subcontractor.safetyRating}%` : "N/A"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Certifications</span>
              <p className="mt-1 font-medium">{certs.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Certifications</CardTitle>
          <UploadCertDialog token={token} onSuccess={(cert) => setCerts((prev) => [cert, ...prev])} />
        </CardHeader>
        <CardContent>
          {certs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No certifications yet. Upload your first certificate above.</p>
          ) : (
            <div className="space-y-3">
              {certs.map((cert) => (
                <div key={cert.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{cert.name}</span>
                        {getExpiryBadge(cert.expiresAt)}
                        {cert.status && <StatusBadge type="certificationStatus" value={cert.status} />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {cert.issuedBy && `Issued by ${cert.issuedBy}`}
                        {cert.issuedDate && ` on ${format(new Date(cert.issuedDate), "PPP")}`}
                        {cert.expiresAt && ` — Expires ${format(new Date(cert.expiresAt), "PPP")}`}
                      </p>
                      {cert.status === "REJECTED" && cert.reviewNotes && (
                        <p className="text-sm text-red-600 mt-1">Rejection reason: {cert.reviewNotes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {allowDownload && cert.fileUrl && isR2Key(cert.fileUrl) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={`/api/shared/${token}/download/${cert.fileUrl}`} target="_blank" rel="noopener noreferrer">
                            <FileDown className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {cert.expiresAt && differenceInDays(new Date(cert.expiresAt), new Date()) <= 30 && (
                        <UploadCertDialog
                          token={token}
                          renewCertName={cert.name}
                          onSuccess={(newCert) => setCerts((prev) => [newCert, ...prev])}
                          trigger={
                            <Button variant="outline" size="sm">
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Renew
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Upload / Renew Dialog ───────────────────────

interface UploadCertDialogProps {
  token: string
  renewCertName?: string
  onSuccess: (cert: Certification) => void
  trigger?: React.ReactNode
}

function UploadCertDialog({ token, renewCertName, onSuccess, trigger }: UploadCertDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(renewCertName ?? "")
  const [issuedBy, setIssuedBy] = useState("")
  const [issuedDate, setIssuedDate] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  function resetForm() {
    setName(renewCertName ?? "")
    setIssuedBy("")
    setIssuedDate("")
    setExpiresAt("")
    setFile(null)
    setUploading(false)
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) resetForm()
  }

  async function handleSubmit() {
    let fileUrl: string | undefined

    // Upload file first if present
    if (file) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch(`/api/shared/${token}/upload`, { method: "POST", body: formData })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error ?? "File upload failed")
          setUploading(false)
          return
        }
        const data = await res.json()
        fileUrl = data.fileUrl
      } catch {
        toast.error("File upload failed. Please try again.")
        setUploading(false)
        return
      }
      setUploading(false)
    }

    startTransition(async () => {
      const result = await addPortalCertification(token, {
        name,
        issuedBy: issuedBy || undefined,
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        fileUrl,
      })

      if (result.success && result.data) {
        toast.success("Certificate uploaded for review")
        const newCert: Certification = {
          id: result.data.id,
          name,
          issuedBy: issuedBy || null,
          issuedDate: issuedDate ? new Date(issuedDate) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          fileUrl: fileUrl ?? null,
          status: "PENDING_REVIEW",
          reviewNotes: null,
          createdAt: new Date(),
        }
        onSuccess(newCert)
        handleOpenChange(false)
      } else {
        toast.error(result.error ?? "Failed to submit certification")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload Certificate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{renewCertName ? `Renew: ${renewCertName}` : "Upload Certificate"}</DialogTitle>
          <DialogDescription>
            Upload a new or renewed certificate. It will be reviewed by the organization before approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Certificate Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ISO 9001:2015"
              disabled={!!renewCertName}
            />
          </div>

          <div className="space-y-2">
            <Label>Issued By</Label>
            <Input
              value={issuedBy}
              onChange={(e) => setIssuedBy(e.target.value)}
              placeholder="e.g. SABS"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issued Date</Label>
              <Input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Expires</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Certificate File</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">PDF, Word, Excel, or image (max 10MB)</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isPending || uploading || !name}
          >
            {uploading ? "Uploading file…" : isPending ? "Submitting…" : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
