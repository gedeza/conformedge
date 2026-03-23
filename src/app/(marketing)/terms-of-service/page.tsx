import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — ConformEdge",
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: 23 March 2026</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">1. Agreement</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using ConformEdge (&quot;the Platform&quot;), operated by ISU Technologies (Pty) Ltd,
                you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">2. Service Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                ConformEdge is an AI-powered ISO compliance management platform. The Platform provides tools for
                document management, compliance assessments, CAPA tracking, incident management, and related
                compliance activities. The Platform is provided on a subscription basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must notify us immediately of any unauthorized access to your account</li>
                <li>One person or legal entity may not maintain more than one account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Use the Platform for any unlawful purpose</li>
                <li>Upload malicious files or attempt to compromise platform security</li>
                <li>Share account credentials or allow unauthorized access</li>
                <li>Reverse engineer or attempt to extract source code from the Platform</li>
                <li>Exceed the usage limits of your subscription tier</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">5. Subscriptions and Billing</h2>
              <p className="text-muted-foreground leading-relaxed">
                Subscription fees are billed monthly or annually as selected. Prices are quoted in South African Rand (ZAR)
                and are exclusive of VAT unless stated otherwise. We reserve the right to adjust pricing with 30 days&apos; notice.
                Refunds are handled on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">6. Data Ownership</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain full ownership of all data and documents uploaded to the Platform. We do not claim any
                intellectual property rights over your content. Upon account termination, you may request an export
                of your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">7. AI-Powered Features</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Platform uses AI for document classification and compliance analysis. AI outputs are provided as
                recommendations and should be reviewed by qualified personnel. We do not guarantee the accuracy of
                AI-generated classifications or assessments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Platform is provided &quot;as is&quot;. ISU Technologies shall not be liable for any indirect, incidental,
                or consequential damages arising from use of the Platform. Our total liability shall not exceed the
                fees paid by you in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                Either party may terminate the subscription with 30 days&apos; written notice. We may suspend or terminate
                accounts that violate these terms. Upon termination, your access to the Platform will cease and data
                will be retained for 90 days before deletion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">10. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject
                to the jurisdiction of the South African courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">11. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these terms, contact us at{" "}
                <a href="mailto:nhlanhla@isutech.co.za" className="text-primary underline">nhlanhla@isutech.co.za</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
