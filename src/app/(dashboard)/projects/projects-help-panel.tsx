"use client"

import { useState } from "react"
import {
  HelpCircle,
  X,
  FolderKanban,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card"

const LINKED_ENTITIES = [
  {
    icon: FileText,
    name: "Documents",
    description: "Policies, procedures, SOPs, and certificates relevant to this initiative",
  },
  {
    icon: ClipboardCheck,
    name: "Assessments",
    description: "Compliance assessments and audit findings scoped to this project",
  },
  {
    icon: AlertTriangle,
    name: "CAPAs",
    description: "Corrective and preventive actions arising from project assessments",
  },
  {
    icon: CheckSquare,
    name: "Checklists",
    description: "Compliance checklists tracking clause-by-clause conformance",
  },
  {
    icon: Package,
    name: "Audit Packs",
    description: "Bundled evidence packs for external auditors or clients",
  },
]

const LIFECYCLE_STEPS = [
  { status: "Planning", color: "bg-blue-100 text-blue-800", description: "Setting up scope, assigning documents and checklists" },
  { status: "Active", color: "bg-green-100 text-green-800", description: "Work underway — assessments being conducted, CAPAs being resolved" },
  { status: "On Hold", color: "bg-yellow-100 text-yellow-800", description: "Temporarily paused (e.g. awaiting client input)" },
  { status: "Completed", color: "bg-gray-100 text-gray-800", description: "All work done, compliance targets met" },
  { status: "Archived", color: "bg-gray-100 text-gray-600", description: "Historical record, no longer actively managed" },
]

export function ProjectsHelpPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
      >
        <HelpCircle className="size-4" />
        How to use Projects
      </Button>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 py-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderKanban className="size-5 text-blue-600" />
          <CardTitle className="text-base">How to use Projects</CardTitle>
        </div>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setIsOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* What are Projects */}
        <div>
          <p className="text-sm text-muted-foreground">
            Projects are <strong>compliance initiative containers</strong> that group all related work under one umbrella.
            Use them to track progress and measure compliance for a specific certification drive, construction site, or audit preparation.
          </p>
        </div>

        {/* Examples */}
        <div>
          <p className="text-sm font-medium mb-1.5">Examples of projects:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>ISO 9001 Certification — Phase 1</li>
            <li>Greenfield Site — Midrand Depot</li>
            <li>Annual Surveillance Audit 2026</li>
            <li>BEE Compliance Renewal</li>
          </ul>
        </div>

        {/* What you can link */}
        <div>
          <p className="text-sm font-medium mb-1.5">What you can link to a project:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {LINKED_ENTITIES.map((entity) => (
              <div key={entity.name} className="flex items-start gap-2 rounded-md bg-white/70 p-2">
                <entity.icon className="size-4 mt-0.5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-medium leading-none">{entity.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable section */}
        {showMore && (
          <>
            {/* Lifecycle */}
            <div>
              <p className="text-sm font-medium mb-1.5">Project lifecycle:</p>
              <div className="flex flex-wrap gap-2">
                {LIFECYCLE_STEPS.map((step, i) => (
                  <div key={step.status} className="flex items-center gap-1.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${step.color}`}>
                      {step.status}
                    </span>
                    {i < LIFECYCLE_STEPS.length - 1 && (
                      <span className="text-muted-foreground text-xs">&rarr;</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 space-y-1">
                {LIFECYCLE_STEPS.map((step) => (
                  <p key={step.status} className="text-xs text-muted-foreground">
                    <strong>{step.status}:</strong> {step.description}
                  </p>
                ))}
              </div>
            </div>

            {/* Dashboard metrics */}
            <div>
              <p className="text-sm font-medium mb-1.5">Project dashboard shows:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li><strong>Compliance Score</strong> — % of checklist items marked compliant</li>
                <li><strong>Checklist Progress</strong> — completed checklists vs total</li>
                <li><strong>Overdue CAPAs</strong> — corrective actions past their due date</li>
                <li><strong>Risk Distribution</strong> — assessment findings by severity</li>
                <li><strong>Compliance Trend</strong> — 12-month chart of scores over time</li>
                <li><strong>Gap Analysis</strong> — per-standard coverage showing which clauses are covered</li>
              </ul>
            </div>

            {/* Good to know */}
            <div>
              <p className="text-sm font-medium mb-1.5">Good to know:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li>Projects are <strong>optional</strong> — entities can exist without being linked to any project</li>
                <li>Deleting a project <strong>does not delete its contents</strong> — linked items are simply unlinked</li>
                <li>You can <strong>filter by project</strong> across Documents, Assessments, CAPAs, and Checklists pages</li>
                <li>Assign entities to a project using the <strong>Project dropdown</strong> when creating or editing them</li>
              </ul>
            </div>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMore(!showMore)}
          className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 -ml-2"
        >
          {showMore ? (
            <>
              <ChevronUp className="size-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5" />
              Lifecycle, dashboard metrics & tips
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
