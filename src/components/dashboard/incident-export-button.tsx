"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Download, FileSpreadsheet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/shared/date-picker"
import { toast } from "sonner"

export function IncidentExportButton() {
  const currentYear = new Date().getFullYear()
  const [from, setFrom] = useState<Date | undefined>(new Date(currentYear, 0, 1))
  const [to, setTo] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    if (!from || !to) {
      toast.error("Please select both start and end dates.")
      return
    }

    if (from > to) {
      toast.error("Start date must be before end date.")
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      })

      const response = await fetch(`/api/incidents/export?${params}`)

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? `Export failed (${response.status})`)
      }

      // Trigger download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `COIDA-Incidents-${format(from, "yyyy-MM-dd")}-to-${format(to, "yyyy-MM-dd")}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("COIDA incident export downloaded.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10">
            <FileSpreadsheet className="size-4 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">COIDA Annual Return Export</CardTitle>
            <CardDescription className="text-xs">
              Export incident data for W.Cl.2 reporting and COIDA annual returns
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">From</Label>
            <DatePicker
              value={from}
              onChange={setFrom}
              placeholder="Start date"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">To</Label>
            <DatePicker
              value={to}
              onChange={setTo}
              placeholder="End date"
            />
          </div>
          <Button
            onClick={handleExport}
            disabled={loading || !from || !to}
            size="sm"
            className="gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {loading ? "Generating..." : "Export CSV"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
