"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Keep splash visible for 10s so users can read the message
    const timer = setTimeout(() => setFadeOut(true), 10000)
    // Remove from DOM after fade animation completes
    const remove = setTimeout(() => setVisible(false), 10500)
    return () => {
      clearTimeout(timer)
      clearTimeout(remove)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
        <Image
          src="/images/logo-icon.png"
          alt=""
          width={72}
          height={72}
          className="rounded-2xl"
          priority
        />
        <h1 className="text-xl font-semibold tracking-tight text-white">
          ConformEdge
        </h1>
        <p className="text-sm text-slate-400">
          AI-Powered SHEQ & Compliance
        </p>
        <div className="mt-4 h-1 w-24 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-full animate-pulse rounded-full bg-slate-500" />
        </div>
      </div>
    </div>
  )
}
