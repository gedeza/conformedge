import React from "react"
import { resend } from "@/lib/resend"
import { db } from "@/lib/db"
import { NotificationEmail, AuditPackEmail } from "@/lib/email-templates"
import type { NotificationType } from "@/types"

const FROM_ADDRESS = "ConformEdge <onboarding@resend.dev>"

async function renderHtml(element: React.ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server")
  return renderToStaticMarkup(element)
}

/**
 * Send a notification email to a single user (fire-and-forget).
 * Looks up user email from DB, renders template, sends via Resend.
 * Errors are logged but never thrown.
 */
export function sendNotificationEmail({
  userId,
  title,
  message,
  type,
}: {
  userId: string
  title: string
  message: string
  type: NotificationType
}) {
  db.user
    .findUnique({ where: { id: userId }, select: { email: true } })
    .then(async (user) => {
      if (!user?.email) {
        console.warn(`sendNotificationEmail: no email for user ${userId}`)
        return
      }

      const html = await renderHtml(
        React.createElement(NotificationEmail, { title, message, type })
      )

      return resend.emails.send({
        from: FROM_ADDRESS,
        to: user.email,
        subject: title,
        html,
      })
    })
    .then((result) => {
      if (result && "error" in result && result.error) {
        console.error("Resend send error:", result.error)
      }
    })
    .catch((err) => {
      console.error("sendNotificationEmail failed:", err)
    })
}

/**
 * Send notification emails to multiple users (fire-and-forget).
 * Sends individual emails to each user.
 */
export function sendNotificationEmailBulk({
  userIds,
  title,
  message,
  type,
}: {
  userIds: string[]
  title: string
  message: string
  type: NotificationType
}) {
  for (const userId of userIds) {
    sendNotificationEmail({ userId, title, message, type })
  }
}

/**
 * Send an audit pack PDF via email.
 * NOT fire-and-forget — returns result for UI feedback.
 */
export async function sendAuditPackEmail({
  to,
  subject,
  packTitle,
  organizationName,
  pdfBuffer,
}: {
  to: string | string[]
  subject: string
  packTitle: string
  organizationName: string
  pdfBuffer: Buffer
}): Promise<{ success: boolean; error?: string }> {
  try {
    const html = await renderHtml(
      React.createElement(AuditPackEmail, { packTitle, organizationName })
    )

    const filename = `${packTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
    const recipients = Array.isArray(to) ? to : [to]

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: recipients,
      subject,
      html,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    })

    if (error) {
      console.error("Audit pack email error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("sendAuditPackEmail failed:", err)
    return { success: false, error: message }
  }
}
