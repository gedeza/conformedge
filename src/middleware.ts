import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/projects(.*)",
  "/documents(.*)",
  "/assessments(.*)",
  "/capas(.*)",
  "/checklists(.*)",
  "/subcontractors(.*)",
  "/audit-packs(.*)",
  "/audit-trail(.*)",
  "/reports(.*)",
  "/gap-analysis(.*)",
  "/settings(.*)",
])

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default hasClerkKey
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect()
      }
    })
  : function noopMiddleware() {
      return NextResponse.next()
    }

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
