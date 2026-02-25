import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Ready to Simplify Your ISO Compliance?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join South African construction and infrastructure companies already
          using ConformEdge.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/sign-up">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
