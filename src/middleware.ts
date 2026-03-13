import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/projects(.*)",
  "/documents(.*)",
  "/assessments(.*)",
  "/capas(.*)",
  "/incidents(.*)",
  "/objectives(.*)",
  "/checklists(.*)",
  "/subcontractors(.*)",
  "/audit-packs(.*)",
  "/audit-trail(.*)",
  "/reports(.*)",
  "/gap-analysis(.*)",
  "/settings(.*)",
  "/billing(.*)",
  "/notifications(.*)",
  "/calendar(.*)",
  "/ims(.*)",
  "/cross-references(.*)",
  "/management-reviews(.*)",
  "/permits(.*)",
  "/partner(.*)",
  "/admin(.*)",
  "/api/download(.*)",
])

const isTermsRoute = createRouteMatcher(["/terms(.*)"])

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default hasClerkKey
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const { userId, sessionClaims } = await auth.protect()

        // Check terms acceptance via Clerk publicMetadata (fast path — no DB call)
        // Requires Clerk session token customization: { "metadata": "{{user.public_metadata}}" }
        // If "metadata" key doesn't exist in claims, session token isn't configured yet — skip check
        if ("metadata" in (sessionClaims ?? {})) {
          const metadata = sessionClaims?.metadata as
            | Record<string, unknown>
            | undefined
          const termsAcceptedAt = metadata?.termsAcceptedAt

          const isApiRoute = req.nextUrl.pathname.startsWith("/api/")
          if (!termsAcceptedAt && !isTermsRoute(req) && !isApiRoute) {
            const termsUrl = new URL("/terms", req.url)
            termsUrl.searchParams.set("next", req.nextUrl.pathname)
            return NextResponse.redirect(termsUrl)
          }
        }
      }
    })
  : function noopMiddleware() {
      // Fail closed — block all protected routes when Clerk is not configured
      const url = new URL("/", "http://localhost:3000")
      const pathname = arguments[0]?.nextUrl?.pathname || ""
      const isProtected = [
        "/dashboard", "/projects", "/documents", "/assessments", "/capas",
        "/incidents", "/objectives", "/checklists", "/subcontractors",
        "/audit-packs", "/audit-trail", "/reports", "/gap-analysis",
        "/settings", "/billing", "/notifications", "/calendar", "/ims",
        "/cross-references", "/management-reviews", "/permits", "/partner", "/admin", "/api/download",
      ].some((p) => pathname.startsWith(p))

      if (isProtected) {
        return NextResponse.json(
          { error: "Service unavailable: authentication not configured" },
          { status: 503 }
        )
      }
      return NextResponse.next()
    }

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
