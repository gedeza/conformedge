import type { SubClauseData } from "../seed"

export const ISO27001_SUB_CLAUSES: SubClauseData[] = [
  // Clause 4
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Understanding the organization and its context",
    description: "Determine external and internal issues relevant to the organization's purpose and that affect its ability to achieve the intended outcomes of the information security management system.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Understanding the needs and expectations of interested parties",
    description: "Determine the interested parties relevant to the ISMS, their requirements relevant to information security, and which requirements will be addressed through the ISMS.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.3",
    title: "Determining the scope of the information security management system",
    description: "Determine the boundaries and applicability of the ISMS to establish its scope, considering the external and internal issues, the requirements of interested parties, and interfaces and dependencies between activities performed by the organization and those performed by other organizations.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.4",
    title: "Information security management system",
    description: "Establish, implement, maintain and continually improve an ISMS, including the processes needed and their interactions.",
  },

  // Clause 5
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Leadership and commitment",
    description: "Top management shall demonstrate leadership and commitment by ensuring the information security policy and objectives are established and compatible with the strategic direction, ensuring integration of ISMS requirements into business processes, and ensuring resources are available.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Policy",
    description: "Top management shall establish an information security policy that is appropriate to the purpose of the organization, includes information security objectives or provides the framework for setting them, and includes commitments to satisfy applicable requirements and continual improvement.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Organizational roles, responsibilities and authorities",
    description: "Top management shall ensure that the responsibilities and authorities for roles relevant to information security are assigned and communicated within the organization.",
  },

  // Clause 6
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Actions to address risks and opportunities",
    description: "Determine the risks and opportunities that need to be addressed to ensure the ISMS can achieve its intended outcomes, prevent or reduce undesired effects, and achieve continual improvement.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1.2",
    title: "Information security risk assessment",
    description: "Define and apply an information security risk assessment process that establishes and maintains information security risk criteria, ensures consistent, valid and comparable results, identifies information security risks, analyses and evaluates risks.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1.3",
    title: "Information security risk treatment",
    description: "Define and apply an information security risk treatment process to select appropriate risk treatment options, determine all controls necessary to implement the treatment options, compare with Annex A to verify no necessary controls have been omitted, and produce a Statement of Applicability.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Information security objectives and planning to achieve them",
    description: "Establish information security objectives at relevant functions and levels that are consistent with the information security policy, are measurable, take into account applicable requirements and risk assessment/treatment results, are monitored, communicated, and updated.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.3",
    title: "Planning of changes",
    description: "When the organization determines the need for changes to the ISMS, the changes shall be carried out in a planned manner.",
  },

  // Clause 7
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Resources",
    description: "Determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the ISMS.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Competence",
    description: "Determine the necessary competence of persons doing work that affects information security performance, ensure they are competent, and take actions to acquire the necessary competence.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "Awareness",
    description: "Persons doing work under the organization's control shall be aware of the information security policy, their contribution to the ISMS effectiveness, and the implications of not conforming with ISMS requirements.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.4",
    title: "Communication",
    description: "Determine the need for internal and external communications relevant to the ISMS including what, when, with whom, and how to communicate.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.5",
    title: "Documented information",
    description: "The ISMS shall include documented information required by this standard and determined by the organization as necessary for ISMS effectiveness. Control creation, updating, and control of documented information ensuring appropriate availability, adequacy and protection.",
  },

  // Clause 8
  {
    parentClauseNumber: "8",
    clauseNumber: "8.1",
    title: "Operational planning and control",
    description: "Plan, implement and control the processes needed to meet information security requirements and to implement the actions for addressing risks and opportunities.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.2",
    title: "Information security risk assessment",
    description: "Perform information security risk assessments at planned intervals or when significant changes are proposed or occur, considering the criteria established in 6.1.2.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.3",
    title: "Information security risk treatment",
    description: "Implement the information security risk treatment plan and retain documented information of the results.",
  },

  // Clause 9
  {
    parentClauseNumber: "9",
    clauseNumber: "9.1",
    title: "Monitoring, measurement, analysis and evaluation",
    description: "Determine what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation, when they shall be performed, who shall monitor and measure, and when the results shall be analysed and evaluated.",
  },
  {
    parentClauseNumber: "9",
    clauseNumber: "9.2",
    title: "Internal audit",
    description: "Conduct internal audits at planned intervals to provide information on whether the ISMS conforms to the organization's own requirements and to this standard, and is effectively implemented and maintained.",
  },
  {
    parentClauseNumber: "9",
    clauseNumber: "9.3",
    title: "Management review",
    description: "Top management shall review the ISMS at planned intervals to ensure its continuing suitability, adequacy and effectiveness, considering the status of actions from previous reviews, changes in context, feedback on information security performance, and results of risk assessments and risk treatment plans.",
  },

  // Clause 10
  {
    parentClauseNumber: "10",
    clauseNumber: "10.1",
    title: "Continual improvement",
    description: "Continually improve the suitability, adequacy and effectiveness of the ISMS.",
  },
  {
    parentClauseNumber: "10",
    clauseNumber: "10.2",
    title: "Nonconformity and corrective action",
    description: "When a nonconformity occurs, react to the nonconformity, evaluate the need for action to eliminate the root causes, implement any action needed, review the effectiveness of corrective action, and make changes to the ISMS if necessary.",
  },
]
