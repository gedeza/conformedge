-- CreateIndex
CREATE INDEX "idx_assessment_org_created" ON "assessments"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_assessment_project" ON "assessments"("project_id");

-- CreateIndex
CREATE INDEX "idx_audit_trail_org_created" ON "audit_trail_events"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_capa_org_created" ON "capas"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_capa_org_status" ON "capas"("organization_id", "status");

-- CreateIndex
CREATE INDEX "idx_capa_project" ON "capas"("project_id");

-- CreateIndex
CREATE INDEX "idx_checklist_org_created" ON "compliance_checklists"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_checklist_project" ON "compliance_checklists"("project_id");

-- CreateIndex
CREATE INDEX "idx_document_org_created" ON "documents"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_document_org_status" ON "documents"("organization_id", "status");

-- CreateIndex
CREATE INDEX "idx_document_project" ON "documents"("project_id");

-- CreateIndex
CREATE INDEX "idx_notification_org_created" ON "notifications"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notification_user_read" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_cert_subcontractor_expires" ON "subcontractor_certifications"("subcontractor_id", "expires_at");
