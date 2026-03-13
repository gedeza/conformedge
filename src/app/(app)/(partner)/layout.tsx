import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PartnerSidebar } from "@/components/partner/partner-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { getPartnerContext } from "@/lib/partner-auth"
import { getPartnerBranding } from "@/lib/partner-branding"
import { Handshake } from "lucide-react"

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await getPartnerContext()

  if (!ctx) {
    redirect("/dashboard")
  }

  const branding = await getPartnerBranding(ctx.partnerId)

  return (
    <SidebarProvider>
      <PartnerSidebar branding={branding} />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex items-center gap-2 border-b bg-blue-50 px-6 py-2 text-sm font-medium text-blue-800">
          <Handshake className="h-4 w-4" />
          <span>Partner Console</span>
          <span className="text-blue-400">—</span>
          <span className="text-xs font-normal text-blue-600">{ctx.partnerName}</span>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
