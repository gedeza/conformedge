"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  ArrowLeft,
  Share2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const partnerItems = [
  { title: "Overview", href: "/partner", icon: LayoutDashboard },
  { title: "Client Organizations", href: "/partner/clients", icon: Building2 },
  { title: "Partner Team", href: "/partner/team", icon: Users },
  { title: "Referrals", href: "/partner/referrals", icon: Share2 },
  { title: "Billing", href: "/partner/billing", icon: CreditCard },
]

const footerItems = [
  { title: "Partner Settings", href: "/partner/settings", icon: Settings },
  { title: "Back to Dashboard", href: "/dashboard", icon: ArrowLeft },
]

interface PartnerSidebarProps {
  branding?: {
    logoKey: string | null
    brandName: string | null
    primaryColor: string | null
    accentColor: string | null
  } | null
}

export function PartnerSidebar({ branding }: PartnerSidebarProps) {
  const pathname = usePathname()

  const displayName = branding?.brandName || "ConformEdge"
  const logoSrc = branding?.logoKey
    ? `/api/partner/logo/${branding.logoKey}`
    : "/images/logo-icon.png"

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/partner">
                <Image src={logoSrc} alt={displayName} width={32} height={32} className="rounded-lg" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Partner Console
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Partner Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {partnerItems.map((item) => {
                const isActive =
                  item.href === "/partner"
                    ? pathname === "/partner"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
