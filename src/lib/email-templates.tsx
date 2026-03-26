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
  INVESTIGATION_OVERDUE: {
    color: "#dc2626",
    label: "Investigation Overdue",
    hint: "An incident investigation has passed its due date. Take immediate action.",
  },
  STATUTORY_DEADLINE: {
    color: "#b91c1c",
    label: "Statutory Deadline",
    hint: "A statutory reporting deadline is approaching. Submit the required report.",
  },
  CALIBRATION_DUE: {
    color: "#0891b2",
    label: "Calibration Due",
    hint: "Equipment calibration is due. Schedule calibration to maintain compliance.",
  },
  CALIBRATION_OVERDUE: {
    color: "#dc2626",
    label: "Calibration Overdue",
    hint: "Equipment calibration is overdue. Quarantine equipment until calibrated.",
  },
  MAINTENANCE_DUE: {
    color: "#0d9488",
    label: "Maintenance Due",
    hint: "Scheduled equipment maintenance is approaching.",
  },
  EQUIPMENT_QUARANTINED: {
    color: "#dc2626",
    label: "Equipment Quarantined",
    hint: "Equipment has been quarantined due to safety concerns. Do not use until resolved.",
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
                          &copy; 2025&ndash;{new Date().getFullYear()} ISU Technologies. All rights reserved.
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

interface ReferralWelcomeEmailProps {
  partnerName: string
  referralUrl: string
  referralCode: string
  brochureUrl: string
  dashboardUrl?: string
}

export function ReferralWelcomeEmail({ partnerName, referralUrl, referralCode, brochureUrl, dashboardUrl }: ReferralWelcomeEmailProps) {
  return (
    <EmailLayout>
      <Badge color="#f59e0b" label="Referral Partner" />
      <h1 style={{ fontSize: "20px", color: "#18181b", margin: "16px 0 8px 0" }}>
        Welcome to the ConformEdge Referral Programme
      </h1>
      <p style={{ fontSize: "14px", color: "#3f3f46", lineHeight: "1.6", margin: "0 0 12px 0" }}>
        Hi {partnerName}, your referral partner account has been approved. You can start
        earning 10% commission on every company you refer.
      </p>
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #f59e0b", borderRadius: "4px", padding: "12px", margin: "0 0 16px 0" }}>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>Your referral link:</p>
        <p style={{ fontSize: "14px", fontWeight: "bold", color: "#1e3a5f", margin: "0", wordBreak: "break-all" }}>
          {referralUrl}
        </p>
        <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0 0" }}>
          Code: {referralCode} | Valid for 90 days
        </p>
      </div>
      <p style={{ fontSize: "13px", color: "#3f3f46", lineHeight: "1.6", margin: "0 0 8px 0" }}>
        <strong>How it works:</strong>
      </p>
      <ul style={{ fontSize: "13px", color: "#3f3f46", lineHeight: "1.8", margin: "0 0 16px 0", paddingLeft: "20px" }}>
        <li>Share this link with companies that need ISO compliance management</li>
        <li>When they sign up through your link, you earn 10% of what they pay</li>
        <li>Commission is paid monthly via EFT for the client's first 12 months</li>
        <li>We handle everything — onboarding, training, and support</li>
      </ul>
      <CTAButton href={referralUrl} label="Share Your Referral Link" />
      {dashboardUrl && (
        <p style={{ fontSize: "12px", color: "#3f3f46", lineHeight: "1.5", margin: "16px 0 0 0" }}>
          Track your referrals and commission:{" "}
          <a href={dashboardUrl} style={{ color: "#0d9488", fontWeight: "bold" }}>Open Your Referral Dashboard</a>
        </p>
      )}
      <p style={{ fontSize: "12px", color: "#71717a", lineHeight: "1.5", margin: "16px 0 0 0" }}>
        Download the full programme brochure:{" "}
        <a href={brochureUrl} style={{ color: "#0d9488" }}>Referral Partner Brochure (PDF)</a>
      </p>
    </EmailLayout>
  )
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

