import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"

export function Hero() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <ShieldCheck className="mx-auto size-12 text-primary" />
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          AI-Powered ISO Compliance Management
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Streamline your compliance workflow. From document classification to
          audit pack generation — ConformEdge automates the heavy lifting so
          your team can focus on what matters.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
