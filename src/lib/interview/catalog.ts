/**
 * Evidence-bounded interview question catalogue (M21).
 * Questions are authored against canonical evidence ids — never generated from free text.
 */

export const INTERVIEW_ARCHETYPES = ["VERIFY", "DEFEND", "STRESS", "BOUNDARY"] as const;

export type InterviewArchetype = (typeof INTERVIEW_ARCHETYPES)[number];

export const INTERVIEW_TOPICS = [
  "MLOPS_GOVERNANCE",
  "STEWARD_AGENTS",
  "MALWARE_EXPLAINABILITY",
] as const;

export type InterviewTopic = (typeof INTERVIEW_TOPICS)[number];

export const INTERVIEW_TOPIC_LABEL: Record<InterviewTopic, string> = {
  MLOPS_GOVERNANCE: "MLOps governance · drift · observability",
  STEWARD_AGENTS: "Steward_AI · MCP · FHIR boundaries",
  MALWARE_EXPLAINABILITY: "PDF malware · explainability boundaries",
};

export const INTERVIEW_ENTRY_LINE =
  "Don't let my portfolio answer for me. Let it tell you what to ask me.";

/** Hard boundary — the portfolio shows evidence, never Anish's answer. */
export const ANSWER_KEY_NOTICE = [
  "ANSWER KEY",
  "Not generated.",
  "This portfolio can show you the evidence behind each question.",
  "It will not manufacture Anish's interview answer.",
  "Ask him.",
] as const;

export const MAX_INTERVIEW_QUESTIONS = 3;

export type InterviewQuestionTemplate = {
  id: string;
  archetype: InterviewArchetype;
  topic: InterviewTopic;
  /** Canonical session item ids whose inspection can trigger this question. */
  triggerItemIds: readonly string[];
  /** Canonical evidence node ids this question is bounded by. */
  evidenceIds: readonly string[];
  lead: string;
  followUp: string;
  /** WHY THIS QUESTION? — what in the trail earned it. */
  why: string;
  /** Fairness rationale — why this is answerable from public evidence. */
  fairness: string;
};

export const INTERVIEW_CATALOG: readonly InterviewQuestionTemplate[] = [
  {
    id: "q.mlops.verify-drift-math",
    archetype: "VERIFY",
    topic: "MLOPS_GOVERNANCE",
    triggerItemIds: ["project:proj.mlops-governance", "lab:mlops"],
    evidenceIds: ["ev.mlops.psi", "ev.mlops.ks"],
    lead: "Your PSI and KS implementations are in public code. Walk me through how you bin a continuous feature for PSI, and what you do with empty bins.",
    followUp:
      "KS is distribution-free and PSI is not. Where does that difference change your decision?",
    why: "You inspected the MLOps drift evidence, where both statistics are implemented in verified public source.",
    fairness:
      "Both statistics are PUBLIC_CODE_VERIFIED, so the question can be checked against the repository rather than taken on trust.",
  },
  {
    id: "q.mlops.defend-promotion-policy",
    archetype: "DEFEND",
    topic: "MLOPS_GOVERNANCE",
    triggerItemIds: ["project:proj.mlops-governance", "lab:mlops"],
    evidenceIds: ["ev.mlops.policy", "ev.mlops.audit"],
    lead: "Drift detected is not drift that matters. Defend the governance checks you wrote: what would you refuse to promote, and what would you let through with an audit note?",
    followUp: "Who overrides the gate, and what does the audit record have to contain?",
    why: "Your trail covered the governance and audit evidence, not just the detection maths.",
    fairness:
      "Policy and audit representation both exist as verified public code, so the claim is reviewable.",
  },
  {
    id: "q.mlops.stress-detector-disagreement",
    archetype: "STRESS",
    topic: "MLOPS_GOVERNANCE",
    triggerItemIds: ["lab:mlops", "project:proj.mlops-governance"],
    evidenceIds: ["ev.mlops.drift", "ev.mlops.monitoring"],
    lead: "PSI flags a feature and KS does not, on the same window. The model is serving. What do you ship in the next hour?",
    followUp:
      "What signal would make you reverse that call, and how long would you wait for it?",
    why: "You ran the drift lens where detector disagreement is reproducible.",
    fairness:
      "The disagreement case is a real property of the implemented detectors, not a hypothetical scenario invented for interviewing.",
  },
  {
    id: "q.mlops.boundary-lab-vs-production",
    archetype: "BOUNDARY",
    topic: "MLOPS_GOVERNANCE",
    triggerItemIds: ["lab:mlops"],
    evidenceIds: ["ev.mlops.runtime-lab"],
    lead: "The lab you just ran is a deterministic browser simulation, not the production runtime. Which parts of it would break first against real serving traffic?",
    followUp: "What would you need to instrument before trusting the same thresholds?",
    why: "You ran the browser MLOps lab, which is labelled a portfolio extension.",
    fairness:
      "The lab is declared PORTFOLIO_EXTENSION in the graph, so asking about its limits is asking about a stated boundary rather than a hidden one.",
  },
  {
    id: "q.steward.verify-mcp-tools",
    archetype: "VERIFY",
    topic: "STEWARD_AGENTS",
    triggerItemIds: ["project:proj.steward-ai", "lab:steward"],
    evidenceIds: ["ev.steward.mcp", "ev.steward.fhir"],
    lead: "Take me through the MCP tool server you wrote: how a tool is registered, and what happens to a call whose input fails validation.",
    followUp:
      "Where does FHIR-shaped context enter, and what does the tool see versus what the model sees?",
    why: "You inspected the Steward_AI tool-server evidence.",
    fairness:
      "The tool server and FHIR context are verified public code, so implementation detail is checkable.",
  },
  {
    id: "q.steward.stress-tool-conflict",
    archetype: "STRESS",
    topic: "STEWARD_AGENTS",
    triggerItemIds: ["lab:steward", "project:proj.steward-ai"],
    evidenceIds: ["ev.steward.a2a", "ev.steward.mcp"],
    lead: "Two tools return contradictory context for the same patient. Your agent has to act. What does the orchestration layer do, and what does it refuse to do?",
    followUp:
      "How does the conflict surface to a human rather than getting averaged away?",
    why: "You ran the Steward scenarios, including the conflicting-context path.",
    fairness:
      "Orchestration and tool-state handling are both represented in public source, and the refusal behaviour is already stated in the prototype boundary.",
  },
  {
    id: "q.steward.boundary-clinical",
    archetype: "BOUNDARY",
    topic: "STEWARD_AGENTS",
    triggerItemIds: ["project:proj.steward-ai", "lab:steward"],
    evidenceIds: ["ev.steward.safety-boundary", "ev.steward.runtime-lab"],
    lead: "Steward_AI is a prototype and withholds treatment advice. Where exactly is that refusal enforced, and what would have to change before it could be clinical?",
    followUp:
      "Which of those changes is engineering, and which is governance you cannot code?",
    why: "You opened the Steward safety boundary evidence.",
    fairness:
      "The prototype boundary is declared in the public README, so the question tests judgement rather than exposing an undisclosed weakness.",
  },
  {
    id: "q.malware.defend-explainability",
    archetype: "DEFEND",
    topic: "MALWARE_EXPLAINABILITY",
    triggerItemIds: ["project:proj.malware-pdf", "lab:malware"],
    evidenceIds: ["ev.malware.shap-limited", "ev.malware.report"],
    lead: "Detailed SHAP evidence for this project is marked limited. Defend which explainability claims you would still repeat to a security team, and which you would drop.",
    followUp: "What would you have to publish to move that claim to verified?",
    why: "You inspected the malware explainability evidence, where SHAP detail is explicitly limited.",
    fairness:
      "The limitation is already declared as LIMITED_EVIDENCE, so this asks about a gap the portfolio surfaces itself.",
  },
  {
    id: "q.malware.boundary-static-features",
    archetype: "BOUNDARY",
    topic: "MALWARE_EXPLAINABILITY",
    triggerItemIds: ["lab:malware", "project:proj.malware-pdf"],
    evidenceIds: ["ev.malware.runtime-lab", "ev.malware.project"],
    lead: "The lab scores static structure only, with no execution. What class of malicious PDF does that feature set structurally miss?",
    followUp:
      "What would you add first — and what new false-positive cost would it bring?",
    why: "You ran the static PDF feature lab.",
    fairness:
      "The static-only limitation is stated in the lab boundary, so the question is about a disclosed design constraint.",
  },
];
