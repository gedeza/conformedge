"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createTermsVersion, updateTermsVersion } from "./actions"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface TermsFormProps {
  initialData?: {
    id: string
    version: string
    title: string
    content: string
    summary: string | null
    effectiveAt: Date
  }
}

export function TermsForm({ initialData }: TermsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState(initialData?.content ?? "")

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const action = initialData ? updateTermsVersion : createTermsVersion
      if (initialData) formData.set("id", initialData.id)

      const result = await action(formData)
      if (result.success) {
        toast.success(initialData ? "Version updated" : "Version created")
        if (!initialData && result.data) {
          router.push(`/admin/terms/${result.data.id}`)
        } else {
          router.push("/admin/terms")
        }
      } else {
        toast.error(result.error ?? "Something went wrong")
      }
    })
  }

  const effectiveDefault = initialData
    ? new Date(initialData.effectiveAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Version Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version Number</Label>
              <Input
                id="version"
                name="version"
                placeholder="e.g. 1.0, 2.0"
                defaultValue={initialData?.version ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveAt">Effective Date</Label>
              <Input
                id="effectiveAt"
                name="effectiveAt"
                type="date"
                defaultValue={effectiveDefault}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Terms of Service & Privacy Policy"
              defaultValue={initialData?.title ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Change Summary (shown when re-acceptance required)</Label>
            <Textarea
              id="summary"
              name="summary"
              rows={2}
              placeholder="Brief summary of what changed..."
              defaultValue={initialData?.summary ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content (Markdown)</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="edit">
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <Textarea
                id="content"
                name="content"
                rows={20}
                className="font-mono text-sm"
                placeholder="# Terms of Service&#10;&#10;Write your terms in Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="prose prose-sm max-w-none rounded-md border p-4 min-h-[300px]">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">Nothing to preview</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Draft"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/terms")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
