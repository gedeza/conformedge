"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { IMSSummary } from "@/lib/ims/types"
import { IntegrationScoreCard } from "./integration-score-card"
import { ConsolidatedReadinessCard } from "./consolidated-readiness-card"
import { SharedRequirementsMatrix } from "./shared-requirements-matrix"
import { GapCascadePanel } from "./gap-cascade-panel"

interface IMSDashboardViewProps {
  data: IMSSummary
}

export function IMSDashboardView({ data }: IMSDashboardViewProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="matrix">
          Shared Requirements ({data.sharedRequirements.length})
        </TabsTrigger>
        <TabsTrigger value="cascades">
          Gap Cascades ({data.gapCascades.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <IntegrationScoreCard score={data.integrationScore} />
        <ConsolidatedReadinessCard readiness={data.consolidatedReadiness} />
      </TabsContent>

      <TabsContent value="matrix">
        <SharedRequirementsMatrix rows={data.sharedRequirements} />
      </TabsContent>

      <TabsContent value="cascades">
        <GapCascadePanel cascades={data.gapCascades} />
      </TabsContent>
    </Tabs>
  )
}
