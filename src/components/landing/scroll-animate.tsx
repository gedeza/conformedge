"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScrollAnimateProps {
  children: ReactNode
  className?: string
}

export function ScrollAnimate({ children, className }: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Start visible to avoid flash-of-invisible on SSR/hydration
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    // Only animate elements that start below the viewport
    if (rect.top >= window.innerHeight) {
      setShouldAnimate(true)

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setAnimated(true)
            observer.unobserve(el)
          }
        },
        { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
      )

      observer.observe(el)
      return () => observer.disconnect()
    }
    // Element is already in viewport — no animation needed
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        shouldAnimate && "transition-all duration-700 ease-out",
        shouldAnimate && !animated ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0",
        className
      )}
    >
      {children}
    </div>
  )
}
