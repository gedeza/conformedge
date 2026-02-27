import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@react-pdf/renderer", "pdf-parse", "mammoth", "@google-cloud/vision"],
};

export default nextConfig;
