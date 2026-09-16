/**
 * Fork Anish orchestrator (M20) — temporary role branch, no fit score.
 */

import type { SearchDocument } from "@/lib/search";
import { classifyRequirements, type ForkRequirementResult } from "./classify";
import { extractRequirements } from "./extract";
import { sanitizeJobDescription } from "./sanitize";

export const FORK_HONESTY_LINE = "I won't claim experience I can't demonstrate.";

export type ForkIntegrityManifest = {
  historicalClaimsChanged: 0;
  evidenceStatesChanged: 0;
  overallFitScore: "not generated";
  jobDescriptionPersistence: "none";
  branchPersistence: "none";
};

export type ForkBranch = {
  roleLabel: string;
  roleSlug: string;
  branchRef: string;
  honestyLine: string;
  removedSensitiveLines: number;
  truncated: boolean;
  requirements: ForkRequirementResult[];
  counts: Record<"VERIFIED" | "PROFESSIONAL" | "LIMITED" | "NOT_DEMONSTRATED", number>;
  integrity: ForkIntegrityManifest;
};

export function buildIntegrityManifest(): ForkIntegrityManifest {
  return {
    historicalClaimsChanged: 0,
    evidenceStatesChanged: 0,
    overallFitScore: "not generated",
    jobDescriptionPersistence: "none",
    branchPersistence: "none",
  };
}

export function forkFromJobDescription(
  rawJd: string,
  documents: readonly SearchDocument[],
): ForkBranch {
  const sanitized = sanitizeJobDescription(rawJd);
  const extracted = extractRequirements(sanitized.text);
  const requirements = classifyRequirements(extracted.requirements, documents);

  const counts = {
    VERIFIED: 0,
    PROFESSIONAL: 0,
    LIMITED: 0,
    NOT_DEMONSTRATED: 0,
  } as ForkBranch["counts"];
  for (const req of requirements) {
    counts[req.classification] += 1;
  }

  return {
    roleLabel: extracted.roleLabel,
    roleSlug: extracted.roleSlug,
    branchRef: `anish/main → role/${extracted.roleSlug}`,
    honestyLine: FORK_HONESTY_LINE,
    removedSensitiveLines: sanitized.removedLineCount,
    truncated: sanitized.truncated,
    requirements,
    counts,
    integrity: buildIntegrityManifest(),
  };
}
