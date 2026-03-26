import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactCompiler: true,
  serverExternalPackages: ["@react-pdf/renderer", "pdf-parse", "mammoth", "@google-cloud/vision"],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    // CSP: allow Clerk auth, Sentry telemetry, Paystack checkout, inline styles (shadcn/ui)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://*.clerk.accounts.dev https://clerk.conformedge.isutech.co.za https://*.sentry.io",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://img.clerk.com https://*.clerk.accounts.dev",
      "font-src 'self' data:",
      "connect-src 'self' https://*.clerk.accounts.dev https://clerk.conformedge.isutech.co.za https://api.clerk.com https://*.sentry.io https://js.paystack.co https://api.paystack.co wss://*.clerk.accounts.dev",
      "frame-src 'self' https://js.paystack.co https://*.clerk.accounts.dev",
      "worker-src 'self' blob:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ")

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  sourcemaps: {
    disable: false,
    deleteSourcemapsAfterUpload: true,
  },
  telemetry: false,
});
