/**
 * Evidence strength vocabulary — never silently upgrade.
 *
 * Kept free of schema-library imports (M24) so client components can enumerate
 * the states without pulling a validator into the browser bundle. `schema.ts`
 * builds its enum from this list, so the two cannot drift.
 */
export const EVIDENCE_STATES = [
  "PUBLIC_CODE_VERIFIED",
  "PUBLIC_DOCUMENT_VERIFIED",
  "OWNER_CONFIRMED_PROFESSIONAL",
  "RESUME_DOCUMENTED",
  "PRIOR_PROJECT_CONTEXT",
  "PORTFOLIO_EXTENSION",
  "LIMITED_EVIDENCE",
  "NOT_DEMONSTRATED",
] as const;

export type EvidenceState = (typeof EVIDENCE_STATES)[number];
