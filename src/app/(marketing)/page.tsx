import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { StandardsBar } from "@/components/landing/standards-bar"
import { ProblemSection } from "@/components/landing/problem-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Features } from "@/components/landing/features"
import { FeatureDetails } from "@/components/landing/feature-details"
import { StandardsCoverage } from "@/components/landing/standards-coverage"
import { Metrics } from "@/components/landing/metrics"
import { Testimonials } from "@/components/landing/testimonials"
import { Pricing } from "@/components/landing/pricing"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { ScrollAnimate } from "@/components/landing/scroll-animate"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <StandardsBar />
        <ScrollAnimate>
          <ProblemSection />
        </ScrollAnimate>
        <ScrollAnimate>
          <HowItWorks />
        </ScrollAnimate>
        <ScrollAnimate>
          <Features />
        </ScrollAnimate>
        <ScrollAnimate>
          <FeatureDetails />
        </ScrollAnimate>
        <StandardsCoverage />
        <ScrollAnimate>
          <Metrics />
        </ScrollAnimate>
        <ScrollAnimate>
          <Testimonials />
        </ScrollAnimate>
        <ScrollAnimate>
          <Pricing />
        </ScrollAnimate>
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
