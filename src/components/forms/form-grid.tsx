import { cn } from "@/lib/utils"

interface FormGridProps {
  cols?: 2 | 3 | 4
  className?: string
  children: React.ReactNode
}

export function FormGrid({ cols = 2, className, children }: FormGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        cols === 2 && "sm:grid-cols-2",
        cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}
