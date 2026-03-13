import { redirect } from "next/navigation"
import { getActiveTermsVersion, checkUserHasAccepted } from "./actions"
import { TermsAcceptanceForm } from "./terms-acceptance-form"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface TermsPageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function TermsPage({ searchParams }: TermsPageProps) {
  const { next } = await searchParams
  const version = await getActiveTermsVersion()

  if (!version) {
    // No active terms version — show a message instead of redirecting (avoids loop)
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-8 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p>Terms of service are being prepared. Please try again shortly.</p>
        </CardContent>
      </Card>
    )
  }

  const hasAccepted = await checkUserHasAccepted(version.id)
  if (hasAccepted) {
    redirect(next || "/dashboard")
  }

  return (
    <TermsAcceptanceForm
      versionId={version.id}
      title={version.title}
      content={version.content}
      version={version.version}
      summary={version.summary}
      redirectTo={next || "/dashboard"}
    />
  )
}
