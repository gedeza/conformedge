import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PartnerSidebar } from "@/components/partner/partner-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { getPartnerContext } from "@/lib/partner-auth"
import { getPartnerBranding } from "@/lib/partner-branding"

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
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
