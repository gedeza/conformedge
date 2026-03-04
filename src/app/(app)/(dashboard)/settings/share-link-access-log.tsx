"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getShareLinkAccessLog } from "./share-link-actions"

interface ShareLinkAccessLogProps {
  linkId: string
  onClose: () => void
}

type AccessEntry = Awaited<ReturnType<typeof getShareLinkAccessLog>>[number]

export function ShareLinkAccessLog({ linkId, onClose }: ShareLinkAccessLogProps) {
  const [entries, setEntries] = useState<AccessEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getShareLinkAccessLog(linkId)
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [linkId])

  return (
    <Dialog open onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Access Log</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No access recorded yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(entry.createdAt), "PP p")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {entry.ipAddress ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                      {entry.userAgent ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
