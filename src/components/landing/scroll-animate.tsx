"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScrollAnimateProps {
  children: ReactNode
  className?: string
}

export function ScrollAnimate({ children, className }: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Only animate elements that start below the viewport
    if (el.getBoundingClientRect().top < window.innerHeight) return

    el.classList.add("scroll-hidden")

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("scroll-hidden")
          observer.unobserve(el)
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
