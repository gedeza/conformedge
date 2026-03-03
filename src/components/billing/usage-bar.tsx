"use client"

import { cn } from "@/lib/utils"

interface UsageBarProps {
  label: string
  current: number
  limit: number | null
  unit?: string
  className?: string
}

export function UsageBar({ label, current, limit, unit = "", className }: UsageBarProps) {
  const isUnlimited = limit === null
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100)
  const isWarning = !isUnlimited && percentage >= 80
  const isExhausted = !isUnlimited && percentage >= 100

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {current.toLocaleString()}{unit}
          {isUnlimited ? " / Unlimited" : ` / ${limit.toLocaleString()}${unit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isExhausted
                ? "bg-destructive"
                : isWarning
                  ? "bg-orange-500"
                  : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="h-2 w-full rounded-full bg-primary/20" />
      )}
    </div>
  )
}
