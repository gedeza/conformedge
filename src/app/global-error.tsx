"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fafafa" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              maxWidth: 400,
              padding: 32,
              textAlign: "center",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Something went wrong</h2>
            <p style={{ color: "#666", fontSize: 14, margin: "0 0 16px" }}>
              A critical error occurred. Please try again.
            </p>
            {error.digest && (
              <p style={{ color: "#999", fontSize: 12, fontFamily: "monospace", margin: "0 0 16px" }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: 4,
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
