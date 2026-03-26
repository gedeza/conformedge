"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, AlertTriangle, CheckSquare, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const QUICK_ACTIONS = [
  { label: "Report Incident", href: "/incidents/new", icon: AlertTriangle, color: "bg-red-500" },
  { label: "New Checklist", href: "/checklists", icon: CheckSquare, color: "bg-blue-500" },
  { label: "New Permit", href: "/permits", icon: ShieldCheck, color: "bg-amber-500" },
]

export function MobileFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="fixed bottom-20 right-4 z-50 md:hidden">
      {/* Action buttons */}
      <div
        className={cn(
          "flex flex-col-reverse items-end gap-3 mb-3 transition-all duration-200",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.href}
            onClick={() => {
              setIsOpen(false)
              router.push(action.href)
            }}
            className="flex items-center gap-2 rounded-full bg-white shadow-lg border pl-3 pr-4 py-2 text-sm font-medium active:scale-95 transition-transform"
          >
            <span className={cn("rounded-full p-1.5 text-white", action.color)}>
              <action.icon className="h-3.5 w-3.5" />
            </span>
            {action.label}
          </button>
        ))}
      </div>

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-all duration-200 active:scale-95",
          isOpen
            ? "bg-muted-foreground text-white rotate-45"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
