import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getChecklist } from "../actions"
import { ChecklistItemRow } from "./checklist-item-row"
import { GenerateItemsButton } from "./generate-items-button"
import { AddItemForm } from "./add-item-form"
import { SaveAsTemplateButton } from "./save-as-template-button"

export default async function ChecklistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let checklist: Awaited<ReturnType<typeof getChecklist>>

  try {
    checklist = await getChecklist(id)
  } catch {
    notFound()
  }

  if (!checklist) notFound()

  const totalItems = checklist.items.length
  const compliant = checklist.items.filter((i) => i.isCompliant === true).length
  const nonCompliant = checklist.items.filter((i) => i.isCompliant === false).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/checklists"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      </div>

      <PageHeader heading={checklist.title} description={`${checklist.standard.code} — ${checklist.standard.name}`}>
        <div className="flex items-center gap-2">
          {totalItems > 0 && <SaveAsTemplateButton checklistId={checklist.id} defaultName={checklist.title} />}
          <StatusBadge type="checklist" value={checklist.status} />
        </div>
      </PageHeader>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checklist.completionPercentage.toFixed(0)}%</div>
            <Progress value={checklist.completionPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalItems}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Compliant</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-700">{compliant}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Non-Compliant</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-700">{nonCompliant}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Checklist Items</CardTitle>
          <div className="flex gap-2">
            {totalItems === 0 && <GenerateItemsButton checklistId={checklist.id} />}
            <AddItemForm checklistId={checklist.id} />
          </div>
        </CardHeader>
        <CardContent>
          {checklist.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items yet. Generate from standard clauses or add manually.
            </p>
          ) : (
            <div className="space-y-2">
              {checklist.items.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  checklistId={checklist.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
