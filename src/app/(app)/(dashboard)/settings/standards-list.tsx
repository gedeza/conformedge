"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toggleStandardActive } from "./actions"

interface StandardsListProps {
  standards: Array<{
    id: string
    code: string
    name: string
    version: string | null
    isActive: boolean
  }>
}

export function StandardsList({ standards }: StandardsListProps) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(standardId: string, isActive: boolean) {
    startTransition(async () => {
      const result = await toggleStandardActive(standardId, isActive)
      if (result.success) {
        toast.success(isActive ? "Standard enabled" : "Standard disabled")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-3">
      {standards.map((standard) => (
        <div key={standard.id} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label className="font-medium">{standard.code}</Label>
            <p className="text-sm text-muted-foreground">{standard.name}</p>
            {standard.version && (
              <p className="text-xs text-muted-foreground">Version: {standard.version}</p>
            )}
          </div>
          <Switch
            checked={standard.isActive}
            onCheckedChange={(checked) => handleToggle(standard.id, checked)}
            disabled={isPending}
          />
        </div>
      ))}
    </div>
  )
}
