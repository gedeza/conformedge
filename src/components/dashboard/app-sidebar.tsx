"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { OfflineIndicator } from "@/components/shared/offline-indicator"
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  ClipboardCheck,
  CalendarDays,
  AlertTriangle,
  CheckSquare,
  Building2,
  Package,
  BarChart3,
  Settings,
  ScrollText,
  SearchCheck,
  GitCompareArrows,
  Layers,
  Bell,
  CreditCard,
  Siren,
  Target,
  ClipboardList,
  ShieldCheck,
  Handshake,
  Wrench,
  FileCheck2,
  HardHat,
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
import { OrgSwitcher } from "./org-switcher"

const coreItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Assessments", href: "/assessments", icon: ClipboardCheck },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "CAPAs", href: "/capas", icon: AlertTriangle },
  { title: "Incidents", href: "/incidents", icon: Siren },
  { title: "Objectives", href: "/objectives", icon: Target },
  { title: "Mgmt Reviews", href: "/management-reviews", icon: ClipboardList },
  { title: "Work Permits", href: "/permits", icon: ShieldCheck },
  { title: "Checklists", href: "/checklists", icon: CheckSquare },
  { title: "Equipment", href: "/equipment", icon: Wrench },
  { title: "Vendors", href: "/vendors", icon: Building2 },
  { title: "Obligations", href: "/obligations", icon: FileCheck2 },
  { title: "SHE Files", href: "/she-files", icon: HardHat },
]

const analysisItems = [
  { title: "IMS Dashboard", href: "/ims", icon: Layers },
  { title: "Gap Analysis", href: "/gap-analysis", icon: SearchCheck },
  { title: "Cross-References", href: "/cross-references", icon: GitCompareArrows },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Audit Packs", href: "/audit-packs", icon: Package },
  { title: "Audit Trail", href: "/audit-trail", icon: ScrollText },
]

const footerItems = [
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Billing", href: "/billing", icon: CreditCard },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <Image src="/images/logo-icon.png" alt="ConformEdge" width={32} height={32} className="rounded-lg" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ConformEdge</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Compliance Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <OrgSwitcher />
        {children}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Compliance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

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
        <SidebarGroup>
          <SidebarGroupLabel>Analysis &amp; Reporting</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

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
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`)

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
        <OfflineIndicator className="mx-3 mb-1 group-data-[collapsible=icon]:hidden" />
      </SidebarFooter>
    </Sidebar>
  )
}
