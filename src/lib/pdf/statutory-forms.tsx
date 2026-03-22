import React from "react" // eslint-disable-line @typescript-eslint/no-unused-vars
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// ── Shared styles for statutory forms ──
const colors = {
  black: "#000000",
  darkGray: "#333333",
  gray: "#666666",
  lightGray: "#e5e5e5",
  white: "#ffffff",
  headerBg: "#1e3a5f",
}

const s = StyleSheet.create({
  page: { padding: 40, paddingBottom: 60, fontFamily: "Helvetica", fontSize: 9, color: colors.darkGray },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, textAlign: "center", fontSize: 7, color: colors.gray },

  // Header
  headerBar: { backgroundColor: colors.headerBg, padding: 12, marginBottom: 16 },
  headerTitle: { fontSize: 14, fontWeight: "bold", color: colors.white, textAlign: "center" },
  headerSub: { fontSize: 9, color: "#a0c4e8", textAlign: "center", marginTop: 3 },

  // Form reference
  formRef: { fontSize: 8, color: colors.gray, textAlign: "right", marginBottom: 12 },

  // Section
  sectionTitle: { fontSize: 10, fontWeight: "bold", backgroundColor: "#f0f4f8", padding: 6, marginTop: 12, marginBottom: 6, borderBottom: `1px solid ${colors.lightGray}` },

  // Field row
  fieldRow: { flexDirection: "row", marginBottom: 4 },
  fieldLabel: { width: "40%", fontSize: 8, color: colors.gray, paddingVertical: 3 },
  fieldValue: { width: "60%", fontSize: 9, fontWeight: "bold", paddingVertical: 3, borderBottom: `1px solid ${colors.lightGray}` },
  fieldFull: { marginBottom: 4 },
  fieldFullLabel: { fontSize: 8, color: colors.gray, marginBottom: 2 },
  fieldFullValue: { fontSize: 9, padding: 6, backgroundColor: "#fafafa", border: `1px solid ${colors.lightGray}`, borderRadius: 2, minHeight: 30 },

  // Signature block
  sigRow: { flexDirection: "row", gap: 20, marginTop: 20 },
  sigBlock: { flex: 1 },
  sigLine: { borderBottom: `1px solid ${colors.black}`, marginTop: 30, marginBottom: 4 },
  sigLabel: { fontSize: 8, color: colors.gray },

  // Notice
  notice: { marginTop: 16, padding: 8, backgroundColor: "#fff7ed", border: `1px solid #fed7aa`, borderRadius: 2, fontSize: 8, color: "#9a3412" },
})

// ── Helper ──
function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value || "—"}</Text>
    </View>
  )
}

function FullField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View style={s.fieldFull}>
      <Text style={s.fieldFullLabel}>{label}</Text>
      <Text style={s.fieldFullValue}>{value || "—"}</Text>
    </View>
  )
}

function Section({ title }: { title: string }) {
  return <Text style={s.sectionTitle}>{title}</Text>
}

// ══════════════════════════════════════════════
// W.Cl.2 — Report of Occupational Injury/Disease
// (Compensation for Occupational Injuries and Diseases Act, 1993)
// ══════════════════════════════════════════════

export interface WCl2Props {
  // Employer
  employerName: string
  employerAddress?: string
  coidaRegNumber?: string

  // Employee / Injured party
  employeeName: string
  employeeIdNumber?: string
  employeeOccupation?: string
  employeeDateOfBirth?: string
  employeeStaffNo?: string
  employeeDepartment?: string
  employeeNationality?: string
  employeeContractor?: string

  // Supervisor
  supervisorName?: string

  // Incident
  incidentTitle: string
  incidentDate: string
  incidentTime?: string
  location: string
  description: string
  bodyPartInjured?: string
  natureOfInjury?: string
  causeOfInjury?: string

  // Witnesses
  witnesses?: string

  // Immediate action
  immediateAction?: string

  // Medical / Outcome
  treatingDoctor?: string
  hospitalClinic?: string
  daysAbsent?: string
  treatmentType?: string
  estimatedCost?: string
  returnedToWork?: string
  returnedToWorkDate?: string

  // Reporter
  reporterName: string
  reportDate: string

  // Reference
  incidentRef: string
}

export function WCl2Form(props: WCl2Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>W.Cl.2 — Report of Occupational Injury or Disease</Text>
          <Text style={s.headerSub}>Compensation for Occupational Injuries and Diseases Act, 1993 (Act 130 of 1993)</Text>
        </View>

        <Text style={s.formRef}>Reference: {props.incidentRef}</Text>

        <Section title="A. Employer Details" />
        <Field label="Employer / Organisation" value={props.employerName} />
        <Field label="Address" value={props.employerAddress} />
        <Field label="COIDA Registration Number" value={props.coidaRegNumber} />

        <Section title="B. Employee / Injured Person" />
        <Field label="Full Name" value={props.employeeName} />
        <Field label="ID / Passport Number" value={props.employeeIdNumber} />
        <Field label="Staff / Employee Number" value={props.employeeStaffNo} />
        <Field label="Date of Birth" value={props.employeeDateOfBirth} />
        <Field label="Occupation / Job Title" value={props.employeeOccupation} />
        <Field label="Department" value={props.employeeDepartment} />
        <Field label="Nationality" value={props.employeeNationality} />
        <Field label="Contractor (if applicable)" value={props.employeeContractor} />
        <Field label="Immediate Supervisor" value={props.supervisorName} />

        <Section title="C. Particulars of Incident" />
        <Field label="Date of Incident" value={props.incidentDate} />
        <Field label="Time of Incident" value={props.incidentTime} />
        <Field label="Location" value={props.location} />
        <FullField label="Description of Incident" value={props.description} />
        <Field label="Nature of Injury" value={props.natureOfInjury} />
        <Field label="Body Part(s) Injured" value={props.bodyPartInjured} />
        <Field label="Cause of Injury" value={props.causeOfInjury} />

        <Section title="D. Immediate Action and Witnesses" />
        <FullField label="Immediate Action Taken" value={props.immediateAction} />
        <FullField label="Witnesses" value={props.witnesses} />

        <Section title="E. Medical Treatment & Outcome" />
        <Field label="Treatment Type" value={props.treatmentType} />
        <Field label="Treating Doctor / Practitioner" value={props.treatingDoctor} />
        <Field label="Hospital / Clinic" value={props.hospitalClinic} />
        <Field label="Estimated Days Absent from Work" value={props.daysAbsent} />
        <Field label="Estimated Cost (R)" value={props.estimatedCost} />
        <Field label="Returned to Work" value={props.returnedToWork} />
        <Field label="Date Returned to Work" value={props.returnedToWorkDate} />

        <Section title="F. Declaration" />
        <Text style={{ fontSize: 8, marginBottom: 8, color: colors.gray }}>
          I hereby declare that the above information is true and correct to the best of my knowledge.
          This report is submitted in terms of Section 39 of the COIDA Act (Act 130 of 1993).
        </Text>

        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Signature of Employer / Representative</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reporterName}</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Date</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reportDate}</Text>
          </View>
        </View>

        <View style={s.notice}>
          <Text>This form must be submitted to the Compensation Commissioner within 7 days of the incident.
            Failure to report may result in penalties under the COIDA Act.</Text>
        </View>

        <Text style={s.footer}>
          Generated by ConformEdge | W.Cl.2 Occupational Injury Report | {props.reportDate}
        </Text>
      </Page>
    </Document>
  )
}

// ══════════════════════════════════════════════
// SAPS 277 — Notification of Death
// (Inquests Act, 1959 / OHS Act / MHSA)
// ══════════════════════════════════════════════

export interface SAPS277Props {
  // Deceased
  deceasedName: string
  deceasedIdNumber?: string
  deceasedDateOfBirth?: string
  deceasedOccupation?: string
  deceasedAddress?: string

  // Incident
  incidentTitle: string
  incidentDate: string
  incidentTime?: string
  location: string
  description: string
  causeOfDeath?: string
  circumstances?: string

  // Employer
  employerName: string
  employerAddress?: string

  // Witnesses
  witnesses?: string

  // Reporter
  reporterName: string
  reportDate: string

  // Reference
  incidentRef: string
  sapsStation?: string
  casNumber?: string
}

export function SAPS277Form(props: SAPS277Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>SAPS 277 — Notification of Death</Text>
          <Text style={s.headerSub}>Inquests Act, 1959 (Act 58 of 1959) — Workplace Fatality Notice</Text>
        </View>

        <Text style={s.formRef}>Reference: {props.incidentRef} {props.casNumber ? `| CAS: ${props.casNumber}` : ""}</Text>

        <Section title="A. Details of Deceased" />
        <Field label="Full Name" value={props.deceasedName} />
        <Field label="ID Number" value={props.deceasedIdNumber} />
        <Field label="Date of Birth" value={props.deceasedDateOfBirth} />
        <Field label="Occupation / Job Title" value={props.deceasedOccupation} />
        <Field label="Residential Address" value={props.deceasedAddress} />

        <Section title="B. Employer Details" />
        <Field label="Employer / Organisation" value={props.employerName} />
        <Field label="Address" value={props.employerAddress} />

        <Section title="C. Particulars of Incident" />
        <Field label="Date of Incident" value={props.incidentDate} />
        <Field label="Time of Incident" value={props.incidentTime} />
        <Field label="Location of Incident" value={props.location} />
        <FullField label="Description of Incident" value={props.description} />
        <FullField label="Circumstances Leading to Death" value={props.circumstances} />
        <Field label="Apparent Cause of Death" value={props.causeOfDeath} />

        <Section title="D. Witnesses" />
        <FullField label="Witness Details" value={props.witnesses} />

        <Section title="E. SAPS Details" />
        <Field label="SAPS Station" value={props.sapsStation} />
        <Field label="CAS Number" value={props.casNumber} />

        <Section title="F. Declaration and Reporting" />
        <Text style={{ fontSize: 8, marginBottom: 8, color: colors.gray }}>
          I hereby report this workplace fatality in terms of the Inquests Act (Act 58 of 1959),
          the Occupational Health and Safety Act (Act 85 of 1993), and/or the Mine Health and Safety Act (Act 29 of 1996).
          This notification must be submitted to the nearest SAPS station and the Department of Employment and Labour / DMRE Inspector.
        </Text>

        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Signature of Reporter / Employer</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reporterName}</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Date</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reportDate}</Text>
          </View>
        </View>

        <View style={s.notice}>
          <Text>IMPORTANT: A workplace fatality must be reported to SAPS immediately. Do not disturb the scene.
            The employer must also notify the Chief Inspector (DMRE) or Provincial Director (DoEL) within 24 hours.
            Failure to report constitutes a criminal offence.</Text>
        </View>

        <Text style={s.footer}>
          Generated by ConformEdge | SAPS 277 Fatality Notification | {props.reportDate}
        </Text>
      </Page>
    </Document>
  )
}

// ══════════════════════════════════════════════
// MHSA Section 11 — Serious Accident Notification
// (Mine Health and Safety Act, Act 29 of 1996)
// ══════════════════════════════════════════════

export interface MHSA11Props {
  // Mine/Workplace
  employerName: string
  mineRegistrationNumber?: string
  employerAddress?: string
  chiefInspectorContact?: string

  // Injured/Deceased person
  employeeName: string
  employeeIdNumber?: string
  employeeOccupation?: string
  employeeDateOfBirth?: string
  employeeContractor?: string

  // Accident details
  incidentTitle: string
  incidentDate: string
  incidentTime?: string
  location: string
  description: string

  // Injury
  bodyPartInjured?: string
  natureOfInjury?: string
  treatmentType?: string
  prognosis?: string

  // Actions
  immediateAction?: string
  areaSecured?: string

  // Equipment
  equipmentInvolved?: string
  equipmentSerial?: string
  lastInspectionDate?: string

  // Witnesses
  witnesses?: string

  // Preliminary cause
  preliminaryCause?: string

  // Notification
  notificationDateTime?: string
  reportedTo?: string
  notificationMethod?: string

  // Reporter
  reporterName: string
  safetyOfficerName?: string
  reportDate: string
  incidentRef: string
}

export function MHSA11Form(props: MHSA11Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>MHSA Section 11 — Serious Accident Notification</Text>
          <Text style={s.headerSub}>Mine Health and Safety Act, 1996 (Act 29 of 1996) — Must be filed within 24 hours</Text>
        </View>

        <Text style={s.formRef}>Reference: {props.incidentRef}</Text>

        <Section title="A. Mine / Workplace Details" />
        <Field label="Employer / Mine Name" value={props.employerName} />
        <Field label="Mine Registration Number" value={props.mineRegistrationNumber} />
        <Field label="Address" value={props.employerAddress} />
        <Field label="Chief Inspector Contact" value={props.chiefInspectorContact} />

        <Section title="B. Accident Details" />
        <Field label="Date of Accident" value={props.incidentDate} />
        <Field label="Time of Accident" value={props.incidentTime} />
        <Field label="Location within Mine / Workplace" value={props.location} />
        <FullField label="Description of Accident" value={props.description} />

        <Section title="C. Injured / Deceased Person" />
        <Field label="Full Name" value={props.employeeName} />
        <Field label="ID / Passport Number" value={props.employeeIdNumber} />
        <Field label="Occupation / Job Title" value={props.employeeOccupation} />
        <Field label="Date of Birth" value={props.employeeDateOfBirth} />
        <Field label="Employer (if Contractor)" value={props.employeeContractor} />

        <Section title="D. Nature & Extent of Injury" />
        <Field label="Body Part(s) Injured" value={props.bodyPartInjured} />
        <Field label="Nature of Injury" value={props.natureOfInjury} />
        <Field label="Treatment Provided" value={props.treatmentType} />
        <Field label="Prognosis" value={props.prognosis} />

        <Section title="E. Immediate Actions Taken" />
        <FullField label="Containment / Emergency Actions" value={props.immediateAction} />
        <Field label="Area Secured / Production Stopped" value={props.areaSecured} />

        <Section title="F. Equipment / Machinery Involved" />
        <Field label="Equipment Type" value={props.equipmentInvolved} />
        <Field label="Serial / Asset Number" value={props.equipmentSerial} />
        <Field label="Last Inspection Date" value={props.lastInspectionDate} />

        <Section title="G. Witnesses" />
        <FullField label="Witness Details" value={props.witnesses} />

        <Section title="H. Preliminary Cause Assessment" />
        <FullField label="Preliminary Root Cause" value={props.preliminaryCause} />

        <Section title="I. Notification Details" />
        <Field label="Date/Time of Notification" value={props.notificationDateTime} />
        <Field label="Reported To" value={props.reportedTo} />
        <Field label="Method of Notification" value={props.notificationMethod} />

        <Section title="J. Declaration" />
        <Text style={{ fontSize: 8, marginBottom: 8, color: colors.gray }}>
          I hereby declare that the above information is true and correct to the best of my knowledge.
          This notification is submitted in terms of Section 11 of the Mine Health and Safety Act (Act 29 of 1996).
        </Text>

        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Signature of Mine Manager</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reporterName}</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Safety Officer</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.safetyOfficerName || "—"}</Text>
          </View>
        </View>

        <View style={{ ...s.sigRow, marginTop: 10 }}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Date</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reportDate}</Text>
          </View>
          <View style={s.sigBlock} />
        </View>

        <View style={s.notice}>
          <Text>IMPORTANT: Section 11(1) of the MHSA requires that any accident that results in death, serious injury,
            or a health-threatening occurrence be reported to the Chief Inspector of Mines within 24 hours.
            Failure to report is a criminal offence under the Act.</Text>
        </View>

        <Text style={s.footer}>
          Generated by ConformEdge | MHSA Section 11 — Serious Accident | {props.reportDate}
        </Text>
      </Page>
    </Document>
  )
}

// ══════════════════════════════════════════════
// MHSA Section 23 — Dangerous Occurrence Report
// (Mine Health and Safety Act, Act 29 of 1996)
// ══════════════════════════════════════════════

export interface MHSA23Props {
  // Mine/Workplace
  employerName: string
  mineRegistrationNumber?: string
  employerAddress?: string
  chiefInspectorContact?: string

  // Occurrence details
  incidentTitle: string
  incidentDate: string
  incidentTime?: string
  location: string
  category?: string // rockfall, fire, gas emission, equipment failure, inrush of water
  description: string

  // Damage/Consequences
  propertyDamage?: string
  productionImpact?: string
  areaAffected?: string

  // Actions
  immediateAction?: string

  // Equipment/Infrastructure
  equipmentInvolved?: string
  equipmentSerial?: string
  lastInspectionDate?: string

  // Persons at risk / Evacuation
  personsAtRisk?: string
  evacuationDetails?: string

  // Preliminary cause
  preliminaryCause?: string

  // Corrective actions
  correctiveActions?: string

  // Reporter
  reporterName: string
  safetyOfficerName?: string
  reportDate: string
  incidentRef: string
}

export function MHSA23Form(props: MHSA23Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>MHSA Section 23 — Dangerous Occurrence Report</Text>
          <Text style={s.headerSub}>Mine Health and Safety Act, 1996 (Act 29 of 1996) — Must be filed within 24 hours</Text>
        </View>

        <Text style={s.formRef}>Reference: {props.incidentRef}</Text>

        <Section title="A. Mine / Workplace Details" />
        <Field label="Employer / Mine Name" value={props.employerName} />
        <Field label="Mine Registration Number" value={props.mineRegistrationNumber} />
        <Field label="Address" value={props.employerAddress} />
        <Field label="Chief Inspector Contact" value={props.chiefInspectorContact} />

        <Section title="B. Dangerous Occurrence Details" />
        <Field label="Date of Occurrence" value={props.incidentDate} />
        <Field label="Time of Occurrence" value={props.incidentTime} />
        <Field label="Location within Mine / Workplace" value={props.location} />
        <Field label="Category" value={props.category} />
        <FullField label="Description of Occurrence" value={props.description} />

        <Section title="C. Damage / Consequences" />
        <FullField label="Property Damage" value={props.propertyDamage} />
        <Field label="Production Impact" value={props.productionImpact} />
        <Field label="Area Affected" value={props.areaAffected} />

        <Section title="D. Immediate Actions Taken" />
        <FullField label="Containment / Emergency Actions" value={props.immediateAction} />

        <Section title="E. Equipment / Infrastructure Involved" />
        <Field label="Equipment Type" value={props.equipmentInvolved} />
        <Field label="Serial / Asset Number" value={props.equipmentSerial} />
        <Field label="Last Inspection Date" value={props.lastInspectionDate} />

        <Section title="F. Persons at Risk / Evacuation" />
        <FullField label="Persons at Risk" value={props.personsAtRisk} />
        <FullField label="Evacuation Details" value={props.evacuationDetails} />

        <Section title="G. Preliminary Root Cause Assessment" />
        <FullField label="Preliminary Root Cause" value={props.preliminaryCause} />

        <Section title="H. Corrective Actions Planned" />
        <FullField label="Planned Corrective Actions" value={props.correctiveActions} />

        <Section title="I. Declaration" />
        <Text style={{ fontSize: 8, marginBottom: 8, color: colors.gray }}>
          I hereby declare that the above information is true and correct to the best of my knowledge.
          This report is submitted in terms of Section 23 of the Mine Health and Safety Act (Act 29 of 1996).
        </Text>

        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Signature of Mine Manager</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reporterName}</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Safety Officer</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.safetyOfficerName || "—"}</Text>
          </View>
        </View>

        <View style={{ ...s.sigRow, marginTop: 10 }}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Date</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reportDate}</Text>
          </View>
          <View style={s.sigBlock} />
        </View>

        <View style={s.notice}>
          <Text>IMPORTANT: Section 23 of the MHSA requires that any dangerous occurrence (rockfall, fire, gas emission,
            equipment failure, inrush of water, or similar event) be reported to the Chief Inspector of Mines within 24 hours,
            regardless of whether any person was injured. Failure to report is a criminal offence.</Text>
        </View>

        <Text style={s.footer}>
          Generated by ConformEdge | MHSA Section 23 — Dangerous Occurrence | {props.reportDate}
        </Text>
      </Page>
    </Document>
  )
}

// ══════════════════════════════════════════════
// MHSA Section 24 — Occupational Disease Report
// (Mine Health and Safety Act, Act 29 of 1996)
// ══════════════════════════════════════════════

export interface MHSA24Props {
  // Mine/Workplace
  employerName: string
  mineRegistrationNumber?: string
  employerAddress?: string
  chiefInspectorContact?: string

  // Employee
  employeeName: string
  employeeIdNumber?: string
  employeeOccupation?: string
  employeeDateOfBirth?: string
  yearsOfService?: string

  // Disease Classification
  diseaseClassification?: string // silicosis, NIHL, etc.

  // Diagnosis Details
  diagnosisDate?: string
  diagnosingPractitioner?: string
  medicalCertificateNumber?: string

  // Exposure History
  exposureSubstance?: string
  exposureDuration?: string
  exposureLevels?: string

  // Health Status
  currentHealthStatus?: string
  treatmentDetails?: string

  // Workplace Controls
  ppeProvided?: string
  ventilationDetails?: string
  monitoringDetails?: string

  // Compensation
  coidaClaimSubmitted?: string
  mbodReferral?: string

  // Reporter
  reporterName: string
  safetyOfficerName?: string
  reportDate: string
  incidentRef: string
}

export function MHSA24Form(props: MHSA24Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerBar}>
          <Text style={s.headerTitle}>MHSA Section 24 — Occupational Disease Report</Text>
          <Text style={s.headerSub}>Mine Health and Safety Act, 1996 (Act 29 of 1996) — Must be filed within 14 days</Text>
        </View>

        <Text style={s.formRef}>Reference: {props.incidentRef}</Text>

        <Section title="A. Mine / Workplace Details" />
        <Field label="Employer / Mine Name" value={props.employerName} />
        <Field label="Mine Registration Number" value={props.mineRegistrationNumber} />
        <Field label="Address" value={props.employerAddress} />
        <Field label="Chief Inspector Contact" value={props.chiefInspectorContact} />

        <Section title="B. Employee Details" />
        <Field label="Full Name" value={props.employeeName} />
        <Field label="ID / Passport Number" value={props.employeeIdNumber} />
        <Field label="Occupation / Job Title" value={props.employeeOccupation} />
        <Field label="Date of Birth" value={props.employeeDateOfBirth} />
        <Field label="Years of Service" value={props.yearsOfService} />

        <Section title="C. Disease Classification" />
        <Field label="Disease Type" value={props.diseaseClassification} />

        <Section title="D. Diagnosis Details" />
        <Field label="Date of Diagnosis" value={props.diagnosisDate} />
        <Field label="Diagnosing Practitioner" value={props.diagnosingPractitioner} />
        <Field label="Medical Certificate Number" value={props.medicalCertificateNumber} />

        <Section title="E. Occupational Exposure History" />
        <Field label="Substance / Agent" value={props.exposureSubstance} />
        <Field label="Duration of Exposure" value={props.exposureDuration} />
        <Field label="Exposure Levels (if known)" value={props.exposureLevels} />

        <Section title="F. Current Health Status & Treatment" />
        <FullField label="Current Health Status" value={props.currentHealthStatus} />
        <FullField label="Treatment Details" value={props.treatmentDetails} />

        <Section title="G. Workplace Controls in Place" />
        <Field label="PPE Provided" value={props.ppeProvided} />
        <Field label="Ventilation" value={props.ventilationDetails} />
        <Field label="Monitoring" value={props.monitoringDetails} />

        <Section title="H. Compensation Details" />
        <Field label="COIDA Claim Submitted" value={props.coidaClaimSubmitted} />
        <Field label="MBOD Referral" value={props.mbodReferral} />

        <Section title="I. Declaration" />
        <Text style={{ fontSize: 8, marginBottom: 8, color: colors.gray }}>
          I hereby declare that the above information is true and correct to the best of my knowledge.
          This report is submitted in terms of Section 24 of the Mine Health and Safety Act (Act 29 of 1996).
        </Text>

        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Signature of Mine Manager</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reporterName}</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Safety Officer</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.safetyOfficerName || "—"}</Text>
          </View>
        </View>

        <View style={{ ...s.sigRow, marginTop: 10 }}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Date</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{props.reportDate}</Text>
          </View>
          <View style={s.sigBlock} />
        </View>

        <View style={s.notice}>
          <Text>IMPORTANT: Section 24 of the MHSA requires that any occupational disease (including silicosis,
            noise-induced hearing loss, and other scheduled diseases) be reported to the Chief Inspector of Mines
            within 14 days of diagnosis. The employer must also refer the employee to the Medical Bureau for
            Occupational Diseases (MBOD) for assessment and compensation.</Text>
        </View>

        <Text style={s.footer}>
          Generated by ConformEdge | MHSA Section 24 — Occupational Disease | {props.reportDate}
        </Text>
      </Page>
    </Document>
  )
}
