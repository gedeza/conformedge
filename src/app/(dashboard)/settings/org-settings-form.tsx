"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SA_CONSTRUCTION_INDUSTRIES } from "@/lib/constants"
import { updateOrgSettings } from "./actions"

const formSchema = z.object({
  industry: z.string().max(100).optional(),
  country: z.string().max(2).default("ZA"),
  autoClassifyOnUpload: z.boolean().default(true),
})

interface OrgSettingsFormProps {
  org: { id: string; name: string; industry: string | null; country: string; settings: unknown }
}

export function OrgSettingsForm({ org }: OrgSettingsFormProps) {
  const [isPending, startTransition] = useTransition()

  const settingsJson = (org.settings as Record<string, unknown>) ?? {}

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      industry: org.industry ?? "",
      country: org.country,
      autoClassifyOnUpload: settingsJson.autoClassifyOnUpload !== false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await updateOrgSettings(values)
      if (result.success) {
        toast.success("Settings updated")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Organization:</span>{" "}
          <span className="font-medium">{org.name}</span>
        </div>
        <FormField control={form.control} name="industry" render={({ field }) => (
          <FormItem>
            <FormLabel>Industry</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SA_CONSTRUCTION_INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="country" render={({ field }) => (
          <FormItem>
            <FormLabel>Country Code</FormLabel>
            <FormControl><Input placeholder="ZA" maxLength={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="autoClassifyOnUpload" render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Auto-classify on upload</FormLabel>
              <p className="text-sm text-muted-foreground">
                Automatically run AI classification when documents are uploaded
              </p>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  )
}
