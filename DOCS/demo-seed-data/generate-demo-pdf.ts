/**
 * Generate a realistic Safety Management Plan PDF for demo purposes.
 * Run: npx tsx DOCS/demo-seed-data/generate-demo-pdf.ts
 */

import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToFile,
  Font,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
  },
  coverPage: {
    padding: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Helvetica",
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a365d",
  },
  coverSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
    color: "#2d3748",
  },
  coverMeta: {
    fontSize: 11,
    textAlign: "center",
    color: "#718096",
    marginTop: 4,
  },
  coverDivider: {
    width: 200,
    height: 3,
    backgroundColor: "#2b6cb0",
    marginVertical: 30,
  },
  h1: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    marginTop: 24,
    color: "#1a365d",
  },
  h2: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 16,
    color: "#2d3748",
  },
  h3: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    marginTop: 12,
    color: "#4a5568",
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
  },
  listItem: {
    marginBottom: 4,
    paddingLeft: 16,
  },
  bullet: {
    position: "absolute",
    left: 0,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableHeader: {
    backgroundColor: "#edf2f7",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
    flex: 1,
  },
  tableCellNarrow: {
    padding: 6,
    fontSize: 10,
    width: 120,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    fontSize: 8,
    color: "#a0aec0",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  confidential: {
    fontSize: 8,
    color: "#e53e3e",
    textAlign: "center",
    marginTop: 40,
    fontFamily: "Helvetica-Bold",
  },
})

const Li = ({ children }: { children: string }) =>
  React.createElement(
    View,
    { style: styles.listItem },
    React.createElement(Text, null, `• ${children}`)
  )

const SafetyManagementPlan = () =>
  React.createElement(
    Document,
    {
      title: "Safety Management Plan — PRASA PTCS Signalling KZN",
      author: "Maziya Service Group",
      subject: "Occupational Health and Safety Management",
      keywords: "ISO 45001, safety, hazard identification, risk assessment, PRASA, railway signalling",
    },
    // Cover Page
    React.createElement(
      Page,
      { size: "A4", style: styles.coverPage },
      React.createElement(
        Text,
        { style: { fontSize: 12, color: "#718096", marginBottom: 40 } },
        "MAZIYA SERVICE GROUP (PTY) LTD"
      ),
      React.createElement(View, { style: styles.coverDivider }),
      React.createElement(
        Text,
        { style: styles.coverTitle },
        "Safety Management Plan"
      ),
      React.createElement(
        Text,
        { style: styles.coverSubtitle },
        "PRASA PTCS Signalling Project"
      ),
      React.createElement(
        Text,
        { style: styles.coverSubtitle },
        "KwaZulu-Natal Corridor"
      ),
      React.createElement(View, { style: styles.coverDivider }),
      React.createElement(
        Text,
        { style: styles.coverMeta },
        "Document Reference: MZY-SMP-PTCS-KZN-001"
      ),
      React.createElement(
        Text,
        { style: styles.coverMeta },
        "Revision: 3.0  |  Date: 01 March 2026"
      ),
      React.createElement(
        Text,
        { style: styles.coverMeta },
        "Prepared by: SHEQ Department"
      ),
      React.createElement(
        Text,
        { style: styles.coverMeta },
        "Approved by: Christiaan Delport, CEO"
      ),
      React.createElement(
        Text,
        { style: styles.confidential },
        "CONFIDENTIAL — FOR INTERNAL AND CLIENT USE ONLY"
      ),
      React.createElement(
        Text,
        { style: styles.footer },
        "Maziya Service Group (Pty) Ltd | 56 3rd Avenue, Johannesburg | +27 10 446 9841"
      )
    ),

    // Page 1 — Purpose, Scope, References
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.h1 }, "1. Purpose and Scope"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "This Safety Management Plan (SMP) establishes the framework for managing occupational health and safety (OH&S) risks on the PRASA Passenger Train Control System (PTCS) Signalling Project in KwaZulu-Natal. It applies to all Maziya Service Group employees, subcontractors, and visitors engaged in signalling installation, testing, and commissioning activities along the PTCS corridor."
      ),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "The plan addresses the requirements of ISO 45001:2018, the Occupational Health and Safety Act (No. 85 of 1993), the Construction Regulations 2014 (as amended), and the Railway Safety Regulator requirements. It covers all project phases from mobilisation through to handover, including civil works, electrical installation, signalling equipment erection, cable routing, and system integration testing."
      ),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "This SMP shall be read in conjunction with the project-specific Risk Assessment Register (MZY-RA-PTCS-001), the Emergency Response Plan (MZY-ERP-PTCS-001), and the Environmental Management Plan (MZY-EMP-PTCS-001). All workers must be familiar with the contents of this plan before commencing work on site."
      ),

      React.createElement(Text, { style: styles.h1 }, "2. Normative References"),
      Li({ children: "ISO 45001:2018 — Occupational health and safety management systems" }),
      Li({ children: "ISO 14001:2015 — Environmental management systems" }),
      Li({ children: "ISO 9001:2015 — Quality management systems" }),
      Li({ children: "Occupational Health and Safety Act No. 85 of 1993 (South Africa)" }),
      Li({ children: "Construction Regulations 2014 (Government Notice R84)" }),
      Li({ children: "Railway Safety Regulator — Safety Permit Conditions" }),
      Li({ children: "SANS 10142-1:2017 — Wiring of Premises" }),
      Li({ children: "PRASA Technical Specifications for ETCS Level 2 Installation" }),

      React.createElement(Text, { style: styles.h1 }, "3. Context of the Organisation (ISO 45001, Clause 4)"),
      React.createElement(Text, { style: styles.h2 }, "3.1 Understanding the Organisation and Its Context"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Maziya Service Group operates across six business divisions including Telecom & Signalling, Perway, Electrical Construction, Civil Engineering, Building & Construction, and Mining. The PTCS project involves high-risk activities including working at height on signalling masts, electrical isolation of 3kV DC traction systems, confined space entry in cable culverts, and hot work activities for bracket and mast fabrication."
      ),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Key external issues include the South African regulatory environment (OHS Act, Construction Regulations, RSR requirements), climate conditions affecting outdoor work schedules, and the interface with live railway operations requiring strict safety protocols. Internal issues include workforce competency management across multiple regional sites, subcontractor safety performance monitoring, and the integration of multiple management system requirements (quality, environmental, and OH&S)."
      ),

      React.createElement(Text, { style: styles.h2 }, "3.2 Needs and Expectations of Workers and Interested Parties"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Interested parties include PRASA (client — requires RSR safety compliance), the Railway Safety Regulator (safety oversight authority), the Department of Employment and Labour (OHS Act enforcement), subcontractors and their employees, local communities adjacent to the railway corridor, and Maziya Group management. Workers expect a safe working environment, adequate PPE provision, competency-based training, incident reporting mechanisms, and consultation on OH&S matters as required by Section 19 of the OHS Act."
      ),
      React.createElement(
        Text,
        { style: styles.footer },
        "MZY-SMP-PTCS-KZN-001 Rev 3.0 | Safety Management Plan | Page 2 of 8"
      )
    ),

    // Page 2 — Leadership, Hazard ID, Risk Assessment
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.h1 }, "4. Leadership and Worker Participation (ISO 45001, Clause 5)"),
      React.createElement(Text, { style: styles.h2 }, "4.1 OH&S Policy Commitment"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Top management, represented by the CEO Christiaan Delport and the Project Director, demonstrates leadership and commitment to the OH&S management system by ensuring adequate resources for safety, establishing and communicating the OH&S policy, ensuring integration of OH&S requirements into business processes, and promoting continual improvement. The OH&S policy is communicated to all workers during site induction and displayed prominently at all site offices."
      ),
      React.createElement(Text, { style: styles.h2 }, "4.2 Worker Consultation and Participation"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Workers participate in OH&S matters through elected health and safety representatives (one per 50 workers as per the OHS Act), monthly safety committee meetings, daily toolbox talks before commencement of work, hazard reporting mechanisms (verbal, written, and digital via ConformEdge), and participation in risk assessments for new or changed activities. The project maintains a Safety Representative Register and records of all committee meetings and toolbox talks."
      ),

      React.createElement(Text, { style: styles.h1 }, "5. Hazard Identification and Risk Assessment (ISO 45001, Clause 6.1.2)"),
      React.createElement(Text, { style: styles.h2 }, "5.1 Hazard Identification Process"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Hazard identification is conducted systematically for all project activities using the following methods: baseline risk assessments (conducted before project commencement), issue-based risk assessments (for specific high-risk tasks), continuous risk assessment (daily pre-task planning by work teams), and incident-triggered reassessment (following any incident, near-miss, or changed condition). The hazard identification process considers routine and non-routine activities, emergency situations, human factors (fatigue, shift patterns, lone working), infrastructure and equipment condition, and changes in legislation or client requirements."
      ),

      React.createElement(Text, { style: styles.h2 }, "5.2 Project-Specific Hazards"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "The following high-risk hazards have been identified for the PTCS signalling project:"
      ),
      Li({ children: "Working at height — signalling mast erection, antenna installation (fall risk from 8-15m)" }),
      Li({ children: "Electrical hazards — 3kV DC traction system proximity, 11kV AC distribution switchgear" }),
      Li({ children: "Confined space — cable culverts, equipment rooms below track level, drainage structures" }),
      Li({ children: "Hot work — MIG/TIG welding of mast brackets, cable tray fabrication, thermal cutting" }),
      Li({ children: "Lifting operations — signalling mast installation using mobile cranes (loads 2-12 tonnes)" }),
      Li({ children: "Excavation — fibre-optic cable trenching, foundation excavation near live tracks" }),
      Li({ children: "Rail traffic — proximity to operational railway lines during installation works" }),
      Li({ children: "Hazardous substances — cable jointing compounds, transformer oils, battery acid" }),

      React.createElement(Text, { style: styles.h2 }, "5.3 Risk Assessment Methodology"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Risks are assessed using the Maziya Group standard risk matrix, which evaluates likelihood (1-5: rare to almost certain) and severity (1-5: insignificant to catastrophic). Risk ratings are classified as Low (1-4), Medium (5-9), High (10-15), and Critical (16-25). All Critical and High risks require specific Safe Work Procedures (SWPs), dedicated supervision, and formal Permit to Work authorisation before commencement. Risk assessments are reviewed quarterly, after any incident, and when activities or conditions change."
      ),
      React.createElement(
        Text,
        { style: styles.footer },
        "MZY-SMP-PTCS-KZN-001 Rev 3.0 | Safety Management Plan | Page 3 of 8"
      )
    ),

    // Page 3 — Controls, Emergency, Competence
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.h1 }, "6. Operational Planning and Control (ISO 45001, Clause 8.1)"),
      React.createElement(Text, { style: styles.h2 }, "6.1 Hierarchy of Controls"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Control measures are implemented following the hierarchy of controls as required by ISO 45001 Clause 8.1.2: elimination (e.g., prefabrication off-site to reduce working at height), substitution (e.g., using mechanical lifting instead of manual handling), engineering controls (e.g., fall arrest systems, electrical isolation and lock-out/tag-out procedures), administrative controls (e.g., safe work procedures, permit-to-work systems, competency requirements), and personal protective equipment (e.g., full-body harnesses, arc flash rated PPE, respiratory protection)."
      ),

      React.createElement(Text, { style: styles.h2 }, "6.2 Permit to Work System"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "The following activities require formal Permit to Work (PTW) authorisation before commencement: hot work (welding, cutting, grinding), confined space entry, electrical isolation and work on energised systems, working at height above 2 metres, lifting operations using cranes or hoists, excavation works exceeding 1.5 metres depth, and work within the railway reserve requiring RSR clearance. All permits are managed digitally through the ConformEdge platform, which tracks permit status, safety checklist completion, and automatic expiry. No work shall commence without a valid, signed permit displayed at the work location."
      ),

      React.createElement(Text, { style: styles.h1 }, "7. Emergency Preparedness and Response (ISO 45001, Clause 8.2)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "The project Emergency Response Plan (MZY-ERP-PTCS-001) addresses the following emergency scenarios: serious injury or fatality, electrical contact (3kV DC or 11kV AC), fire or explosion, structural collapse (scaffolding, excavation, signalling masts), chemical spill (transformer oil, cable compound, battery acid), severe weather events (lightning, flooding, high winds >60km/h), and railway operational emergencies."
      ),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Emergency drills are conducted monthly at each active work site. All incidents are reported immediately to the Site Safety Officer, and the Emergency Response Team (ERT) is activated for any serious or potentially serious incident. Emergency contact numbers are displayed at all site offices and on worker identification badges. First aid stations are maintained within 100 metres of all active work areas, with a minimum of 2 trained first aiders per 50 workers."
      ),

      React.createElement(Text, { style: styles.h1 }, "8. Competence and Training (ISO 45001, Clause 7.2)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "All persons entering the project site must complete the Maziya Group safety induction programme covering: project-specific hazards and controls, emergency procedures and assembly points, PPE requirements, incident and hazard reporting procedures, environmental awareness requirements, and site access and movement protocols."
      ),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Additional competency requirements for specific roles include:"
      ),
      Li({ children: "Construction Manager: SACPCMP registration, Fall Protection Plan competence, 32.1 appointment" }),
      Li({ children: "Safety Officers: SAMTRAC or equivalent, Construction Safety qualification, first aid Level 3" }),
      Li({ children: "Crane operators: Valid LMV licence, specific crane type certification, medical fitness" }),
      Li({ children: "Electrical workers: Wireman's licence (appropriate category), 3kV DC traction system training" }),
      Li({ children: "Welders: Valid welding certificates (MIG/TIG as applicable), coded to relevant SANS standards" }),
      Li({ children: "Working at height: Fall protection training, scaffold erection (where applicable)" }),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Subcontractor personnel are required to present valid competency documentation before site access is granted. All certificates are tracked in the ConformEdge subcontractor compliance module with automated expiry alerts at 30 and 7 days before expiration."
      ),
      React.createElement(
        Text,
        { style: styles.footer },
        "MZY-SMP-PTCS-KZN-001 Rev 3.0 | Safety Management Plan | Page 4 of 8"
      )
    ),

    // Page 4 — Incident Management, Monitoring, Review
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.h1 }, "9. Incident Investigation and Reporting (ISO 45001, Clause 10.2)"),
      React.createElement(Text, { style: styles.h2 }, "9.1 Incident Classification"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "All incidents, near-misses, and unsafe conditions must be reported immediately. Incidents are classified according to severity: fatality, lost-time injury (LTI), medical treatment case (MTC), first aid case (FAC), near-miss, environmental incident, and property damage. All incidents classified as LTI or above must be reported to the Department of Employment and Labour within the prescribed timeframes in accordance with Section 24 of the OHS Act and General Administrative Regulation 8."
      ),

      React.createElement(Text, { style: styles.h2 }, "9.2 Investigation Methodology"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Incident investigations are conducted using the 5-Whys root cause analysis methodology to identify systemic failures rather than assigning individual blame. The investigation process includes: immediate scene preservation and evidence collection, witness statements and photographic documentation, timeline reconstruction, 5-Whys analysis to determine root cause, identification of corrective and preventive actions (CAPAs), and management review of investigation findings. All investigations must be completed within 72 hours of the incident. Findings and CAPAs are tracked in the ConformEdge incident management module, with statutory forms (W.Cl.2, SAPS 277) generated automatically for reportable incidents."
      ),

      React.createElement(Text, { style: styles.h1 }, "10. Performance Monitoring (ISO 45001, Clause 9.1)"),
      React.createElement(Text, { style: styles.h2 }, "10.1 Leading Indicators"),
      Li({ children: "Safety observations completed per week (target: 5 per supervisor)" }),
      Li({ children: "Toolbox talks conducted (target: daily before each shift)" }),
      Li({ children: "Permit to Work compliance rate (target: 100%)" }),
      Li({ children: "Safety training hours completed (target: 2 hours per worker per month)" }),
      Li({ children: "Hazard reports submitted (target: increasing month-on-month)" }),

      React.createElement(Text, { style: styles.h2 }, "10.2 Lagging Indicators"),
      Li({ children: "Lost Time Injury Frequency Rate (LTIFR) — target: <0.5" }),
      Li({ children: "Total Recordable Incident Rate (TRIR) — target: <2.0" }),
      Li({ children: "Near-miss to incident ratio — target: >10:1" }),
      Li({ children: "CAPA closure rate — target: 95% within due date" }),
      Li({ children: "Disabling Injury Incidence Rate (DIIR) — target: <1.0" }),

      React.createElement(Text, { style: styles.h2 }, "10.3 Safety Performance Objectives"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "The project has established measurable OH&S objectives aligned with ISO 45001 Clause 6.2: reduce site incident rate by 30% compared to the 2025 baseline (measured monthly), achieve 100% work permit closure within 48 hours, maintain zero fatalities and zero permanent disabilities, achieve 95% subcontractor certification compliance, and complete 100% of scheduled safety inspections. Progress against these objectives is reported monthly to the Project Steering Committee and quarterly at the Maziya Group Management Review."
      ),

      React.createElement(Text, { style: styles.h1 }, "11. Management Review (ISO 45001, Clause 9.3)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "The OH&S management system is reviewed quarterly at the Management Review meeting, chaired by the CEO or Project Director. Review inputs include: safety performance data and trend analysis, results of internal and external audits, status of corrective and preventive actions, changes in legislation or regulatory requirements, opportunities for continual improvement, incident investigation findings and lessons learned, and feedback from worker consultation. Review outputs include decisions on OH&S policy changes, resource allocation, updated objectives and targets, and assignments of corrective actions with responsible persons and due dates."
      ),
      React.createElement(
        Text,
        { style: styles.footer },
        "MZY-SMP-PTCS-KZN-001 Rev 3.0 | Safety Management Plan | Page 5 of 8"
      )
    ),

    // Page 5 — PPE, Subcontractors, Document Control
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.h1 }, "12. Personal Protective Equipment (ISO 45001, Clause 8.1.2)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "The following minimum PPE is required for all persons on the project site: safety helmet (SANS 1397 approved), safety boots (steel toe and midsole, SANS 20345), high-visibility vest (Class 2 minimum), safety glasses (clear lens, SANS 1404), and hearing protection where noise exceeds 85 dB(A). Additional task-specific PPE requirements are specified in the relevant Safe Work Procedures and include: full-body harness and double lanyard for working at height, arc flash rated clothing (ATPV 40 cal/cm²) for electrical work on traction systems, FR coveralls for hot work, respiratory protection for confined space and chemical exposure, and welding PPE (auto-darkening helmet, leather apron, gauntlets)."
      ),

      React.createElement(Text, { style: styles.h1 }, "13. Subcontractor Management"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "All subcontractors engaged on the project must meet the following requirements before mobilisation: valid letter of good standing from the Compensation Commissioner, proof of public liability insurance (minimum R20 million), appointment of a competent Construction Supervisor (Regulation 8(7)), submission of a project-specific Health and Safety Plan, provision of valid competency certificates for all personnel, and agreement to comply with this Safety Management Plan and all project safety requirements."
      ),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Subcontractor safety performance is monitored through weekly site safety audits, monthly safety statistics reporting, and quarterly compliance reviews. Subcontractors with persistent non-compliance will be issued formal warnings and may be removed from the project. All subcontractor certifications are tracked digitally with automated expiry alerts to prevent any lapse in compliance."
      ),

      React.createElement(Text, { style: styles.h1 }, "14. Document Control and Records (ISO 45001, Clause 7.5)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "All safety documentation is managed in accordance with the Maziya Group Document Control Procedure (MZY-DCP-001). Documents are classified, version-controlled, and stored digitally. Key safety records maintained include: risk assessments and safe work procedures, permits to work (issued and closed), incident reports and investigation records, training records and competency certificates, inspection and audit reports, safety committee meeting minutes, and statutory appointments (Section 16.2, CR 8(1), CR 8(7), etc.)."
      ),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Safety records are retained for a minimum of five years from project completion, or as required by applicable legislation. The project utilises the ConformEdge digital compliance platform for document management, which provides AI-powered document classification, gap analysis against ISO requirements, and one-click audit pack generation for regulatory and client audits."
      ),

      React.createElement(Text, { style: styles.h1 }, "15. Continual Improvement (ISO 45001, Clause 10.3)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "The OH&S management system is subject to continual improvement through: regular analysis of incident trends and root causes, benchmarking against industry safety performance, implementation of lessons learned from incidents on this and other Maziya projects, feedback from workers through the consultation and participation process, results of internal and external audits, and technological improvements in safety controls and monitoring. Improvement initiatives are prioritised based on risk significance and tracked through the CAPA management system until verified closure."
      ),

      React.createElement(
        View,
        { style: { marginTop: 40, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4 } },
        React.createElement(
          Text,
          { style: { fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 8 } },
          "Document Approval"
        ),
        React.createElement(
          Text,
          { style: { fontSize: 10, marginBottom: 4 } },
          "Prepared by:  B.B. Nyathi, Senior Manager — Project System Assurance     Date: 28 February 2026"
        ),
        React.createElement(
          Text,
          { style: { fontSize: 10, marginBottom: 4 } },
          "Reviewed by:  K. Madiba, Senior Project Manager                          Date: 01 March 2026"
        ),
        React.createElement(
          Text,
          { style: { fontSize: 10 } },
          "Approved by:  C. Delport, Chief Executive Officer                        Date: 01 March 2026"
        )
      ),

      React.createElement(
        Text,
        { style: styles.footer },
        "MZY-SMP-PTCS-KZN-001 Rev 3.0 | Safety Management Plan | Page 6 of 8"
      )
    )
  )

async function main() {
  const outputPath = `${__dirname}/Safety-Management-Plan-PRASA-PTCS-KZN.pdf`
  await renderToFile(SafetyManagementPlan(), outputPath)
  console.log(`✅ PDF generated: ${outputPath}`)
  console.log(`   File ready for upload to ConformEdge for AI classification demo`)
}

main().catch(console.error)
