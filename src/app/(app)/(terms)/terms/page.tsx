import { redirect } from "next/navigation"
import { getActiveTermsVersion, checkUserHasAccepted } from "./actions"
import { TermsAcceptanceForm } from "./terms-acceptance-form"

interface TermsPageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function TermsPage({ searchParams }: TermsPageProps) {
  const { next } = await searchParams
  const version = await getActiveTermsVersion()

  if (!version) {
    // No active terms — allow through
    redirect(next || "/dashboard")
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
