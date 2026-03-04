"use client"

import { useState, useTransition } from "react"
import { Link2, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getClauseCrossReferences, type CrossRefItem } from "./cross-ref-actions"

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  EQUIVALENT: {
    label: "Equivalent",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  RELATED: {
    label: "Related",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  SUPPORTING: {
    label: "Supporting",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
}

interface Props {
  clauseId: string
  count: number
}

export function CrossRefPopover({ clauseId, count }: Props) {
  const [refs, setRefs] = useState<CrossRefItem[] | null>(null)
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen && !refs) {
      startTransition(async () => {
        const data = await getClauseCrossReferences(clauseId)
        setRefs(data)
      })
    }
  }

  // Group refs by mapping type
  const grouped = refs
    ? refs.reduce<Record<string, CrossRefItem[]>>((acc, item) => {
        ;(acc[item.mappingType] ??= []).push(item)
        return acc
      }, {})
    : {}

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="Cross-references to other standards"
        >
          <Link2 className="h-3 w-3" />
          <span>{count}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto p-3" align="end">
        <p className="text-sm font-medium mb-2">Cross-References</p>

        {pending && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {refs && refs.length === 0 && (
          <p className="text-xs text-muted-foreground">No cross-references found.</p>
        )}

        {refs && refs.length > 0 && (
          <div className="space-y-3">
            {(["EQUIVALENT", "RELATED", "SUPPORTING"] as const).map((type) => {
              const items = grouped[type]
              if (!items || items.length === 0) return null
              const badge = TYPE_BADGES[type]

              return (
                <div key={type}>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium mb-1",
                      badge.className
                    )}
                  >
                    {badge.label} ({items.length})
                  </span>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.clauseId}
                        className="flex items-start gap-2 py-1 px-1.5 rounded text-xs hover:bg-muted/50"
                      >
                        <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-0.5">
                          {item.standardCode}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium">
                            {item.clauseNumber} — {item.title}
                          </p>
                          {item.notes && (
                            <p className="text-muted-foreground mt-0.5">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
