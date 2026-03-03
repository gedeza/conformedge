"use client"

import Link from "next/link"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface UpgradePromptProps {
  feature: string
  message: string
  className?: string
}

export function UpgradePrompt({ feature, message, className }: UpgradePromptProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="size-4" />
      <AlertTitle>{feature} — Upgrade Required</AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between gap-4">
        <span>{message}</span>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href="/billing">
            View Plans
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
