import { Suspense } from "react"
import { AcceptInvitationContent } from "./accept-invitation-content"

export default function AcceptInvitationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-lg border bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">Loading invitation...</p>
          </div>
        }
      >
        <AcceptInvitationContent />
      </Suspense>
    </div>
  )
}
