/**
 * Honesty + Source Trace contracts for the Steward Agent Lab (M12).
 * Workflow is PORTFOLIO_EXTENSION — grounded in public Steward_AI evidence,
 * not claimed as live FHIR / Gemini / MCP production runtime.
 */

export const STEWARD_LAB_EVIDENCE_STATE = "PORTFOLIO_EXTENSION" as const;

export const STEWARD_SOURCE_TRACE = {
  projectId: "proj.steward-ai",
  projectSlug: "steward-ai",
  runtimeLabNodeId: "ev.steward.runtime-lab",
  safetyNodeId: "ev.steward.safety-boundary",
  mcpNodeId: "ev.steward.mcp",
  fhirNodeId: "ev.steward.fhir",
  mcpSourceId: "src.steward.mcp-server",
  readmeSourceId: "src.steward.readme",
  repoSourceId: "src.steward.repo",
  labSourceId: "src.portfolio.steward-lab",
  mcpSourcePath: "mcp-server/server.py",
  readmeSourcePath: "README.md",
  commitSha: "c9a1d6cfd674d72576208863a5f4c694f9130e50",
} as const;

export const STEWARD_BOUNDARY_NOTICE =
  "PORTFOLIO_EXTENSION — deterministic Steward Agent Lab grounded in public Steward_AI evidence. Synthetic FHIR-shaped context only. Not medical advice. No live FHIR, Gemini, or MCP runtime. FHIR Task is dry-run preview only.";
