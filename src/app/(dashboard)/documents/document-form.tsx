"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/shared/date-picker"
import { DOCUMENT_STATUSES } from "@/lib/constants"
import { isExtractableMime } from "@/lib/ai/extractable-types"
import { createDocument, updateDocument, type DocumentFormValues } from "./actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "EXPIRED", "ARCHIVED"]).default("DRAFT"),
  projectId: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
})

interface DocumentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: {
    id: string
    title: string
    description: string | null
    status: string
    projectId?: string | null
    expiresAt: Date | null
    fileUrl: string | null
  }
  projects: { id: string; name: string }[]
  autoClassify?: boolean
  hasWorkflowTemplates?: boolean
}

export function DocumentForm({ open, onOpenChange, document, projects, autoClassify = false, hasWorkflowTemplates = false }: DocumentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const isEditing = !!document

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: document?.title ?? "",
      description: document?.description ?? "",
      status: (document?.status as DocumentFormValues["status"]) ?? "DRAFT",
      projectId: document?.projectId ?? undefined,
      expiresAt: document?.expiresAt ?? undefined,
    },
  })

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Upload failed")
        return
      }

      const data = await res.json()
      form.setValue("fileUrl", data.fileUrl)
      form.setValue("fileType", data.fileType)
      form.setValue("fileSize", data.fileSize)
      if (!form.getValues("title")) {
        form.setValue("title", file.name.replace(/\.[^/.]+$/, ""))
      }
      toast.success("File uploaded")
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = isEditing
        ? await updateDocument(document.id, values)
        : await createDocument(values)

      if (result.success) {
        toast.success(isEditing ? "Document updated" : "Document created")

        // Fire-and-forget auto-classify for new documents
        if (!isEditing && autoClassify && result.data?.id && isExtractableMime(values.fileType ?? null)) {
          toast.info("AI classification started...")
          fetch(`/api/documents/${result.data.id}/classify`, { method: "POST" })
            .then(async (res) => {
              if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                toast.error(body.error ?? "Auto-classification failed")
              }
            })
            .catch(() => toast.error("Auto-classification request failed"))
        }

        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Document" : "Upload Document"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {!isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-medium">File</label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" asChild disabled={uploading}>
                    <label className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Choose File"}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </Button>
                  {form.watch("fileUrl") && (
                    <span className="text-sm text-muted-foreground">File attached</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, Word, Excel, or images (JPG, PNG). Max 10 MB.
                </p>
              </div>
            )}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Document title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DOCUMENT_STATUSES)
                          .filter(([v]) => !(hasWorkflowTemplates && v === "APPROVED"))
                          .map(([v, c]) => (
                            <SelectItem key={v} value={v}>{c.label}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending || uploading}>
                {isPending ? "Saving..." : isEditing ? "Update" : "Upload"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
