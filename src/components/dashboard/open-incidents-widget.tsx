import Link from "next/link"
import { Siren, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getOpenIncidentsSummary } from "@/app/(app)/(dashboard)/incidents/actions"

export async function OpenIncidentsWidget() {
  let summary: Awaited<ReturnType<typeof getOpenIncidentsSummary>> | null = null

  try {
    summary = await getOpenIncidentsSummary()
  } catch {
    return null
  }

  if (!summary || summary.total === 0) return null

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
        <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10">
          <Siren className="size-4 text-red-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-3">{summary.total}</div>
        <div className="space-y-1">
          {summary.byType.map((t) => (
            <div key={t.type} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t.type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </span>
              <span className="font-medium">{t.count}</span>
            </div>
          ))}
        </div>
        {summary.ltiCount > 0 && (
          <div className="mt-2 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            {summary.ltiCount} lost-time {summary.ltiCount === 1 ? "injury" : "injuries"} open
          </div>
        )}
        <div className="mt-3 pt-3 border-t">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link href="/incidents">
              View All Incidents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
