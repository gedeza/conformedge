"use client"

import { useState, useTransition } from "react"
import { Building2, Plus, Pencil, Trash2, ChevronRight, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createSite, updateSite, deleteSite } from "./site-actions"

const SITE_TYPES = [
  { value: "HEADQUARTERS", label: "Headquarters" },
  { value: "DIVISION", label: "Division" },
  { value: "REGIONAL_OFFICE", label: "Regional Office" },
  { value: "SITE", label: "Site" },
  { value: "PLANT", label: "Plant" },
  { value: "DEPOT", label: "Depot" },
  { value: "WAREHOUSE", label: "Warehouse" },
]

type SiteItem = {
  id: string
  name: string
  code: string
  siteType: string
  address: string | null
  parentSiteId: string | null
  managerId: string | null
  isActive: boolean
  manager: { id: string; firstName: string; lastName: string; email: string } | null
  _count: {
    projects: number
    incidents: number
    workPermits: number
    equipment: number
    complianceObligations: number
    childSites: number
  }
}

interface SiteManagementProps {
  sites: SiteItem[]
  members: Array<{ id: string; firstName: string; lastName: string }>
  canManage: boolean
}

export function SiteManagement({ sites, members, canManage }: SiteManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<SiteItem | null>(null)
  const [isPending, startTransition] = useTransition()


  // Build tree structure
  const rootSites = sites.filter((s) => !s.parentSiteId)
  const childMap = new Map<string, SiteItem[]>()
  for (const site of sites) {
    if (site.parentSiteId) {
      const children = childMap.get(site.parentSiteId) ?? []
      children.push(site)
      childMap.set(site.parentSiteId, children)
    }
  }

  function handleEdit(site: SiteItem) {
    setEditingSite(site)
    setDialogOpen(true)
  }

  function handleDelete(site: SiteItem) {
    if (!confirm(`Delete "${site.name}" (${site.code})? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteSite(site.id)
      if (result.success) {
        toast.success("Site deleted")
      } else {
        toast.error(result.error)
      }
    })
  }

  function renderSiteRow(site: SiteItem, depth: number) {
    const children = childMap.get(site.id) ?? []
    const totalRecords = site._count.projects + site._count.incidents + site._count.workPermits + site._count.equipment
    const typeLabel = SITE_TYPES.find((t) => t.value === site.siteType)?.label ?? site.siteType

    return (
      <div key={site.id}>
        <div
          className={`flex items-center justify-between rounded-md border p-3 ${!site.isActive ? "opacity-50" : ""} ${depth > 0 ? "ml-6 border-l-2 border-l-primary/20" : ""}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {depth > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{site.name}</span>
                <Badge variant="outline" className="text-xs">{site.code}</Badge>
                <Badge variant="secondary" className="text-xs">{typeLabel}</Badge>
                {!site.isActive && <Badge variant="outline" className="text-xs text-red-600">Inactive</Badge>}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                {site.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {site.address}
                  </span>
                )}
                {site.manager && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {site.manager.firstName} {site.manager.lastName}
                  </span>
                )}
                <span>{totalRecords} records</span>
                {site._count.childSites > 0 && <span>{site._count.childSites} sub-sites</span>}
              </div>
            </div>
          </div>
          {canManage && (
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(site)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600"
                onClick={() => handleDelete(site)}
                disabled={isPending || site._count.childSites > 0 || totalRecords > 0}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        {children.map((child) => renderSiteRow(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sites.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sites configured. Create your first site to enable multi-site hierarchy.
        </p>
      ) : (
        <div className="space-y-2">
          {rootSites.map((site) => renderSiteRow(site, 0))}
        </div>
      )}

      {canManage && (
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingSite(null) }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSite ? "Edit Site" : "Add Site"}</DialogTitle>
              <DialogDescription>
                {editingSite ? "Update site details" : "Add a new site to your organisation hierarchy"}
              </DialogDescription>
            </DialogHeader>
            <SiteForm
              site={editingSite}
              sites={sites}
              members={members}
              onSuccess={() => {
                setDialogOpen(false)
                setEditingSite(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ── Site Form ────────────────────────────────

function SiteForm({
  site,
  sites,
  members,
  onSuccess,
}: {
  site: SiteItem | null
  sites: SiteItem[]
  members: Array<{ id: string; firstName: string; lastName: string }>
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()


  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const values = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      siteType: formData.get("siteType") as string,
      address: (formData.get("address") as string) || null,
      parentSiteId: ((formData.get("parentSiteId") as string) === "none" ? null : (formData.get("parentSiteId") as string)) || null,
      managerId: ((formData.get("managerId") as string) === "none" ? null : (formData.get("managerId") as string)) || null,
    }

    startTransition(async () => {
      const result = site
        ? await updateSite(site.id, values)
        : await createSite(values)

      if (result.success) {
        toast.success(site ? "Site updated" : "Site created")
        onSuccess()
      } else {
        toast.error(result.error)
      }
    })
  }

  // Filter parent options — can't be self or own descendants
  const parentOptions = sites.filter((s) => s.id !== site?.id)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Site Name</Label>
          <Input id="name" name="name" defaultValue={site?.name ?? ""} required placeholder="e.g., Durban Depot" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Site Code</Label>
          <Input id="code" name="code" defaultValue={site?.code ?? ""} required placeholder="e.g., TFR-DBN" className="uppercase" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="siteType">Type</Label>
          <Select name="siteType" defaultValue={site?.siteType ?? "SITE"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SITE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentSiteId">Parent Site</Label>
          <Select name="parentSiteId" defaultValue={site?.parentSiteId ?? "none"}>
            <SelectTrigger>
              <SelectValue placeholder="None (top-level)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (top-level)</SelectItem>
              {parentOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={site?.address ?? ""} placeholder="Physical address (optional)" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="managerId">Site Manager</Label>
        <Select name="managerId" defaultValue={site?.managerId ?? "none"}>
          <SelectTrigger>
            <SelectValue placeholder="No manager assigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No manager assigned</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : site ? "Update Site" : "Create Site"}
      </Button>
    </form>
  )
}
