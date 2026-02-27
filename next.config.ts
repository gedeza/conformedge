import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@react-pdf/renderer", "pdf-parse", "mammoth"],
};

export default nextConfig;
