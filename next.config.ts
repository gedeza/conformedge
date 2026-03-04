import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactCompiler: true,
  serverExternalPackages: ["@react-pdf/renderer", "pdf-parse", "mammoth", "@google-cloud/vision"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
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
