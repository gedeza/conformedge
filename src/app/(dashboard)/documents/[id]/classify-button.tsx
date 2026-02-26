"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ClassifyButtonProps {
  documentId: string
  fileType: string | null
  isExtractable: boolean
}

export function ClassifyButton({ documentId, fileType, isExtractable }: ClassifyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ count: number; summary: string } | null>(null)

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

      setResult({ count: data.count, summary: data.summary })
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
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            AI found <strong>{result.count}</strong> clause classification{result.count !== 1 ? "s" : ""}.{" "}
            {result.summary}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
