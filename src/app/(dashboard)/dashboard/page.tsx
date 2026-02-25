import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import {
  FileText,
  ClipboardCheck,
  AlertTriangle,
  FolderKanban,
} from "lucide-react"

const metrics = [
  {
    title: "Active Projects",
    value: "0",
    description: "No projects yet",
    icon: FolderKanban,
  },
  {
    title: "Documents",
    value: "0",
    description: "No documents uploaded",
    icon: FileText,
  },
  {
    title: "Assessments",
    value: "0",
    description: "No assessments completed",
    icon: ClipboardCheck,
  },
  {
    title: "Open CAPAs",
    value: "0",
    description: "No open actions",
    icon: AlertTriangle,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        heading="Dashboard"
        description="Overview of your compliance status"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
