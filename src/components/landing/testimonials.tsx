import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users } from "lucide-react"

export function Testimonials() {
  return (
    <section className="bg-landing-light-bg py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-landing-accent/10">
            <Users className="size-7 text-landing-accent" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Join the Early Access Programme
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;re onboarding a select group of South African businesses.
            Be among the first to transform your compliance workflow.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              asChild
              className="bg-landing-cta text-landing-navy font-semibold shadow-lg shadow-landing-cta/25 hover:bg-landing-cta/90"
            >
              <Link href="/sign-up">
                Apply for Early Access
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-landing-cta" />
              Free during beta
            </span>
            <span className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-landing-cta" />
              Priority support
            </span>
            <span className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-landing-cta" />
              Shape the roadmap
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
