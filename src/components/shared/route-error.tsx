"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  entityName: string
  backHref: string
}

export function RouteError({ error, reset, entityName, backHref }: RouteErrorProps) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  const isOrgError = error.message?.includes("No organization selected")
  const isNotFound = error.message?.includes("not found") || error.message?.includes("Not found")

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
          ) : isNotFound ? (
            <>
              <h2 className="text-lg font-semibold">{entityName} Not Found</h2>
              <p className="text-sm text-muted-foreground">
                This {entityName.toLowerCase()} may have been deleted or you don&apos;t have access.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Failed to Load {entityName}</h2>
              <p className="text-sm text-muted-foreground">
                Something went wrong while loading this page. Please try again.
              </p>
            </>
          )}
          <div className="flex justify-center gap-2">
            <Button onClick={reset} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => router.push(backHref)} variant="ghost">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
