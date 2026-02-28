import * as Sentry from "@sentry/nextjs"

interface ErrorContext {
  source: string
  orgId?: string
  userId?: string
  metadata?: Record<string, unknown>
}

export function captureError(error: unknown, context: ErrorContext) {
  console.error(`[${context.source}]`, error)

  Sentry.withScope((scope) => {
    scope.setTag("source", context.source)
    if (context.orgId) scope.setTag("orgId", context.orgId)
    if (context.userId) scope.setTag("userId", context.userId)
    if (context.metadata) scope.setExtras(context.metadata)
    Sentry.captureException(error)
  })
}
