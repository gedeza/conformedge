import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export function DashboardBrandHeader({
  partnerName,
  commissionPercent,
}: {
  partnerName: string
  commissionPercent: number
}) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo + brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/logo-icon.png"
            alt="ConformEdge"
            width={28}
            height={28}
          />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              ConformEdge
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-sm font-medium text-slate-500">
              Partner Dashboard
            </span>
          </div>
        </Link>

        {/* Partner info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{partnerName}</p>
            <p className="text-xs text-slate-500">Referral Partner</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            {commissionPercent}% commission
          </Badge>
        </div>
      </div>
    </header>
  )
}

export function DashboardBrandFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t bg-slate-50 mt-12">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-icon.png"
              alt="ConformEdge"
              width={20}
              height={20}
            />
            <span className="text-sm font-medium text-slate-600">
              ConformEdge
            </span>
            <span className="text-xs text-slate-400">
              AI-Powered SHEQ & Compliance Management
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-slate-600 transition-colors">
              Terms
            </Link>
            <a href="mailto:conformedge@isutech.co.za" className="hover:text-slate-600 transition-colors">
              Support
            </a>
            <span>&copy; {year} ISU Technologies</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
