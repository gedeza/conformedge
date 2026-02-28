"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Sparkles, Loader2, SearchCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import type { GapInsight } from "@/lib/gap-detection"

interface ClassifyButtonProps {
  documentId: string
  fileType: string | null
  isExtractable: boolean
}

interface ClassifyResult {
  count: number
  summary: string
  gapInsights: GapInsight[]
}

export function ClassifyButton({ documentId, fileType, isExtractable }: ClassifyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ClassifyResult | null>(null)

  if (!isExtractable) {
    return (
      <p className="text-sm text-muted-foreground">
        AI analysis is not available for {fileType ?? "this file type"}. Supported: PDF, DOCX.
      </p>
    )
  }

  async function handleClassify() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`/api/documents/${documentId}/classify`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Classification failed")
        return
      }

      setResult({
        count: data.count,
        summary: data.summary,
        gapInsights: data.gapInsights ?? [],
      })
      toast.success(`Found ${data.count} clause classification${data.count !== 1 ? "s" : ""}`)
      router.refresh()
    } catch {
      toast.error("Classification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleClassify} disabled={loading} variant="outline" size="sm">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze with AI
          </>
        )}
      </Button>
      {result && (
        <>
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              AI found <strong>{result.count}</strong> clause classification{result.count !== 1 ? "s" : ""}.{" "}
              {result.summary}
            </AlertDescription>
          </Alert>
          {result.gapInsights.length > 0 && (
            <Alert>
              <SearchCheck className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Gap Coverage Impact</p>
                <div className="space-y-2">
                  {result.gapInsights.map((insight) => (
                    <div key={insight.standardCode} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{insight.standardCode}</span>
                        <span className="font-medium">{insight.coveragePercent}% coverage</span>
                      </div>
                      <Progress value={insight.coveragePercent} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {insight.gaps} gap{insight.gaps !== 1 ? "s" : ""} remaining of {insight.totalClauses} clauses
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/gap-analysis"
                  className="inline-flex items-center text-xs text-primary hover:underline mt-2"
                >
                  View full gap analysis <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}
