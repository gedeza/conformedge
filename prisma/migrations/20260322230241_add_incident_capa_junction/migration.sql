-- CreateTable
CREATE TABLE "incident_capas" (
    "id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "capa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_capas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "incident_capas_incident_id_capa_id_key" ON "incident_capas"("incident_id", "capa_id");

-- AddForeignKey
ALTER TABLE "incident_capas" ADD CONSTRAINT "incident_capas_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_capas" ADD CONSTRAINT "incident_capas_capa_id_fkey" FOREIGN KEY ("capa_id") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
