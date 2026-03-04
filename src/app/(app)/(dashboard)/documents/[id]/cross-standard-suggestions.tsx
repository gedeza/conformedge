"use client"

import { useTransition } from "react"
import { Layers, Plus, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { addCrossStandardClassification } from "../actions"
import type { DocumentSuggestion } from "@/lib/ims/cross-standard-suggestions"

interface CrossStandardSuggestionsProps {
  documentId: string
  suggestions: DocumentSuggestion[]
}

export function CrossStandardSuggestions({
  documentId,
  suggestions,
}: CrossStandardSuggestionsProps) {
  const [isPending, startTransition] = useTransition()

  if (suggestions.length === 0) return null

  const actionableSuggestions = suggestions.filter((s) => !s.alreadyClassified)
  const existingSuggestions = suggestions.filter((s) => s.alreadyClassified)

  const handleApply = (suggestion: DocumentSuggestion) => {
    startTransition(async () => {
      const result = await addCrossStandardClassification(
        documentId,
        suggestion.suggestedClauseId,
        suggestion.sourceConfidence
      )
      if (result.success) {
        toast.success(
          `Classified under ${suggestion.suggestedStandardCode} ${suggestion.suggestedClauseNumber}`
        )
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Cross-Standard Suggestions
          <Badge variant="secondary" className="ml-auto">
            {actionableSuggestions.length} available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Based on equivalent clauses across standards, this document may also satisfy the following requirements.
        </p>

        {actionableSuggestions.map((s) => (
          <div
            key={`${s.sourceClauseId}:${s.suggestedClauseId}`}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge>{s.suggestedStandardCode}</Badge>
                <span className="font-medium text-sm">
                  {s.suggestedClauseNumber} — {s.suggestedClauseTitle}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Equivalent to {s.sourceStandardCode} {s.sourceClauseNumber} (
                {(s.sourceConfidence * 100).toFixed(0)}% confidence)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApply(s)}
              disabled={isPending}
              className="shrink-0 ml-2"
            >
              <Plus className="mr-1 h-3 w-3" />
              Apply
            </Button>
          </div>
        ))}

        {existingSuggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Already classified:</p>
            {existingSuggestions.map((s) => (
              <div
                key={`${s.sourceClauseId}:${s.suggestedClauseId}`}
                className="flex items-center gap-2 rounded-md border bg-muted/30 p-2.5 text-sm"
              >
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                <Badge variant="outline" className="text-[10px]">
                  {s.suggestedStandardCode}
                </Badge>
                <span>{s.suggestedClauseNumber} — {s.suggestedClauseTitle}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
