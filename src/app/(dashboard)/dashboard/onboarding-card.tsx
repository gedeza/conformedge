"use client"

import { useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CheckCircle2, Circle, ArrowRight, X, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { dismissOnboarding, type OnboardingStep } from "./actions"

interface OnboardingCardProps {
  steps: OnboardingStep[]
  completedCount: number
  totalSteps: number
}

export function OnboardingCard({ steps, completedCount, totalSteps }: OnboardingCardProps) {
  const [isPending, startTransition] = useTransition()
  const progress = (completedCount / totalSteps) * 100

  function handleDismiss() {
    startTransition(async () => {
      const result = await dismissOnboarding()
      if (result.success) {
        toast.success("Onboarding dismissed. You can always access these features from the sidebar.")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">Getting Started</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete these steps to set up your compliance workspace.
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss} disabled={isPending}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{completedCount} of {totalSteps} complete</span>
            <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={step.href}
              className={`flex items-center gap-3 rounded-md p-2.5 transition-colors ${
                step.completed
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{step.description}</p>
              </div>
              {!step.completed && (
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
