import { getActiveTermsVersion } from "../actions"
import ReactMarkdown from "react-markdown"
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
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
          <ReactMarkdown>{version.content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
