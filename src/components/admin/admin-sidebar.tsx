"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Handshake,
  Share2,
  ArrowLeft,
  Shield,
  FileText,
  DollarSign,
  ScrollText,
  Receipt,
  ClipboardList,
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

const adminItems = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Organizations", href: "/admin/organizations", icon: Building2 },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { title: "Revenue", href: "/admin/revenue", icon: DollarSign },
  { title: "Invoices", href: "/admin/invoices", icon: Receipt },
  { title: "Quotations", href: "/admin/quotations", icon: ClipboardList },
  { title: "Partners", href: "/admin/partners", icon: Handshake },
  { title: "Referrals", href: "/admin/referrals", icon: Share2 },
  { title: "Terms", href: "/admin/terms", icon: FileText },
  { title: "Audit Trail", href: "/admin/audit-trail", icon: ScrollText },
]

const footerItems = [
  { title: "Back to Dashboard", href: "/dashboard", icon: ArrowLeft },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ConformEdge</span>
                  <span className="truncate text-xs text-red-600 font-medium">
                    Platform Admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
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
