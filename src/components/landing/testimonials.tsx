import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Quote, Shield } from "lucide-react"

export function Testimonials() {
  return (
    <section className="bg-landing-light-bg py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-landing-accent/10">
            <Quote className="size-7 text-landing-accent" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by SA Compliance Professionals
          </h2>

          {/* Testimonial */}
          <div className="mt-10 rounded-2xl border bg-white p-8 shadow-sm">
            <p className="text-lg italic text-muted-foreground leading-relaxed">
              &ldquo;ConformEdge has transformed how we manage compliance across our client portfolio.
              What used to take weeks of spreadsheet wrangling now happens in one platform — incidents,
              permits, equipment, documents, all linked to the right ISO clauses automatically.&rdquo;
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Simon Moletsane</p>
                <p className="text-xs text-muted-foreground">Director — AE SHEQ (Pty) Ltd, Limpopo</p>
              </div>
            </div>
          </div>

          {/* CTA */}
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
            <Button size="lg" variant="outline" asChild>
              <Link href="/partners">
                Become a Partner
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-landing-cta" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-landing-cta" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-landing-cta" />
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
