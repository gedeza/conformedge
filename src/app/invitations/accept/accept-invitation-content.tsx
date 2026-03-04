"use client"

import { useEffect, useState, useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useUser, SignInButton } from "@clerk/nextjs"
import { CheckCircle2, XCircle, Mail, Shield, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInvitationByCode, acceptInvitation, type InvitationDetails } from "./actions"

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "details"; invitation: InvitationDetails }
  | { kind: "accepted" }

export function AcceptInvitationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const [view, setView] = useState<ViewState>({ kind: "loading" })
  const [isPending, startTransition] = useTransition()

  const code = searchParams.get("code") ?? ""

  useEffect(() => {
    if (!code) {
      setView({ kind: "error", message: "No invitation code provided" })
      return
    }

    getInvitationByCode(code).then((result) => {
      if (result.success && result.data) {
        setView({ kind: "details", invitation: result.data })
      } else {
        setView({ kind: "error", message: result.error ?? "Invalid invitation" })
      }
    })
  }, [code])

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvitation(code)
      if (result.success) {
        setView({ kind: "accepted" })
        // Redirect to dashboard after short delay
        setTimeout(() => router.push("/dashboard"), 2000)
      } else {
        setView({ kind: "error", message: result.error ?? "Failed to accept" })
      }
    })
  }

  if (view.kind === "loading") {
    return (
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="flex flex-col items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading invitation...</p>
        </CardContent>
      </Card>
    )
  }

  if (view.kind === "error") {
    return (
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="flex flex-col items-center py-12">
          <XCircle className="h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold">Invitation Unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
            {view.message}
          </p>
          <Button variant="outline" className="mt-6" onClick={() => router.push("/")}>
            Go to Homepage
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (view.kind === "accepted") {
    return (
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="flex flex-col items-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-lg font-semibold">Welcome aboard!</h2>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            You&apos;ve joined the organization. Redirecting to dashboard...
          </p>
        </CardContent>
      </Card>
    )
  }

  const { invitation } = view
  const roleLabel = invitation.role.charAt(0) + invitation.role.slice(1).toLowerCase()
  const expiryDate = new Date(invitation.expiresAt).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Team Invitation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            <strong>{invitation.inviterName}</strong> has invited you to join
          </p>
          <p className="text-lg font-semibold mt-1">{invitation.organizationName}</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm">
            Role: <span className="font-medium">{roleLabel}</span>
          </span>
        </div>

        {invitation.customMessage && (
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200 italic">
              &ldquo;{invitation.customMessage}&rdquo;
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Expires {expiryDate}</span>
        </div>

        {!isLoaded ? (
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : isSignedIn ? (
          <Button className="w-full" size="lg" onClick={handleAccept} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <SignInButton
              mode="modal"
              forceRedirectUrl={`/invitations/accept?code=${code}`}
            >
              <Button className="w-full" size="lg">
                Sign in to Accept
              </Button>
            </SignInButton>
            <p className="text-xs text-center text-muted-foreground">
              Don&apos;t have an account? Sign up first, then return to this link.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
