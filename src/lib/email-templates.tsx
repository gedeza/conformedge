import React from "react"
import type { NotificationType } from "@/types"

const BRAND_COLOR = "#1e3a5f"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

const TYPE_CONFIG: Record<NotificationType, { color: string; label: string; hint: string }> = {
  DOCUMENT_EXPIRY: {
    color: "#ea580c",
    label: "Document Expiry",
    hint: "Please review and upload an updated version.",
  },
  CAPA_DUE: {
    color: "#dc2626",
    label: "CAPA Due",
    hint: "Overdue CAPAs may be auto-escalated.",
  },
  ASSESSMENT_SCHEDULED: {
    color: "#2563eb",
    label: "Assessment Scheduled",
    hint: "Ensure documentation is prepared.",
  },
  CERT_EXPIRY: {
    color: "#ca8a04",
    label: "Certification Expiry",
    hint: "Contact the subcontractor for an updated certificate.",
  },
  SYSTEM: {
    color: "#6b7280",
    label: "System",
    hint: "",
  },
  APPROVAL_REQUEST: {
    color: "#7c3aed",
    label: "Approval Request",
    hint: "Please review the document and approve or reject.",
  },
  CERT_UPLOAD: {
    color: "#d97706",
    label: "Certificate Upload",
    hint: "Review the uploaded certificate and approve or reject it.",
  },
  CHECKLIST_DUE: {
    color: "#059669",
    label: "Checklist Due",
    hint: "Complete the checklist before the next cycle.",
  },
  INCIDENT_REPORTED: {
    color: "#dc2626",
    label: "Incident Reported",
    hint: "Investigate the incident and take corrective action promptly.",
  },
  OBJECTIVE_DUE: {
    color: "#4f46e5",
    label: "Objective Due",
    hint: "Review your objective progress and record a measurement if needed.",
  },
  SUBSCRIPTION_TRIAL_ENDING: {
    color: "#2563eb",
    label: "Trial Ending Soon",
    hint: "Upgrade to keep using ConformEdge after your trial ends.",
  },
  SUBSCRIPTION_PAYMENT_FAILED: {
    color: "#dc2626",
    label: "Payment Failed",
    hint: "Your payment failed. Update your payment method within the grace period to avoid cancellation. Visit your billing page to resolve this.",
  },
  SUBSCRIPTION_CANCELLED: {
    color: "#6b7280",
    label: "Subscription Cancelled",
    hint: "Your subscription has been cancelled.",
  },
  QUOTA_LIMIT_REACHED: {
    color: "#ea580c",
    label: "Quota Reached",
    hint: "Upgrade your plan or purchase credit packs to continue.",
  },
  QUOTA_WARNING: {
    color: "#ca8a04",
    label: "Approaching Limit",
    hint: "You're nearing your plan limit. Consider upgrading.",
  },
  TEAM_INVITATION: {
    color: "#2563eb",
    label: "Team Invitation",
    hint: "",
  },
  MANAGEMENT_REVIEW_DUE: {
    color: "#7c3aed",
    label: "Management Review",
    hint: "A management review is scheduled or upcoming.",
  },
  PERMIT_EXPIRING: {
    color: "#ea580c",
    label: "Permit Expiring",
    hint: "Review and renew the work permit or close out the job before it expires.",
  },
}

function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f4f4f5", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#f4f4f5", padding: "32px 0" }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="600" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td style={{ backgroundColor: BRAND_COLOR, padding: "24px 32px" }}>
                        <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold" }}>
                          ConformEdge
                        </span>
                      </td>
                    </tr>
                    {/* Body */}
                    <tr>
                      <td style={{ padding: "32px" }}>
                        {children}
                      </td>
                    </tr>
                    {/* Footer */}
                    <tr>
                      <td style={{ padding: "24px 32px", borderTop: "1px solid #e4e4e7", color: "#71717a", fontSize: "12px" }}>
                        <p style={{ margin: "0 0 8px 0" }}>
                          This is an automated notification from ConformEdge.
                        </p>
                        <p style={{ margin: 0, color: "#a1a1aa" }}>
                          &copy; {new Date().getFullYear()} ISU Technologies. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "9999px",
        backgroundColor: color,
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </span>
  )
}

function CTAButton({ href, label }: { href: string; label: string }) {
  return (
    <table cellPadding={0} cellSpacing={0} style={{ marginTop: "24px" }}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: BRAND_COLOR,
              borderRadius: "6px",
              padding: "12px 24px",
            }}
          >
            <a
              href={href}
              style={{
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {label}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

interface NotificationEmailProps {
  title: string
  message: string
  type: NotificationType
}

export function NotificationEmail({ title, message, type }: NotificationEmailProps) {
  const config = TYPE_CONFIG[type]

  return (
    <EmailLayout>
      <Badge color={config.color} label={config.label} />
      <h1 style={{ fontSize: "20px", color: "#18181b", margin: "16px 0 8px 0" }}>
        {title}
      </h1>
      <p style={{ fontSize: "14px", color: "#3f3f46", lineHeight: "1.6", margin: "0 0 8px 0" }}>
        {message}
      </p>
      {config.hint && (
        <p style={{ fontSize: "13px", color: "#71717a", lineHeight: "1.5", margin: "0 0 16px 0" }}>
          {config.hint}
        </p>
      )}
      <CTAButton href={`${APP_URL}/dashboard`} label="View in Dashboard" />
    </EmailLayout>
  )
}

interface AuditPackEmailProps {
  packTitle: string
  organizationName: string
}

export function AuditPackEmail({ packTitle, organizationName }: AuditPackEmailProps) {
  return (
    <EmailLayout>
      <Badge color={BRAND_COLOR} label="Audit Pack" />
      <h1 style={{ fontSize: "20px", color: "#18181b", margin: "16px 0 8px 0" }}>
        Audit Pack: {packTitle}
      </h1>
      <p style={{ fontSize: "14px", color: "#3f3f46", lineHeight: "1.6", margin: "0 0 8px 0" }}>
        Please find the attached audit pack PDF for <strong>{organizationName}</strong>.
      </p>
      <p style={{ fontSize: "13px", color: "#71717a", lineHeight: "1.5", margin: "0 0 16px 0" }}>
        This document contains compliance assessments, document reviews, CAPA summaries, and checklist results.
      </p>
      <CTAButton href={`${APP_URL}/dashboard/audit-packs`} label="View Audit Packs" />
    </EmailLayout>
  )
}

interface InvitationEmailProps {
  organizationName: string
  inviterName: string
  role: string
  customMessage?: string | null
  acceptUrl: string
  expiresAt: Date
}

export function InvitationEmail({
  organizationName,
  inviterName,
  role,
  customMessage,
  acceptUrl,
  expiresAt,
}: InvitationEmailProps) {
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase()
  const expiryDate = expiresAt.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <EmailLayout>
      <Badge color="#2563eb" label="Team Invitation" />
      <h1 style={{ fontSize: "20px", color: "#18181b", margin: "16px 0 8px 0" }}>
        You&apos;ve been invited to join <strong>{organizationName}</strong>
      </h1>
      <p style={{ fontSize: "14px", color: "#3f3f46", lineHeight: "1.6", margin: "0 0 16px 0" }}>
        <strong>{inviterName}</strong> has invited you to join their team as{" "}
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "4px",
            backgroundColor: "#dbeafe",
            color: "#1e40af",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {roleLabel}
        </span>
        .
      </p>

      {customMessage && (
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: "0 0 16px 0" }}>
          <tbody>
            <tr>
              <td
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#f0f9ff",
                  borderLeft: "3px solid #2563eb",
                  borderRadius: "0 4px 4px 0",
                  fontSize: "13px",
                  color: "#1e3a5f",
                  lineHeight: "1.5",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{customMessage}&rdquo;
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <CTAButton href={acceptUrl} label="Accept Invitation" />

      <p style={{ fontSize: "12px", color: "#71717a", margin: "16px 0 0 0", lineHeight: "1.5" }}>
        This invitation expires on <strong>{expiryDate}</strong>.
      </p>
      <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "8px 0 0 0", wordBreak: "break-all" }}>
        If the button doesn&apos;t work, copy and paste this link:{" "}
        <a href={acceptUrl} style={{ color: "#2563eb" }}>
          {acceptUrl}
        </a>
      </p>
    </EmailLayout>
  )
}
