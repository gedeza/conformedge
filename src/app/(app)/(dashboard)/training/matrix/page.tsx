import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { getCompetencyMatrix } from "../actions"
import { TRAINING_CATEGORIES } from "../schema"

const MATRIX_CATEGORIES = [
  "INDUCTION", "FIRST_AID", "FIRE_FIGHTING", "WORKING_AT_HEIGHTS",
  "SCAFFOLDING", "CRANE_OPERATOR", "FORKLIFT_OPERATOR", "CONFINED_SPACE",
  "HAZARDOUS_CHEMICALS", "ELECTRICAL", "EXCAVATION", "H_AND_S_REPRESENTATIVE",
]

const CATEGORY_SHORT: Record<string, string> = {
  INDUCTION: "Induction",
  FIRST_AID: "First Aid",
  FIRE_FIGHTING: "Fire",
  WORKING_AT_HEIGHTS: "Heights",
  SCAFFOLDING: "Scaffold",
  CRANE_OPERATOR: "Crane",
  FORKLIFT_OPERATOR: "Forklift",
  CONFINED_SPACE: "Confined",
  HAZARDOUS_CHEMICALS: "HCA",
  ELECTRICAL: "Electrical",
  EXCAVATION: "Excavation",
  H_AND_S_REPRESENTATIVE: "H&S Rep",
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  current: { bg: "bg-green-100", text: "text-green-800", label: "Current" },
  expiring: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Expiring" },
  expired: { bg: "bg-red-100", text: "text-red-800", label: "Expired" },
  not_assessed: { bg: "bg-gray-50", text: "text-gray-400", label: "—" },
}

export default async function CompetencyMatrixPage() {
  let matrix: Awaited<ReturnType<typeof getCompetencyMatrix>> = []

  try {
    matrix = await getCompetencyMatrix()
  } catch {
    return (
      <div className="space-y-6">
        <PageHeader heading="Competency Matrix" description="Employee training status by category" />
        <EmptyState icon={Users} title="Authentication required" description="Please sign in and select an organisation." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/training">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Link>
        </Button>
      </div>

      <PageHeader heading="Competency Matrix" description="Per OHS Act s8(2)(e) — employee competency status by training category">
        <div className="flex items-center gap-3">
          {Object.entries(STATUS_STYLES).map(([key, style]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <div className={`w-3 h-3 rounded ${style.bg}`} />
              <span className="text-muted-foreground">{key === "not_assessed" ? "Not assessed" : style.label}</span>
            </div>
          ))}
        </div>
      </PageHeader>

      {matrix.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members"
          description="Add team members to your organisation to see the competency matrix."
        />
      ) : (
        <Card className="border-border/50">
          <CardContent className="overflow-x-auto pt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium sticky left-0 bg-background z-10">Employee</th>
                  {MATRIX_CATEGORIES.map((cat) => (
                    <th key={cat} className="text-center py-2 px-1 font-medium min-w-[70px]">
                      <span className="text-xs">{CATEGORY_SHORT[cat]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.userId} className="border-b hover:bg-muted/50">
                    <td className="py-2 pr-4 font-medium sticky left-0 bg-background z-10">{row.name}</td>
                    {MATRIX_CATEGORIES.map((cat) => {
                      const status = row.categories[cat] ?? "not_assessed"
                      const style = STATUS_STYLES[status]
                      return (
                        <td key={cat} className="text-center py-2 px-1">
                          <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
