import { ClerkProvider } from "@clerk/nextjs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const hasValidClerkKey = clerkKey && clerkKey.startsWith("pk_") && clerkKey.length > 20

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const content = (
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  )

  if (!hasValidClerkKey) {
    return content
  }

  return <ClerkProvider>{content}</ClerkProvider>
}
