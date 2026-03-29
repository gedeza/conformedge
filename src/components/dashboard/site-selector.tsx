"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Building2, ChevronDown, Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setSiteCookie } from "@/lib/site-context"

type SiteOption = {
  id: string
  name: string
  code: string
  siteType: string
  parentSiteId: string | null
}

interface SiteSelectorProps {
  sites: SiteOption[]
  currentSiteId: string | null
}

export function SiteSelector({ sites, currentSiteId }: SiteSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentSiteId)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Build tree for indented display
  const rootSites = sites.filter((s) => !s.parentSiteId)
  const childMap = new Map<string, SiteOption[]>()
  for (const site of sites) {
    if (site.parentSiteId) {
      const children = childMap.get(site.parentSiteId) ?? []
      children.push(site)
      childMap.set(site.parentSiteId, children)
    }
  }

  function handleSelect(siteId: string | null) {
    setSelectedId(siteId)
    startTransition(async () => {
      await setSiteCookie(siteId)
      router.refresh()
    })
  }

  const selectedSite = sites.find((s) => s.id === selectedId)

  function renderSiteItems(siteList: SiteOption[], depth: number): React.ReactNode[] {
    return siteList.flatMap((site) => {
      const children = childMap.get(site.id) ?? []
      return [
        <DropdownMenuItem
          key={site.id}
          onClick={() => handleSelect(site.id)}
          className="flex items-center gap-2"
        >
          <span style={{ width: depth * 16 }} />
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate flex-1">{site.name}</span>
          <span className="text-xs text-muted-foreground">{site.code}</span>
          {selectedId === site.id && <Check className="h-3 w-3 shrink-0" />}
        </DropdownMenuItem>,
        ...renderSiteItems(children, depth + 1),
      ]
    })
  }

  if (sites.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8" disabled={isPending}>
          <span className="flex items-center gap-1.5 truncate">
            {selectedSite ? (
              <>
                <Building2 className="h-3 w-3 shrink-0" />
                {selectedSite.name}
              </>
            ) : (
              <>
                <Globe className="h-3 w-3 shrink-0" />
                All Sites
              </>
            )}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => handleSelect(null)} className="flex items-center gap-2">
          <Globe className="h-3 w-3" />
          <span className="flex-1">All Sites</span>
          {!selectedId && <Check className="h-3 w-3" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {renderSiteItems(rootSites, 0)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
