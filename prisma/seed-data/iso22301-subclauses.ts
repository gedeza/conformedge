import type { SubClauseData } from "../seed"

export const ISO22301_SUB_CLAUSES: SubClauseData[] = [
  // Clause 4
  {
    parentClauseNumber: "4",
    clauseNumber: "4.1",
    title: "Understanding the organization and its context",
    description: "Determine external and internal issues relevant to the organization's purpose and that affect its ability to achieve the intended outcomes of its business continuity management system.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.2",
    title: "Understanding the needs and expectations of interested parties",
    description: "Determine the interested parties relevant to the BCMS, their requirements relevant to business continuity, and the legal and regulatory requirements and contractual obligations applicable.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.3",
    title: "Determining the scope of the BCMS",
    description: "Determine the boundaries and applicability of the BCMS to establish its scope, considering the external and internal issues, the requirements of interested parties, and the products, services and activities of the organization.",
  },
  {
    parentClauseNumber: "4",
    clauseNumber: "4.4",
    title: "Business continuity management system",
    description: "Establish, implement, maintain and continually improve a BCMS, including the processes needed and their interactions.",
  },

  // Clause 5
  {
    parentClauseNumber: "5",
    clauseNumber: "5.1",
    title: "Leadership and commitment",
    description: "Top management shall demonstrate leadership and commitment by ensuring the BCMS policy and objectives are established and compatible with the strategic direction of the organization.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.2",
    title: "Policy",
    description: "Top management shall establish a business continuity policy that is appropriate to the purpose of the organization, provides a framework for setting objectives, includes a commitment to satisfy applicable requirements, and a commitment to continual improvement of the BCMS.",
  },
  {
    parentClauseNumber: "5",
    clauseNumber: "5.3",
    title: "Organizational roles, responsibilities and authorities",
    description: "Top management shall ensure that responsibilities and authorities for relevant roles are assigned and communicated within the organization.",
  },

  // Clause 6
  {
    parentClauseNumber: "6",
    clauseNumber: "6.1",
    title: "Actions to address risks and opportunities",
    description: "Determine the risks and opportunities that need to be addressed to ensure the BCMS can achieve its intended outcomes, prevent or reduce undesired effects, and achieve continual improvement.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.2",
    title: "Business continuity objectives and plans to achieve them",
    description: "Establish business continuity objectives at relevant functions and levels that are consistent with the business continuity policy, are measurable, take into account applicable requirements, and are monitored and updated.",
  },
  {
    parentClauseNumber: "6",
    clauseNumber: "6.3",
    title: "Planning changes to the BCMS",
    description: "When the organization determines the need for changes to the BCMS, the changes shall be carried out in a planned and systematic manner.",
  },

  // Clause 7
  {
    parentClauseNumber: "7",
    clauseNumber: "7.1",
    title: "Resources",
    description: "Determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the BCMS.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.2",
    title: "Competence",
    description: "Determine the necessary competence of persons doing work that affects the BCMS performance, ensure they are competent on the basis of education, training or experience, and take actions to acquire the necessary competence.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.3",
    title: "Awareness",
    description: "Persons doing work under the organization's control shall be aware of the business continuity policy, their contribution to the BCMS effectiveness, the implications of not conforming, and their role during a disruptive incident.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.4",
    title: "Communication",
    description: "Determine the need for internal and external communications relevant to the BCMS and establish, implement and maintain procedures for communication before, during and after a disruption.",
  },
  {
    parentClauseNumber: "7",
    clauseNumber: "7.5",
    title: "Documented information",
    description: "The BCMS shall include documented information required by this standard and determined by the organization as necessary for BCMS effectiveness. Establish controls for creation, updating, and control of documented information.",
  },

  // Clause 8
  {
    parentClauseNumber: "8",
    clauseNumber: "8.1",
    title: "Operational planning and control",
    description: "Plan, implement and control the processes needed to meet requirements and to implement the actions for addressing risks and opportunities, by establishing criteria for the processes and implementing control of the processes in accordance with the criteria.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.2",
    title: "Business impact analysis and risk assessment",
    description: "Implement and maintain a business impact analysis process that identifies activities supporting provision of products and services, assesses impacts over time of not performing activities, sets prioritized timeframes for resuming activities, and identifies dependencies and supporting resources.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.3",
    title: "Business continuity strategies and solutions",
    description: "Identify and select business continuity strategies and solutions based on the outputs from the business impact analysis and risk assessment, addressing how to protect prioritized activities, stabilize and continue them during disruption, resume them after disruption, and manage the impacts.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.4",
    title: "Business continuity plans and procedures",
    description: "Establish, implement and maintain business continuity plans and procedures that define the purpose and scope, activation criteria, implementation procedures, roles and responsibilities, communication requirements, and interdependencies.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.5",
    title: "Exercise programme",
    description: "Implement and maintain an exercise programme that validates the completeness and currency of business continuity plans and procedures, identifies opportunities for improvement, and is consistent with the scope and objectives of the BCMS.",
  },
  {
    parentClauseNumber: "8",
    clauseNumber: "8.6",
    title: "Evaluation of business continuity documentation and capabilities",
    description: "Evaluate the suitability, adequacy and effectiveness of the business impact analysis, risk assessment, strategies, solutions, plans and procedures through reviews, exercises and post-incident analysis.",
  },

  // Clause 9
  {
    parentClauseNumber: "9",
    clauseNumber: "9.1",
    title: "Monitoring, measurement, analysis and evaluation",
    description: "Determine what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation, when they shall be performed, and when the results shall be analysed and evaluated.",
  },
  {
    parentClauseNumber: "9",
    clauseNumber: "9.2",
    title: "Internal audit",
    description: "Conduct internal audits at planned intervals to provide information on whether the BCMS conforms to the organization's own requirements and to this standard, and is effectively implemented and maintained.",
  },
  {
    parentClauseNumber: "9",
    clauseNumber: "9.3",
    title: "Management review",
    description: "Top management shall review the BCMS at planned intervals to ensure its continuing suitability, adequacy and effectiveness, considering the status of previous actions, changes in context, BCMS performance including trends, exercise and test results, and risks.",
  },

  // Clause 10
  {
    parentClauseNumber: "10",
    clauseNumber: "10.1",
    title: "Nonconformity and corrective action",
    description: "When a nonconformity occurs, react to the nonconformity by taking action to control and correct it, evaluate the need for action to eliminate root causes, implement any action needed, review the effectiveness of corrective action taken, and make changes to the BCMS if necessary.",
  },
  {
    parentClauseNumber: "10",
    clauseNumber: "10.2",
    title: "Continual improvement",
    description: "Continually improve the suitability, adequacy and effectiveness of the BCMS.",
  },
]
