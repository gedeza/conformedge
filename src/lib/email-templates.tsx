import React from "react"
import type { NotificationType } from "@/types"

const BRAND_COLOR = "#1e3a5f"
const BRAND_LIGHT = "#2d5a8e"
const ACCENT_COLOR = "#0d9488"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const LOGO_URL = `${APP_URL}/images/C_Edge_Logo.png`

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
    hint: "Contact the vendor for an updated certificate.",
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
  OBLIGATION_EXPIRING: {
    color: "#f59e0b",
    label: "Compliance Obligation Expiring",
    hint: "A regulatory obligation (licence, agreement, or permit) is approaching its expiry date. Review and renew.",
  },
  VENDOR_COMPLIANCE_ALERT: {
    color: "#ef4444",
    label: "Vendor Compliance Alert",
    hint: "A vendor's compliance obligation requires urgent attention.",
  },
}

/* ─────────────────────────────────────────────
   SHARED LAYOUT
   ───────────────────────────────────────────── */

function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f4f4f5", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#f4f4f5", padding: "32px 0" }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="600" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td style={{ backgroundColor: BRAND_COLOR, padding: "20px 32px" }}>
                        <table width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td>
                                <img src={LOGO_URL} alt="ConformEdge" width="160" height="40" style={{ display: "block", maxWidth: "160px", height: "auto" }} />
                              </td>
                              <td align="right" style={{ color: "#8ab4d8", fontSize: "11px", verticalAlign: "middle" }}>
                                AI-Powered SHEQ & Compliance
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
                      <td style={{ padding: "24px 32px", borderTop: "1px solid #e4e4e7", backgroundColor: "#fafafa" }}>
                        <table width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td style={{ color: "#71717a", fontSize: "12px" }}>
                                <p style={{ margin: "0 0 6px 0", fontWeight: "bold", color: "#52525b" }}>
                                  ConformEdge by ISU Technologies
                                </p>
                                <p style={{ margin: "0 0 4px 0" }}>
                                  <a href={`${APP_URL}`} style={{ color: ACCENT_COLOR, textDecoration: "none" }}>conformedge.isutech.co.za</a>
                                  {" | "}
                                  <a href="mailto:support@isutech.co.za" style={{ color: ACCENT_COLOR, textDecoration: "none" }}>support@isutech.co.za</a>
                                </p>
                                <p style={{ margin: "6px 0 0 0", color: "#a1a1aa", fontSize: "11px" }}>
                                  &copy; 2025&ndash;{new Date().getFullYear()} ISU Technologies (Pty) Ltd. All rights reserved.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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

/* ─────────────────────────────────────────────
   SHARED COMPONENTS
   ───────────────────────────────────────────── */

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

function CTAButton({ href, label, color }: { href: string; label: string; color?: string }) {
  return (
    <table cellPadding={0} cellSpacing={0} style={{ marginTop: "24px" }}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: color || BRAND_COLOR,
              borderRadius: "6px",
              padding: "14px 28px",
            }}
          >
            <a
              href={href}
              style={{
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.02em",
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

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid #e4e4e7", margin: "24px 0" }} />
}

/* ─────────────────────────────────────────────
   NOTIFICATION EMAIL
   ───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   AUDIT PACK EMAIL
   ───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   REFERRAL WELCOME EMAIL (Enhanced)
   ───────────────────────────────────────────── */

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
      {/* Hero section */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: "#f0f9ff", borderRadius: "8px", padding: "24px", borderLeft: `4px solid ${ACCENT_COLOR}` }}>
              <Badge color="#f59e0b" label="Referral Partner" />
              <h1 style={{ fontSize: "22px", color: BRAND_COLOR, margin: "12px 0 8px 0" }}>
                Welcome to the Partner Programme!
              </h1>
              <p style={{ fontSize: "15px", color: "#3f3f46", lineHeight: "1.6", margin: 0 }}>
                Hi <strong>{partnerName}</strong>, your referral partner account has been approved.
                Start earning commission on every company you refer to ConformEdge.
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Referral link card */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: BRAND_COLOR, borderRadius: "8px", padding: "20px" }}>
              <p style={{ fontSize: "11px", color: "#8ab4d8", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "bold" }}>
                Your Unique Referral Link
              </p>
              <p style={{ fontSize: "16px", fontWeight: "bold", color: "#ffffff", margin: "0 0 8px 0", wordBreak: "break-all" }}>
                {referralUrl}
              </p>
              <table cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td style={{ backgroundColor: "#ffffff", borderRadius: "4px", padding: "8px 16px" }}>
                      <a href={referralUrl} style={{ color: BRAND_COLOR, textDecoration: "none", fontSize: "13px", fontWeight: "bold" }}>
                        Copy & Share Link
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: "11px", color: "#8ab4d8", margin: "10px 0 0 0" }}>
                Code: <strong style={{ color: "#ffffff" }}>{referralCode}</strong> | Valid for 90 days
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Commission breakdown */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: "#fefce8", border: "1px solid #fef08a", borderRadius: "8px", padding: "20px" }}>
              <p style={{ fontSize: "14px", fontWeight: "bold", color: "#854d0e", margin: "0 0 12px 0" }}>
                Your Commission Structure
              </p>
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td width="33%" align="center" style={{ padding: "8px" }}>
                      <p style={{ fontSize: "28px", fontWeight: "bold", color: "#b45309", margin: "0" }}>10%</p>
                      <p style={{ fontSize: "11px", color: "#92400e", margin: "4px 0 0 0" }}>Commission Rate</p>
                    </td>
                    <td width="33%" align="center" style={{ padding: "8px" }}>
                      <p style={{ fontSize: "28px", fontWeight: "bold", color: "#b45309", margin: "0" }}>12</p>
                      <p style={{ fontSize: "11px", color: "#92400e", margin: "4px 0 0 0" }}>Months Earned</p>
                    </td>
                    <td width="33%" align="center" style={{ padding: "8px" }}>
                      <p style={{ fontSize: "28px", fontWeight: "bold", color: "#b45309", margin: "0" }}>EFT</p>
                      <p style={{ fontSize: "11px", color: "#92400e", margin: "4px 0 0 0" }}>Monthly Payout</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* How it works — numbered steps */}
      <p style={{ fontSize: "15px", fontWeight: "bold", color: BRAND_COLOR, margin: "0 0 16px 0" }}>
        How It Works
      </p>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "24px" }}>
        <tbody>
          {[
            { num: "1", title: "Share your link", desc: "Send your referral link to companies that need SHEQ compliance management." },
            { num: "2", title: "They sign up", desc: "When a company registers through your link, we track the referral automatically." },
            { num: "3", title: "You earn commission", desc: "Receive 10% of their subscription payments for the first 12 months, paid via EFT." },
            { num: "4", title: "We handle the rest", desc: "We manage all onboarding, training, and ongoing support for your referrals." },
          ].map((step) => (
            <tr key={step.num}>
              <td style={{ padding: "8px 12px 8px 0", verticalAlign: "top", width: "36px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: BRAND_COLOR,
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textAlign: "center",
                  lineHeight: "32px",
                }}>
                  {step.num}
                </div>
              </td>
              <td style={{ padding: "8px 0", verticalAlign: "top" }}>
                <p style={{ fontSize: "14px", fontWeight: "bold", color: "#18181b", margin: "0 0 2px 0" }}>{step.title}</p>
                <p style={{ fontSize: "13px", color: "#52525b", margin: "0", lineHeight: "1.5" }}>{step.desc}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Divider />

      {/* Dashboard access */}
      {dashboardUrl && (
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "20px" }}>
          <tbody>
            <tr>
              <td style={{ backgroundColor: "#f8fafc", borderRadius: "8px", padding: "20px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "14px", fontWeight: "bold", color: BRAND_COLOR, margin: "0 0 6px 0" }}>
                  Your Partner Dashboard
                </p>
                <p style={{ fontSize: "13px", color: "#52525b", lineHeight: "1.5", margin: "0 0 12px 0" }}>
                  Track clicks, sign-ups, conversions, and commission earnings in real time.
                </p>
                <table cellPadding={0} cellSpacing={0}>
                  <tbody>
                    <tr>
                      <td style={{ backgroundColor: ACCENT_COLOR, borderRadius: "6px", padding: "12px 24px" }}>
                        <a href={dashboardUrl} style={{ color: "#ffffff", textDecoration: "none", fontSize: "13px", fontWeight: "bold" }}>
                          Open Partner Dashboard
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Resources */}
      <table width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td style={{ padding: "12px 0" }}>
              <p style={{ fontSize: "13px", color: "#52525b", margin: "0 0 8px 0" }}>
                <strong>Resources:</strong>
              </p>
              <p style={{ fontSize: "13px", color: "#52525b", lineHeight: "1.8", margin: 0 }}>
                <a href={brochureUrl} style={{ color: ACCENT_COLOR, fontWeight: "bold", textDecoration: "none" }}>
                  Download Partner Brochure (PDF)
                </a>
                <br />
                <a href={`${APP_URL}`} style={{ color: ACCENT_COLOR, textDecoration: "none" }}>
                  Visit ConformEdge Website
                </a>
                <br />
                <a href="mailto:partners@isutech.co.za" style={{ color: ACCENT_COLOR, textDecoration: "none" }}>
                  Contact Partner Support
                </a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <Divider />

      <p style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: "1.5", margin: 0, textAlign: "center" }}>
        You are receiving this email because you registered as a ConformEdge Referral Partner.
        <br />
        Questions? Reply to this email or contact <a href="mailto:partners@isutech.co.za" style={{ color: ACCENT_COLOR }}>partners@isutech.co.za</a>
      </p>
    </EmailLayout>
  )
}
