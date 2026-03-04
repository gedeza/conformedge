import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <FileQuestion className="h-10 w-10 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold">Page Not Found</h2>
          <p className="text-sm text-muted-foreground">
            This page doesn&apos;t exist. It may have been moved or deleted.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
