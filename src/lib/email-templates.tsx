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
