import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ConformEdge — AI-Powered ISO Compliance Management",
  description:
    "Streamline your ISO compliance workflow with AI-powered document classification, gap assessments, CAPA management, and audit pack generation. Built for SA construction & infrastructure.",
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
      </body>
    </html>
  )
}
