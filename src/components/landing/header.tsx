"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { NAV_LINKS } from "./data"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-landing-navy/95 backdrop-blur-md shadow-lg"
          : "bg-landing-navy/60 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white">
          <Image src="/images/C_Edge_Logo.png" alt="ConformEdge" width={28} height={28} />
          <span className="text-lg font-bold tracking-tight">ConformEdge</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild className="bg-landing-cta text-landing-navy font-semibold hover:bg-landing-cta/90">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-landing-navy border-white/10">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              <Link href="/" className="flex items-center gap-2 text-white" onClick={() => setOpen(false)}>
                <Image src="/images/C_Edge_Logo.png" alt="ConformEdge" width={24} height={24} />
                <span className="text-lg font-bold">ConformEdge</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" asChild className="justify-start text-white/80 hover:text-white hover:bg-white/10">
                  <Link href="/sign-in" onClick={() => setOpen(false)}>Sign In</Link>
                </Button>
                <Button asChild className="bg-landing-cta text-landing-navy font-semibold hover:bg-landing-cta/90">
                  <Link href="/sign-up" onClick={() => setOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
