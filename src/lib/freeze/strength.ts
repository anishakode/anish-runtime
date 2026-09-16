import { EVIDENCE_STATES, type EvidenceState } from "@/lib/evidence/states";

/**
 * Evidence strength ranking (M25).
 *
 * Rank 1 is the strongest claim a visitor can check for themselves. The order
 * mirrors `EVIDENCE_STATES`, but it is written out explicitly rather than derived
 * from array position: a freeze rule that decides whether a claim got stronger
 * must be reviewable on its own terms, not dependent on the order of a list that
 * exists for another purpose.
 *
 * `PORTFOLIO_EXTENSION` is a boundary label rather than a strength tier — it marks
 * a deterministic local reconstruction. It sits below résumé-documented because
 * moving a claim *to* it is an honest weakening, while moving *from* it up to a
 * verified state is exactly the strengthening this milestone exists to catch.
 */
export const EVIDENCE_STRENGTH: Record<EvidenceState, number> = {
  PUBLIC_CODE_VERIFIED: 1,
  PUBLIC_DOCUMENT_VERIFIED: 2,
  OWNER_CONFIRMED_PROFESSIONAL: 3,
  RESUME_DOCUMENTED: 4,
  PRIOR_PROJECT_CONTEXT: 5,
  PORTFOLIO_EXTENSION: 6,
  LIMITED_EVIDENCE: 7,
  NOT_DEMONSTRATED: 8,
};

/** Fails the build if a new state is added without being ranked. */
export function assertStrengthCoversAllStates(): void {
  const unranked = EVIDENCE_STATES.filter((state) => !(state in EVIDENCE_STRENGTH));
  if (unranked.length > 0) {
    throw new Error(`Evidence states missing a strength rank: ${unranked.join(", ")}`);
  }
}

/** True when `next` claims more than `previous` — the direction that needs evidence. */
export function isStrengthening(previous: EvidenceState, next: EvidenceState): boolean {
  return EVIDENCE_STRENGTH[next] < EVIDENCE_STRENGTH[previous];
}
