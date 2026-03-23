import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy — ConformEdge",
}

export default function CookiePolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: 23 March 2026</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">1. What Are Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files stored on your device when you visit a website. They help the site
                remember your preferences and improve your experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">ConformEdge uses the following types of cookies:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>
                  <strong>Essential cookies</strong> — Required for authentication and platform functionality.
                  These are set by Clerk for session management and cannot be disabled.
                </li>
                <li>
                  <strong>Analytics cookies</strong> — Help us understand how users interact with the Platform
                  to improve our services. These can be disabled.
                </li>
                <li>
                  <strong>Error tracking cookies</strong> — Used by Sentry to capture and report errors,
                  helping us maintain platform reliability.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">3. Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our authentication provider (Clerk) sets cookies necessary for secure sign-in and session management.
                These are essential and cannot be disabled without losing access to the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">4. Managing Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings. Note that disabling essential cookies will
                prevent you from using the Platform. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>View what cookies are stored on your device</li>
                <li>Delete individual or all cookies</li>
                <li>Block cookies from specific or all websites</li>
                <li>Set preferences for first-party vs third-party cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">5. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about our use of cookies, contact us at{" "}
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
