import {
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  HardHat,
  Package,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const features = [
  {
    title: "Smart Document Classification",
    description:
      "AI automatically classifies documents against ISO clause requirements with confidence scoring.",
    icon: FileText,
  },
  {
    title: "Gap Assessments",
    description:
      "Identify compliance gaps with intelligent assessments mapped to standard clauses.",
    icon: ClipboardCheck,
  },
  {
    title: "CAPA Management",
    description:
      "Track corrective and preventive actions from identification through verification.",
    icon: AlertTriangle,
  },
  {
    title: "Compliance Checklists",
    description:
      "Standard-specific checklists with evidence tracking and progress monitoring.",
    icon: CheckSquare,
  },
  {
    title: "Subcontractor Management",
    description:
      "Monitor subcontractor certifications, safety ratings, and compliance status.",
    icon: HardHat,
  },
  {
    title: "Audit Pack Generation",
    description:
      "One-click audit pack compilation with all required evidence and documentation.",
    icon: Package,
  },
] as const

export function Features() {
  return (
    <section id="features" className="bg-muted/50 py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Everything You Need for ISO Compliance
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="size-10 text-primary" />
                <CardTitle className="mt-2">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
