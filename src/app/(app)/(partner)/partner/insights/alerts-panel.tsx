"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Check, X } from "lucide-react"
import { resolvePartnerAlert } from "./actions"

interface Alert {
  id: string
  alertType: string
  severity: string
  title: string
  description: string | null
  status: string
  createdAt: Date
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "CRITICAL": return "bg-red-100 text-red-800 border-red-200"
    case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200"
    case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default: return "bg-blue-100 text-blue-800 border-blue-200"
  }
}

function AlertRow({ alert }: { alert: Alert }) {
  const [isPending, startTransition] = useTransition()

  function handleResolve(action: "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      const result = await resolvePartnerAlert(alert.id, action)
      if (result.success) {
        toast.success(`Alert ${action.toLowerCase()}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
        alert.severity === "CRITICAL" ? "text-red-600" :
        alert.severity === "HIGH" ? "text-orange-600" :
        "text-yellow-600"
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={`text-[10px] ${getSeverityColor(alert.severity)}`}>
            {alert.severity}
          </Badge>
          <span className="text-xs font-medium truncate">{alert.title}</span>
        </div>
        {alert.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2">{alert.description}</p>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => handleResolve("RESOLVED")}
          disabled={isPending}
          title="Resolve"
        >
          <Check className="h-3.5 w-3.5 text-green-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => handleResolve("DISMISSED")}
          disabled={isPending}
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <Card className="border-orange-200 bg-orange-50/30 dark:bg-orange-950/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          Open Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map(alert => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
