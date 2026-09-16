/**
 * Artifact-grade publication gate for Failure Museum exhibits (M14).
 */

import { FailureExhibitSchema, type FailureExhibit } from "./schema";

/** Human-readable requirements that must hold before an exhibit can publish. */
export { FAILURE_PUBLICATION_REQUIREMENTS } from "./requirements";

export type PublicationGateResult =
  { ok: true; exhibit: FailureExhibit } | { ok: false; reasons: string[] };

/**
 * Validate + gate an exhibit candidate.
 * Canonical museum data stays empty until this returns ok for real artifacts.
 */
export function evaluatePublicationGate(candidate: unknown): PublicationGateResult {
  const parsed = FailureExhibitSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      reasons: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "exhibit"}: ${issue.message}`,
      ),
    };
  }

  const exhibit = parsed.data;
  if (exhibit.publicationStatus !== "published") {
    return {
      ok: false,
      reasons: ["publicationStatus must be published to appear in the museum"],
    };
  }

  return { ok: true, exhibit };
}

/** Convenience: true only when the candidate clears the gate. */
export function canPublishExhibit(candidate: unknown): boolean {
  return evaluatePublicationGate(candidate).ok;
}
