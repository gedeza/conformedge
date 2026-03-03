import { PageHeader } from "@/components/shared/page-header"
import { UpgradePrompt } from "@/components/billing/upgrade-prompt"
import { getCrossReferenceMatrix, getStandardOverlapCounts } from "./actions"
import { CrossRefBrowser } from "./cross-ref-browser"
import { CrossReferencesHelpPanel } from "./cross-references-help-panel"

export default async function CrossReferencesPage() {
  const [matrixData, overlapData] = await Promise.all([
    getCrossReferenceMatrix(),
    getStandardOverlapCounts(),
  ])

  if (!matrixData) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Cross-References"
          description="Explore clause mappings across ISO standards for integrated audits"
        >
          <CrossReferencesHelpPanel />
        </PageHeader>
        <UpgradePrompt
          feature="Cross-References"
          message="Cross-reference mapping is available on Professional and Enterprise plans. Upgrade to explore clause mappings across ISO standards for integrated audits."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Cross-References"
        description="Explore clause mappings across ISO standards for integrated audits"
      >
        <CrossReferencesHelpPanel />
      </PageHeader>

      <CrossRefBrowser matrixData={matrixData} overlapData={overlapData} />
    </div>
  )
}
