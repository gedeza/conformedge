import Link from "next/link"
import { Shield } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"

/**
 * Server component that conditionally renders a "Platform Admin" link
 * in the main dashboard for super admin users.
 */
export async function AdminNavLink() {
  const ctx = await getSuperAdminContext()

  if (!ctx) return null

  return (
    <Link
      href="/admin"
      className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
    >
      <Shield className="h-4 w-4" />
      Platform Admin Console
    </Link>
  )
}
