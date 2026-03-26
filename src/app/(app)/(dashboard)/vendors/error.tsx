"use client"

import { RouteError } from "@/components/shared/route-error"

export default function VendorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} entityName="Vendor" backHref="/vendors" />
}
