"use client"

import { RouteError } from "@/components/shared/route-error"

export default function ChecklistsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} entityName="Checklist" backHref="/checklists" />
}
