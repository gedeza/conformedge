"use client"

import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrialBannerProps {
  daysRemaining: number
  className?: string
}

export function TrialBanner({ daysRemaining, className }: TrialBannerProps) {
  const isUrgent = daysRemaining <= 3

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border px-4 py-2.5 text-sm",
        isUrgent
          ? "border-destructive/50 bg-destructive/10 text-destructive"
          : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Clock className="size-4 shrink-0" />
        <span>
          {daysRemaining <= 0
            ? "Your free trial has expired."
            : daysRemaining === 1
              ? "Your free trial expires tomorrow."
              : `Your free trial expires in ${daysRemaining} days.`}
        </span>
      </div>
      <Link
        href="/billing"
        className={cn(
          "flex items-center gap-1 whitespace-nowrap font-medium underline-offset-4 hover:underline",
          isUrgent ? "text-destructive" : "text-blue-700 dark:text-blue-300"
        )}
      >
        Upgrade now
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
