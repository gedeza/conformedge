import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="bg-gradient-to-br from-landing-navy via-landing-navy to-landing-navy-light py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Take Control of Your Compliance?
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Join businesses across South Africa already using ConformEdge
            to stay audit-ready.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              asChild
              className="bg-landing-cta text-landing-navy font-semibold shadow-lg shadow-landing-cta/25 hover:bg-landing-cta/90"
            >
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#features">
                View Features
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/40">
            No credit card required &middot; 14-day free trial &middot; Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
