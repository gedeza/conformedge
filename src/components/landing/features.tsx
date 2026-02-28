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
      "Upload a document and AI instantly matches it to the right ISO standards and clauses — with accuracy ratings you can verify.",
    icon: FileText,
  },
  {
    title: "Gap Assessments",
    description:
      "Quickly identify what compliance items are missing or at risk across any ISO standard your organisation follows.",
    icon: ClipboardCheck,
  },
  {
    title: "Corrective & Preventive Actions",
    description:
      "Track issues from discovery to resolution with root cause analysis, action items, and automatic escalation for overdue items.",
    icon: AlertTriangle,
  },
  {
    title: "Compliance Checklists",
    description:
      "Ready-made checklists for each ISO standard. Track completion, attach evidence, and assign items to team members.",
    icon: CheckSquare,
  },
  {
    title: "Subcontractor Management",
    description:
      "Monitor subcontractor certifications, BEE levels, safety ratings, and get alerts before certificates expire.",
    icon: HardHat,
  },
  {
    title: "Audit Pack Generation",
    description:
      "Compile all required evidence and documentation into a professional PDF audit pack with one click.",
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
