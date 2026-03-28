"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Keep splash visible for 5s so users can read the message
    const timer = setTimeout(() => setFadeOut(true), 5000)
    // Remove from DOM after fade animation completes
    const remove = setTimeout(() => setVisible(false), 5500)
    return () => {
      clearTimeout(timer)
      clearTimeout(remove)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617",
        transition: "opacity 500ms ease-out",
        opacity: fadeOut ? 0 : 1,
        /* Prevent scroll behind splash on mobile */
        touchAction: "none",
        overscrollBehavior: "none",
        /* Safe area for notched devices */
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        /* Use dvh to avoid mobile address bar glitch */
        minHeight: "100dvh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: fadeOut ? 0 : 1,
          transform: fadeOut ? "scale(0.95)" : "scale(1)",
          transition: "opacity 400ms ease-out, transform 400ms ease-out",
          /* Prevent layout shift */
          willChange: "opacity, transform",
        }}
      >
        <Image
          src="/images/logo-icon.png"
          alt=""
          width={72}
          height={72}
          className="rounded-2xl"
          style={{ width: 72, height: 72 }}
          priority
        />
        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            color: "#ffffff",
            margin: 0,
            textAlign: "center",
          }}
        >
          ConformEdge
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#94a3b8",
            margin: 0,
            textAlign: "center",
            paddingInline: 24,
          }}
        >
          AI-Powered SHEQ & Compliance
        </p>
        <div
          style={{
            marginTop: 16,
            height: 4,
            width: 96,
            overflow: "hidden",
            borderRadius: 9999,
            backgroundColor: "#1e293b",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              borderRadius: 9999,
              backgroundColor: "#64748b",
              animation: "splash-pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Inline keyframes — avoids Tailwind animation glitches on mobile */}
      <style>{`
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
