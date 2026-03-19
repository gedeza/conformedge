-- CreateEnum
CREATE TYPE "PartnerRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PartnerAlertType" AS ENUM ('LOW_USER_ACTIVITY', 'GHOST_SEATS', 'USER_SPIKE', 'CLIENT_DENSITY_HIGH', 'INACTIVE_CLIENT', 'REVENUE_DECLINE', 'OVERDUE_INVOICE', 'CLIENT_CHURN', 'TERMS_EXPIRY', 'COMPLIANCE_GAP', 'STATUS_CHANGE', 'BRANDING_CHANGE', 'MAX_CLIENTS_REACHED');

-- CreateEnum
CREATE TYPE "PartnerAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "partner_audit_scores" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "period_month" TEXT NOT NULL,
    "total_users" INTEGER NOT NULL DEFAULT 0,
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "activity_score" INTEGER NOT NULL DEFAULT 0,
    "total_client_orgs" INTEGER NOT NULL DEFAULT 0,
    "avg_users_per_client" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "client_density_score" INTEGER NOT NULL DEFAULT 0,
    "total_revenue_cents" INTEGER NOT NULL DEFAULT 0,
    "revenue_growth_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenue_score" INTEGER NOT NULL DEFAULT 0,
    "feature_utilization_score" INTEGER NOT NULL DEFAULT 0,
    "overall_score" INTEGER NOT NULL DEFAULT 0,
    "risk_level" "PartnerRiskLevel" NOT NULL DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_audit_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_alerts" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "alert_type" "PartnerAlertType" NOT NULL,
    "severity" "PartnerRiskLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "status" "PartnerAlertStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_partner_audit_score_partner" ON "partner_audit_scores"("partner_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_partner_audit_score_risk" ON "partner_audit_scores"("risk_level");

-- CreateIndex
CREATE UNIQUE INDEX "uq_partner_audit_score_period" ON "partner_audit_scores"("partner_id", "period_month");

-- CreateIndex
CREATE INDEX "idx_partner_alert_partner_status" ON "partner_alerts"("partner_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_partner_alert_severity" ON "partner_alerts"("severity", "status");

-- AddForeignKey
ALTER TABLE "partner_audit_scores" ADD CONSTRAINT "partner_audit_scores_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_alerts" ADD CONSTRAINT "partner_alerts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_alerts" ADD CONSTRAINT "partner_alerts_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
