import { z } from "zod/v4"

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const OBLIGATION_TYPES = [
  { value: "SECTION_37_2", label: "Section 37(2) Agreement", description: "OHS Act mandatory agreement with contractor" },
  { value: "WATER_USE_LICENCE", label: "Water Use Licence", description: "NWA Section 21 water use authorisation" },
  { value: "AEL", label: "Atmospheric Emission Licence", description: "NEM:AQA atmospheric emission authorisation" },
  { value: "WASTE_LICENCE", label: "Waste Management Licence", description: "NEM:WA waste management authorisation" },
  { value: "CEMP", label: "CEMP", description: "Construction Environmental Management Programme" },
  { value: "BBBEE_CERTIFICATE", label: "B-BBEE Certificate", description: "Broad-Based Black Economic Empowerment certificate" },
  { value: "COIDA_LOG", label: "COIDA Letter of Good Standing", description: "Compensation for Occupational Injuries and Diseases" },
  { value: "TAX_CLEARANCE", label: "Tax Clearance Certificate", description: "SARS tax compliance certificate" },
  { value: "CIDB_GRADING", label: "CIDB Grading Certificate", description: "Construction Industry Development Board grading" },
  { value: "COMPETENT_PERSON", label: "Competent Person Appointment", description: "OHS Act Section 16(2) appointment" },
  { value: "CUSTOM", label: "Custom Obligation", description: "Custom regulatory or contractual obligation" },
] as const

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

export const obligationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  obligationType: z.string().min(1, "Obligation type is required"),
  standardClauseId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  responsibleUserId: z.string().optional().nullable(),
  effectiveDate: z.coerce.date().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
  renewalLeadDays: z.coerce.number().min(1).max(365).optional().nullable(),
  documentId: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type ObligationFormValues = z.infer<typeof obligationSchema>
