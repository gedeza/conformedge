"use client"

import { useState } from "react"
import { HelpCircle, X, ChevronDown, ChevronUp, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"

interface HelpItem {
  icon?: LucideIcon
  label: string
  description: string
}

interface HelpPanelProps {
  title: string
  icon: LucideIcon
  summary: string
  items?: HelpItem[]
  tips?: string[]
  expandLabel?: string
  expandContent?: React.ReactNode
}

export function HelpPanel({
  title,
  icon: Icon,
  summary,
  items,
  tips,
  expandLabel,
  expandContent,
}: HelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const hasExpandable = expandLabel && (expandContent || tips)

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
      >
        <HelpCircle className="size-4" />
        {title}
      </Button>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 py-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-blue-600" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardAction>
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setIsOpen(false)}>
            <X className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-muted-foreground">{summary}</p>

        {items && items.length > 0 && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-start gap-2 rounded-md bg-white/70 p-2">
                {item.icon && <item.icon className="size-4 mt-0.5 shrink-0 text-blue-600" />}
                <div>
                  <p className="text-sm font-medium leading-none">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showMore && (
          <>
            {expandContent}
            {tips && (
              <div>
                <p className="text-sm font-medium mb-1">Tips:</p>
                <ul className="text-sm text-muted-foreground space-y-0.5 list-disc pl-4">
                  {tips.map((tip, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: tip }} />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {hasExpandable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMore(!showMore)}
            className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 -ml-2"
          >
            {showMore ? (
              <><ChevronUp className="size-3.5" />Show less</>
            ) : (
              <><ChevronDown className="size-3.5" />{expandLabel}</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
