import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            ConformEdge
          </div>
          <nav className="flex items-center gap-4">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
              Sign In
            </a>
            <a
              href="/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Hero />
        <Features />
        <CTA />
      </main>
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ISU Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
