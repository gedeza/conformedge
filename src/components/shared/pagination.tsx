import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  basePath: string
  /** Extra search params to preserve */
  searchParams?: Record<string, string>
}

export function Pagination({ page, totalPages, total, pageSize, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  function buildHref(p: number) {
    const params = new URLSearchParams(searchParams)
    if (p > 1) {
      params.set("page", String(p))
    } else {
      params.delete("page")
    }
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const showing = Math.min(page * pageSize, total)
  const from = (page - 1) * pageSize + 1

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{showing} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild disabled={page <= 1}>
          <Link href={buildHref(page - 1)} aria-disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
          <Link href={buildHref(page + 1)} aria-disabled={page >= totalPages}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
