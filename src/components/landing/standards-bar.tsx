import { Badge } from "@/components/ui/badge"
import { ISO_STANDARDS } from "./data"

export function StandardsBar() {
  return (
    <section className="border-y bg-landing-light-bg py-10">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          15 Compliance Frameworks &middot; 534+ Sub-Clauses &middot; Complete Coverage
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {ISO_STANDARDS.map((std) => (
            <Badge
              key={std.code}
              variant="outline"
              className="rounded-lg border-landing-accent/30 bg-white px-4 py-2 text-sm font-medium shadow-sm"
            >
              <span className="font-semibold text-landing-navy">{std.code}</span>
              <span className="ml-1.5 text-muted-foreground">{std.name}</span>
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
