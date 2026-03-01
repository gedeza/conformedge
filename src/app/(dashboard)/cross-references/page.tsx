import { PageHeader } from "@/components/shared/page-header"
import { getCrossReferenceMatrix, getStandardOverlapCounts } from "./actions"
import { CrossRefBrowser } from "./cross-ref-browser"
import { CrossReferencesHelpPanel } from "./cross-references-help-panel"

export default async function CrossReferencesPage() {
  const [matrixData, overlapData] = await Promise.all([
    getCrossReferenceMatrix(),
    getStandardOverlapCounts(),
  ])

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
