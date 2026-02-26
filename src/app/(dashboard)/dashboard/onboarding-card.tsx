"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useOrganization } from "@clerk/nextjs"
import { CheckCircle2, Circle, ArrowRight, X, Rocket, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { SA_CONSTRUCTION_INDUSTRIES } from "@/lib/constants"
import { dismissOnboarding, setOrgIndustry, type OnboardingStep } from "./actions"

interface OnboardingCardProps {
  steps: OnboardingStep[]
  completedCount: number
  totalSteps: number
}

export function OnboardingCard({ steps, completedCount, totalSteps }: OnboardingCardProps) {
  const [isPending, startTransition] = useTransition()
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const { organization } = useOrganization()
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

  function handleIndustryChange(value: string) {
    startTransition(async () => {
      const result = await setOrgIndustry(value)
      if (result.success) {
        toast.success("Industry updated successfully")
      } else {
        toast.error(result.error)
      }
    })
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return
    if (!organization) {
      toast.error("No organization found")
      return
    }

    setIsInviting(true)
    try {
      await organization.inviteMember({
        emailAddress: inviteEmail.trim(),
        role: "org:member",
      })
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation")
    } finally {
      setIsInviting(false)
    }
  }

  function renderStepContent(step: OnboardingStep) {
    if (step.id === "industry" && !step.completed) {
      return (
        <div className="flex items-center gap-3 rounded-md p-2.5 bg-muted/50">
          <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{step.title}</p>
            <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
            <Select onValueChange={handleIndustryChange} disabled={isPending}>
              <SelectTrigger className="w-full max-w-xs h-8 text-xs">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {SA_CONSTRUCTION_INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }

    if (step.id === "team" && !step.completed) {
      return (
        <div className="flex items-center gap-3 rounded-md p-2.5 bg-muted/50">
          <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{step.title}</p>
            <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
            <div className="flex gap-2 max-w-sm">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleInvite()
                  }
                }}
                className="h-8 text-xs"
                disabled={isInviting}
              />
              <Button
                size="sm"
                className="h-8 text-xs shrink-0"
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail.trim()}
              >
                {isInviting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Invite"
                )}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Default: link-based step (for project, document, checklist, or completed steps)
    return (
      <Link
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
    )
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
            <div key={step.id}>
              {renderStepContent(step)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
