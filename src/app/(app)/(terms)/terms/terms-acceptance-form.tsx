"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, AlertCircle } from "lucide-react"
import { acceptTerms } from "./actions"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface TermsAcceptanceFormProps {
  versionId: string
  title: string
  content: string
  version: string
  summary: string | null
  redirectTo: string
}

export function TermsAcceptanceForm({
  versionId,
  title,
  content,
  version,
  summary,
  redirectTo,
}: TermsAcceptanceFormProps) {
  const [agreed, setAgreed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit() {
    if (!agreed) return

    startTransition(async () => {
      const result = await acceptTerms(versionId)
      if (result.success) {
        toast.success("Terms accepted. Welcome to ConformEdge.")
        router.push(redirectTo)
      } else {
        toast.error(result.error || "Failed to accept terms")
      }
    })
  }

  return (
    <Card className="border-2">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <Badge variant="outline">v{version}</Badge>
        </div>

        {summary && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Updated Terms</p>
              <p className="text-blue-700">{summary}</p>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Please read the following terms carefully before proceeding. You must accept these terms to use ConformEdge.
        </p>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border bg-muted/20 p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-base prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:font-medium prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <div className="flex w-full items-start gap-3 rounded-lg border p-4">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            disabled={isPending}
          />
          <label
            htmlFor="agree"
            className="cursor-pointer text-sm leading-relaxed"
          >
            I have read, understood, and agree to the{" "}
            <span className="font-medium">Terms of Service</span>,{" "}
            <span className="font-medium">Privacy Policy</span>, and{" "}
            <span className="font-medium">Acceptable Use Policy</span>. I
            consent to the processing of data as described, including
            cross-border transfers to AI and cloud service providers.
          </label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!agreed || isPending}
          className="w-full"
          size="lg"
        >
          <Shield className="mr-2 h-4 w-4" />
          {isPending ? "Processing..." : "Accept & Continue"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By accepting, you acknowledge that this agreement is legally binding
          under the Electronic Communications and Transactions Act (ECT Act) of
          South Africa.
        </p>
      </CardFooter>
    </Card>
  )
}
