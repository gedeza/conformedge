import { getActiveTermsVersion } from "../actions"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

export default async function TermsViewPage() {
  const version = await getActiveTermsVersion()

  if (!version) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No terms of service are currently published.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {version.title}
          </CardTitle>
          <Badge variant="outline">v{version.version}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Effective: {new Date(version.effectiveAt).toLocaleDateString("en-ZA", { dateStyle: "long" })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:font-medium prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:text-xs">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
