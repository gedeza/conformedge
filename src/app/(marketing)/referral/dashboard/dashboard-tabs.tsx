"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, BookOpen, Settings } from "lucide-react"

export function DashboardTabs({
  overviewContent,
  resourcesContent,
  settingsContent,
}: {
  overviewContent: React.ReactNode
  resourcesContent: React.ReactNode
  settingsContent: React.ReactNode
}) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList variant="line" className="w-full justify-start mb-6">
        <TabsTrigger value="overview" className="gap-1.5">
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="resources" className="gap-1.5">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Resources & Guides</span>
          <span className="sm:hidden">Resources</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-1.5">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="space-y-6">{overviewContent}</div>
      </TabsContent>

      <TabsContent value="resources">{resourcesContent}</TabsContent>

      <TabsContent value="settings">{settingsContent}</TabsContent>
    </Tabs>
  )
}
