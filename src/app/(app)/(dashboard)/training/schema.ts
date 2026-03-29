import { z } from "zod/v4"

export const TRAINING_CATEGORIES = [
  { value: "INDUCTION", label: "Induction", expiryYears: null },
  { value: "FIRST_AID", label: "First Aid", expiryYears: 3 },
  { value: "FIRE_FIGHTING", label: "Fire Fighting", expiryYears: 2 },
  { value: "WORKING_AT_HEIGHTS", label: "Working at Heights", expiryYears: 2 },
  { value: "SCAFFOLDING", label: "Scaffolding", expiryYears: 2 },
  { value: "CRANE_OPERATOR", label: "Crane Operator", expiryYears: 2 },
  { value: "FORKLIFT_OPERATOR", label: "Forklift Operator", expiryYears: 2 },
  { value: "CONFINED_SPACE", label: "Confined Space", expiryYears: 2 },
  { value: "HAZARDOUS_CHEMICALS", label: "Hazardous Chemicals (HCA)", expiryYears: 2 },
  { value: "ELECTRICAL", label: "Electrical Safety", expiryYears: 2 },
  { value: "EXCAVATION", label: "Excavation", expiryYears: 2 },
  { value: "H_AND_S_REPRESENTATIVE", label: "H&S Representative", expiryYears: null },
  { value: "TOOLBOX_TALK", label: "Toolbox Talk", expiryYears: null },
  { value: "COMPETENCY", label: "Competency Assessment", expiryYears: null },
  { value: "REFRESHER", label: "Refresher Training", expiryYears: null },
  { value: "OTHER", label: "Other", expiryYears: null },
] as const

export const trainingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(2000).optional().nullable(),
  trainingDate: z.coerce.date(),
  duration: z.string().max(50).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  trainerName: z.string().max(200).optional().nullable(),
  trainerAccreditation: z.string().max(200).optional().nullable(),
  trainingProvider: z.string().max(200).optional().nullable(),
  providerAccreditationNo: z.string().max(100).optional().nullable(),
  certificateNumber: z.string().max(200).optional().nullable(),
  certificateFileKey: z.string().max(500).optional().nullable(),
  certificateFileName: z.string().max(500).optional().nullable(),
  issuedDate: z.coerce.date().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
  assessmentResult: z.string().max(100).optional().nullable(),
  saqaUnitStandard: z.string().max(50).optional().nullable(),
  nqfLevel: z.coerce.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  traineeId: z.string().min(1, "Trainee is required"),
  siteId: z.string().optional().nullable(),
})

export type TrainingFormValues = z.infer<typeof trainingSchema>
