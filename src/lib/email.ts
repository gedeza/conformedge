import React from "react"
import { resend } from "@/lib/resend"
import { db } from "@/lib/db"
import { NotificationEmail, AuditPackEmail, ReferralWelcomeEmail } from "@/lib/email-templates"
import { captureError } from "@/lib/error-tracking"
import type { NotificationType } from "@/types"

const FROM_ADDRESS = "ConformEdge <noreply@isutech.co.za>"

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
        captureError(new Error(result.error.message), { source: "email.send", userId })
      }
    })
    .catch((err) => {
      captureError(err, { source: "email.send", userId })
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
 * Send referral partner welcome email with their referral link.
 * Fire-and-forget — errors logged, never thrown.
 */
export function sendReferralWelcomeEmail({
  to,
  partnerName,
  referralUrl,
  referralCode,
  dashboardUrl,
}: {
  to: string
  partnerName: string
  referralUrl: string
  referralCode: string
  dashboardUrl?: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"
  const brochureUrl = `${appUrl}/api/referral-partner/pdf`

  renderHtml(
    React.createElement(ReferralWelcomeEmail, {
      partnerName,
      referralUrl,
      referralCode,
      brochureUrl,
      dashboardUrl,
    })
  )
    .then((html) =>
      resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject: "Welcome to the ConformEdge Referral Partner Programme",
        html,
      })
    )
    .then((result) => {
      if (result && "error" in result && result.error) {
        captureError(new Error(result.error.message), { source: "email.referralWelcome" })
      }
    })
    .catch((err) => {
      captureError(err, { source: "email.referralWelcome" })
    })
}

/**
 * Send a plain-text email to a partner contact (fire-and-forget).
 * Used for billing notifications, overdue reminders, and suspension notices.
 */
export function sendPartnerEmail({
  to,
  subject,
  text,
}: {
  to: string
  subject: string
  text: string
}) {
  resend.emails
    .send({
      from: FROM_ADDRESS,
      to,
      subject,
      text,
    })
    .then((result) => {
      if (result && "error" in result && result.error) {
        captureError(new Error(result.error.message), { source: "email.partnerBilling" })
      }
    })
    .catch((err) => {
      captureError(err, { source: "email.partnerBilling" })
    })
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
      captureError(new Error(error.message), { source: "email.sendBulk" })
      return { success: false, error: "Failed to send email. Please try again." }
    }

    return { success: true }
  } catch (err) {
    captureError(err, { source: "email.sendBulk" })
    return { success: false, error: "Failed to send email. Please try again." }
  }
}
