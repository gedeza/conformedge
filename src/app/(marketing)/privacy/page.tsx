import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — ConformEdge",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: 23 March 2026</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                ConformEdge, operated by ISU Technologies (Pty) Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), is committed to protecting
                your personal information in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA)
                and other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">We collect the following categories of information:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Account information (name, email address, organization details)</li>
                <li>Compliance documents and data uploaded to the platform</li>
                <li>Usage data and analytics (page views, feature usage)</li>
                <li>Device and browser information for security purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">Your information is used to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Provide and maintain the ConformEdge platform</li>
                <li>Process AI-powered document classification and compliance analysis</li>
                <li>Send transactional notifications (document expiry, CAPA due dates)</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Storage and Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                All data is stored on secure servers with encryption at rest and in transit. File uploads are stored
                on Cloudflare R2 with organization-scoped access controls. We implement OWASP Top 10 security
                practices across the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">5. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">We use the following third-party services:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Clerk — authentication and user management</li>
                <li>Anthropic Claude — AI document analysis (document content is processed but not stored by Anthropic)</li>
                <li>Cloudflare R2 — file storage</li>
                <li>Resend — transactional email delivery</li>
                <li>Sentry — error monitoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">6. Your Rights Under POPIA</h2>
              <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Access your personal information</li>
                <li>Request correction or deletion of your data</li>
                <li>Object to processing of your personal information</li>
                <li>Lodge a complaint with the Information Regulator</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services.
                Compliance records are retained in accordance with applicable regulatory requirements.
                You may request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">8. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related enquiries, contact us at{" "}
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
