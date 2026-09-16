/**
 * Canonical Failure Museum exhibit dataset (M14).
 * Intentionally empty — proof outranks narrative quality.
 */

import type { FailureExhibit } from "./schema";

/**
 * Published exhibits only. Remains [] until artifact-grade proof exists.
 * Do not invent segmentation / drug-model failure stories here.
 */
export const CANONICAL_FAILURE_EXHIBITS: readonly FailureExhibit[] = [];

export function listPublishedExhibits(
  exhibits: readonly FailureExhibit[] = CANONICAL_FAILURE_EXHIBITS,
): FailureExhibit[] {
  return exhibits.filter((e) => e.publicationStatus === "published");
}
