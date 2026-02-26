"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isOrgError = error.message?.includes("No organization selected")

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto" />
          {isOrgError ? (
            <>
              <h2 className="text-lg font-semibold">No Organization Selected</h2>
              <p className="text-sm text-muted-foreground">
                Please select an organization from the sidebar to continue.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. Please try again.
              </p>
            </>
          )}
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
