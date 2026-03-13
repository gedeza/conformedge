import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { Shield } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await getSuperAdminContext()

  if (!ctx) {
    redirect("/dashboard")
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex items-center gap-2 border-b bg-red-50 px-6 py-2 text-sm font-medium text-red-800">
          <Shield className="h-4 w-4" />
          <span>Platform Admin Console</span>
          <span className="text-red-500">—</span>
          <span className="text-xs font-normal text-red-600">Logged in as {ctx.firstName} {ctx.lastName}</span>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
