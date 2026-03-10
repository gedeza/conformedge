import Link from "next/link"
import Image from "next/image"
import { FOOTER_LINKS } from "./data"

export function Footer() {
  return (
    <footer className="bg-landing-navy text-white">
      <div className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo-icon.png" alt="ConformEdge" width={28} height={28} />
              <span className="text-lg font-bold tracking-tight">ConformEdge</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              AI-powered ISO compliance management for South African businesses
              and organisations.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Product
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Company
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Legal
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            &copy; 2025&ndash;{new Date().getFullYear()} ISU Technologies. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Developed by{" "}
            <a
              href="https://isutech.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 underline decoration-white/20 transition-colors hover:text-white"
            >
              iSu Technologies
            </a>
            {" "}| Built in South Africa
          </p>
        </div>
      </div>
    </footer>
  )
}
