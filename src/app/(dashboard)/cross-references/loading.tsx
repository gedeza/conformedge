import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CrossReferencesLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-5 w-5" />
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-72" />

      {/* Matrix card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-64" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Header row */}
          <div className="flex gap-2 mb-2">
            <Skeleton className="h-4 w-40" />
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
          {/* Data rows */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <Skeleton className="h-8 w-40" />
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-16" />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
