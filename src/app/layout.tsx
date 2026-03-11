import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ServiceWorkerRegistration } from "@/components/shared/sw-register"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: "ConformEdge — AI-Powered ISO Compliance Management",
  description:
    "Streamline your ISO compliance workflow with AI-powered document classification, gap assessments, CAPA management, and audit pack generation. Built for SA construction & infrastructure.",
  authors: [{ name: "ISU Technologies", url: "https://isutech.co.za" }],
  creator: "ISU Technologies",
  publisher: "ISU Technologies",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ConformEdge",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "ConformEdge — AI-Powered ISO Compliance Management",
    description: "Manage ISO 9001, 14001, 45001, 27001 and more from a single platform. Built for South African construction companies.",
    type: "website",
    siteName: "ConformEdge",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
