-- CreateTable
CREATE TABLE "capa_standard_clauses" (
    "id" TEXT NOT NULL,
    "capa_id" TEXT NOT NULL,
    "standard_clause_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capa_standard_clauses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "capa_standard_clauses_capa_id_standard_clause_id_key" ON "capa_standard_clauses"("capa_id", "standard_clause_id");

-- AddForeignKey
ALTER TABLE "capa_standard_clauses" ADD CONSTRAINT "capa_standard_clauses_capa_id_fkey" FOREIGN KEY ("capa_id") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_standard_clauses" ADD CONSTRAINT "capa_standard_clauses_standard_clause_id_fkey" FOREIGN KEY ("standard_clause_id") REFERENCES "standard_clauses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
