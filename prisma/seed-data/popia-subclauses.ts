import type { SubClauseData } from "../seed"

/**
 * POPIA — Protection of Personal Information Act (Act 4 of 2013)
 * South African data protection legislation, effective 1 July 2021.
 *
 * Structure follows the Act's chapters and sections.
 * Top-level clauses defined in seed.ts STANDARD_CLAUSES.
 */
export const POPIA_SUB_CLAUSES: SubClauseData[] = [
  // ── Chapter 1: Definitions, Purpose and Application ──
  {
    parentClauseNumber: "1",
    clauseNumber: "1.1",
    title: "Definitions",
    description: "Key definitions including 'personal information', 'processing', 'data subject', 'responsible party', 'operator', 'Information Regulator', 'special personal information', 'consent', and 'direct marketing'.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.2",
    title: "Purpose of the Act",
    description: "Give effect to the constitutional right to privacy by safeguarding personal information when processed by a responsible party. Balance the right to privacy against other rights including access to information, freedom of expression, and the legitimate interests of the responsible party.",
  },
  {
    parentClauseNumber: "1",
    clauseNumber: "1.3",
    title: "Application and exclusions",
    description: "The Act applies to the processing of personal information by or for a responsible party domiciled in South Africa, or using automated or non-automated means in SA. Exclusions include purely personal/household activity, journalistic/literary/artistic purposes, and certain national security activities.",
  },

  // ── Chapter 2: Conditions for Lawful Processing ──
  {
    parentClauseNumber: "2",
    clauseNumber: "2.1",
    title: "Condition 1 — Accountability",
    description: "The responsible party must ensure that all conditions for lawful processing are complied with at the time of determining the purpose and means of processing, and during the processing itself.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.2",
    title: "Condition 2 — Processing limitation",
    description: "Personal information must be processed lawfully in a reasonable manner that does not infringe the privacy of the data subject. Processing must be adequate, relevant, and not excessive given the purpose. Consent or another legal basis is required.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.3",
    title: "Condition 3 — Purpose specification",
    description: "Personal information must be collected for a specific, explicitly defined, and lawful purpose related to a function or activity of the responsible party. Records must not be retained longer than necessary for the specified purpose.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.4",
    title: "Condition 4 — Further processing limitation",
    description: "Further processing of personal information must be compatible with the purpose for which it was originally collected. Assess compatibility by considering the relationship between purposes, the nature of information, consequences for the data subject, and any contractual rights.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.5",
    title: "Condition 5 — Information quality",
    description: "The responsible party must take reasonably practicable steps to ensure personal information is complete, accurate, not misleading, and updated where necessary, having regard to the purpose for which it is processed.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.6",
    title: "Condition 6 — Openness",
    description: "Maintain documentation of all processing operations. Take reasonably practicable steps to ensure data subjects are aware of information being collected, the purpose, source, and their rights under the Act. Notify the Information Regulator of processing activities.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.7",
    title: "Condition 7 — Security safeguards",
    description: "Secure the integrity and confidentiality of personal information by implementing appropriate, reasonable technical and organisational measures. Identify foreseeable internal and external risks, establish adequate safeguards, verify safeguards are effectively implemented, and update continuously.",
  },
  {
    parentClauseNumber: "2",
    clauseNumber: "2.8",
    title: "Condition 8 — Data subject participation",
    description: "A data subject has the right to request confirmation of whether a responsible party holds personal information about them, to request a description and record of that information, to request correction or deletion, and to request destruction of information that the responsible party is no longer authorised to retain.",
  },

  // ── Chapter 3: Rights of Data Subjects ──
  {
    parentClauseNumber: "3",
    clauseNumber: "3.1",
    title: "Right of access to personal information",
    description: "A data subject may request a responsible party to confirm whether it holds personal information, and request access to that information. The request must be made in the prescribed manner and the responsible party must respond within a reasonable time.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.2",
    title: "Right to correction or deletion",
    description: "A data subject may request a responsible party to correct or delete personal information that is inaccurate, irrelevant, excessive, out of date, incomplete, misleading, or obtained unlawfully. The responsible party must comply and notify any third parties to whom it was disclosed.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.3",
    title: "Right to object to processing",
    description: "A data subject may object to the processing of personal information on reasonable grounds relating to their particular situation, unless legislation provides for such processing. A data subject may also object to processing for purposes of direct marketing at any time.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.4",
    title: "Right not to be subject to automated decision-making",
    description: "A data subject may not be subject to a decision which results in legal consequences or which significantly affects them, based solely on automated processing of personal information intended to provide a profile of such person.",
  },
  {
    parentClauseNumber: "3",
    clauseNumber: "3.5",
    title: "Right to submit a complaint",
    description: "A data subject may submit a complaint to the Information Regulator regarding an alleged interference with their personal information. The Regulator must investigate and may issue enforcement notices or refer the matter for prosecution.",
  },

  // ── Chapter 4: Exemptions ──
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "General exemptions",
    description: "Exemptions from certain conditions may apply for processing related to national security, defence, public safety, prevention and detection of crime, important economic or financial interests, and journalism or artistic expression.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Application for exemption",
    description: "A responsible party may apply to the Information Regulator for an exemption from any provision of the Act. The Regulator must consider the public interest and the rights of data subjects when determining exemption applications.",
  },

  // ── Chapter 5: Special Personal Information ──
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Prohibition on processing special information",
    description: "Processing of special personal information (religious or philosophical beliefs, race or ethnic origin, trade union membership, political persuasion, health, sexual life, biometric information, or criminal behaviour) is generally prohibited.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Authorised processing of special information",
    description: "Special personal information may be processed where: the data subject consented, processing is necessary for the exercise or defence of a right or obligation in law, processing is for historical, statistical, or research purposes, or another statutory exception applies.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Processing of children's personal information",
    description: "Processing of personal information of a child (under 18) requires consent of a competent person (parent or guardian). Processing is only permitted where it is carried out with appropriate consent and it is in the best interest of the child.",
  },

  // ── Chapter 6: Transborder Information Flows ──
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Prohibition on transfer to third parties in foreign countries",
    description: "Personal information may only be transferred to a recipient in another country if that country has adequate data protection law, the data subject consents, the transfer is necessary for contractual performance, or the transfer is for the benefit of the data subject and consent cannot reasonably be obtained.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Binding corporate rules and agreements",
    description: "Transfers may be permitted where the responsible party has concluded binding corporate rules or agreements that provide adequate safeguards for the data subject's rights. Such rules must be approved by the Information Regulator.",
  },

  // ── Chapter 7: Information Regulator ──
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Establishment and functions",
    description: "The Information Regulator is an independent body established to ensure compliance with POPIA and PAIA. Functions include education, research, monitoring, handling complaints, issuing codes of conduct, and advising government on data protection legislation.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Enforcement and investigation powers",
    description: "The Regulator may conduct investigations, issue information and enforcement notices, conduct assessments, impose administrative fines, and refer matters to courts. The Regulator may enter premises and seize documents during investigations.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "Codes of conduct",
    description: "The Regulator may issue codes of conduct for specific industries or purposes. Responsible parties may also submit codes for approval. Compliance with an approved code may be considered as evidence of compliance with POPIA.",
  },

  // ── Chapter 8: Information Officer ──
  {
    parentClauseNumber: "8",
    clauseNumber: "8.1",
    title: "Designation of Information Officer",
    description: "Every responsible party that is a public or private body must designate an Information Officer. The head of a private body is by default the Information Officer unless another person is designated and registered with the Information Regulator.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.2",
    title: "Deputy Information Officers",
    description: "A responsible party may designate Deputy Information Officers to act on behalf of the Information Officer. Delegation does not relieve the Information Officer of responsibility for ensuring compliance with the Act.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.3",
    title: "Responsibilities of the Information Officer",
    description: "Ensure compliance with POPIA, encourage compliance with conditions for lawful processing, deal with access requests, work with the Regulator, ensure a compliance framework is in place, conduct personal information impact assessments, and maintain a PAIA manual.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.4",
    title: "Registration with the Information Regulator",
    description: "The Information Officer and any Deputy Information Officers must be registered with the Information Regulator. Provide details including the responsible party's processing activities, categories of data subjects, and types of personal information processed.",
  },

  // ── Chapter 9: Security Compromises ──
  {
    parentClauseNumber: "9",
    clauseNumber: "9.1",
    title: "Notification of security compromises",
    description: "Where there are reasonable grounds to believe that the personal information of a data subject has been accessed or acquired by any unauthorised person, the responsible party must notify the Information Regulator and the data subject as soon as reasonably possible.",
  },
  {
    parentClauseNumber: "9",
    clauseNumber: "9.2",
    title: "Content of notification",
    description: "Notification must include a description of the possible consequences of the security compromise, measures taken or to be taken to address the compromise, and a recommendation of measures the data subject can take to mitigate possible adverse effects.",
  },
  {
    parentClauseNumber: "9",
    clauseNumber: "9.3",
    title: "Breach response and remediation",
    description: "Implement incident response procedures for security compromises. Contain the breach, assess the risk to data subjects, implement remedial measures, document the breach and response, and review security safeguards to prevent recurrence.",
  },

  // ── Chapter 10: Direct Marketing ──
  {
    parentClauseNumber: "10",
    clauseNumber: "10.1",
    title: "Direct marketing by means of unsolicited electronic communications",
    description: "Processing of personal information for purposes of direct marketing by electronic communication (email, SMS, automated calling) is prohibited unless the data subject has given consent, or the responsible party has obtained the contact details in the context of a sale of a product or service.",
  },
  {
    parentClauseNumber: "10",
    clauseNumber: "10.2",
    title: "Opt-out requirements",
    description: "Every direct marketing communication must contain details of the identity of the sender, an address or other contact details for opting out, and an opt-out mechanism that is free of charge. A data subject may opt out at any time.",
  },
  {
    parentClauseNumber: "10",
    clauseNumber: "10.3",
    title: "Pre-existing direct marketing lists",
    description: "A responsible party with a pre-existing direct marketing list must contact data subjects within a reasonable time to request consent. If consent is not given, the data subject's details must be removed from the marketing list.",
  },

  // ── Chapter 11: Offences, Penalties and Administrative Fines ──
  {
    parentClauseNumber: "11",
    clauseNumber: "11.1",
    title: "Offences under the Act",
    description: "Offences include: obtaining or disclosing a unique identifier or account number of a data subject for unlawful purposes, selling personal information unlawfully, failing to comply with enforcement notices, obstructing the Regulator, and hindering an investigation.",
  },
  {
    parentClauseNumber: "11",
    clauseNumber: "11.2",
    title: "Penalties",
    description: "A person convicted of an offence is liable to a fine or imprisonment for a period not exceeding 10 years, or both. Administrative fines up to R10 million may be imposed by the Information Regulator for non-compliance.",
  },
  {
    parentClauseNumber: "11",
    clauseNumber: "11.3",
    title: "Civil remedies",
    description: "A data subject or the Information Regulator may institute civil proceedings for damages suffered as a result of a breach of the Act. The responsible party bears the burden of proving that any interference with privacy was not their fault.",
  },
  {
    parentClauseNumber: "11",
    clauseNumber: "11.4",
    title: "Operator liability",
    description: "An operator (third-party processor) that processes personal information on behalf of a responsible party must do so only with the knowledge or authorisation of the responsible party and must treat the information as confidential. Operators are subject to security safeguard obligations.",
  },
]
