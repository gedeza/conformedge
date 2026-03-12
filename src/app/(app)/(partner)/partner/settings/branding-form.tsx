"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Upload, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updatePartnerBranding } from "../actions"

interface BrandingFormProps {
  logoKey: string | null
  brandName: string | null
  primaryColor: string | null
  accentColor: string | null
  tier: string
}

export function BrandingForm({ logoKey, brandName, primaryColor, accentColor, tier }: BrandingFormProps) {
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [currentLogoKey, setCurrentLogoKey] = useState(logoKey)
  const [formBrandName, setFormBrandName] = useState(brandName ?? "")
  const [formPrimary, setFormPrimary] = useState(primaryColor ?? "#1e40af")
  const [formAccent, setFormAccent] = useState(accentColor ?? "#3b82f6")

  const isWhiteLabel = tier === "WHITE_LABEL"

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/partner/upload-logo", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Upload failed")
        return
      }

      setCurrentLogoKey(data.logoKey)
      toast.success("Logo uploaded")
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function handleSaveBranding() {
    startTransition(async () => {
      const result = await updatePartnerBranding({
        brandName: formBrandName || undefined,
        primaryColor: formPrimary,
        accentColor: formAccent,
      })
      if (result.success) {
        toast.success("Branding updated")
      } else {
        toast.error(result.error)
      }
    })
  }

  if (!isWhiteLabel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
          <CardDescription>
            White-label branding is available on the White-Label partner tier.
            Contact us to upgrade your plan.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4" />
          White-Label Branding
        </CardTitle>
        <CardDescription>
          Customize branding for your client-facing pages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo upload */}
        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            {currentLogoKey ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                <Image
                  src={`/api/partner/logo/${currentLogoKey}`}
                  alt="Partner logo"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                <Upload className="h-6 w-6" />
              </div>
            )}
            <div>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <span>{uploading ? "Uploading..." : currentLogoKey ? "Change Logo" : "Upload Logo"}</span>
                </Button>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </label>
              <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, or WebP. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div className="space-y-2">
          <Label htmlFor="brandName">Brand Name</Label>
          <Input
            id="brandName"
            placeholder="Your company name (replaces ConformEdge)"
            value={formBrandName}
            onChange={(e) => setFormBrandName(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            Shown in client-facing shared pages instead of &quot;ConformEdge&quot;
          </p>
        </div>

        {/* Colors */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primaryColor"
                value={formPrimary}
                onChange={(e) => setFormPrimary(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <Input
                value={formPrimary}
                onChange={(e) => setFormPrimary(e.target.value)}
                placeholder="#1e40af"
                className="font-mono text-sm"
                maxLength={7}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="accentColor"
                value={formAccent}
                onChange={(e) => setFormAccent(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <Input
                value={formAccent}
                onChange={(e) => setFormAccent(e.target.value)}
                placeholder="#3b82f6"
                className="font-mono text-sm"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
          <div className="flex items-center gap-3">
            {currentLogoKey ? (
              <div className="relative h-8 w-8 overflow-hidden rounded">
                <Image
                  src={`/api/partner/logo/${currentLogoKey}`}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded" style={{ backgroundColor: formPrimary }} />
            )}
            <span className="font-semibold" style={{ color: formPrimary }}>
              {formBrandName || "Your Brand Name"}
            </span>
          </div>
          <div className="mt-2 flex gap-2">
            <div className="h-6 w-20 rounded" style={{ backgroundColor: formPrimary }} />
            <div className="h-6 w-20 rounded" style={{ backgroundColor: formAccent }} />
          </div>
        </div>

        <Button onClick={handleSaveBranding} disabled={pending}>
          {pending ? "Saving..." : "Save Branding"}
        </Button>
      </CardContent>
    </Card>
  )
}
