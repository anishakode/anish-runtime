/**
 * Publication requirements text (M14), kept in a validator-free module (M24) so
 * the client museum can display the gate without shipping a schema library.
 */
export const FAILURE_PUBLICATION_REQUIREMENTS = [
  "At least one artifact-grade source (SHA-pinned GitHub file/repo, public report URL, or project artifact URL).",
  "Every claimed metric cites an artifact on the same exhibit.",
  "Evidence state must not be NOT_DEMONSTRATED or PORTFOLIO_EXTENSION for published exhibits.",
  "No remembered outage theatre or reconstructed failure story without original artifacts.",
] as const;
