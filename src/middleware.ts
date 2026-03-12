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
  "/api/download(.*)",
])

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default hasClerkKey
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect()
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
        "/cross-references", "/management-reviews", "/permits", "/api/download",
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
