import Link from "next/link"
import { FileX2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DocumentNotFound() {
  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href="/documents">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Link>
      </Button>

      <div className="flex items-center justify-center min-h-[40vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <FileX2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold">Document Not Found</h2>
            <p className="text-sm text-muted-foreground">
              This document has been deleted or is no longer available.
              Check the Audit Trail for details about when it was removed.
            </p>
            <Alert variant="default" className="text-left">
              <AlertTitle className="text-xs font-medium">Tip</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                If you believe this is an error, contact your organization admin
                or check the Audit Trail for the deletion event.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href="/documents">View All Documents</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/audit-trail">Audit Trail</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
