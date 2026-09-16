/**
 * Deterministic Fork classification (M20).
 * Software owns strength — semantic-only never becomes VERIFIED.
 */

import type { EvidenceState } from "@/lib/evidence/schema";
import {
  retrieveEvidence,
  tokenize,
  type MatchKind,
  type SearchDocument,
  type SearchHit,
  type SemanticHit,
} from "@/lib/search";
import type { ExtractedRequirement } from "./extract";

export const FORK_CLASSIFICATIONS = [
  "VERIFIED",
  "PROFESSIONAL",
  "LIMITED",
  "NOT_DEMONSTRATED",
] as const;

export type ForkClassification = (typeof FORK_CLASSIFICATIONS)[number];

export type ForkEvidenceRef = {
  id: string;
  title: string;
  href: string;
  evidenceState: EvidenceState;
  matchPath: "deterministic" | "semantic";
};

export type ForkRequirementResult = {
  requirementId: string;
  requirementText: string;
  classification: ForkClassification;
  matchPath: "deterministic" | "semantic" | "none";
  evidence: ForkEvidenceRef | null;
  note: string;
};

const VERIFIED_STATES: ReadonlySet<EvidenceState> = new Set([
  "PUBLIC_CODE_VERIFIED",
  "PUBLIC_DOCUMENT_VERIFIED",
]);

const PROFESSIONAL_STATES: ReadonlySet<EvidenceState> = new Set([
  "OWNER_CONFIRMED_PROFESSIONAL",
]);

/** Typo-only hits are too weak for Fork claims. */
const STRONG_DETERMINISTIC: ReadonlySet<MatchKind> = new Set([
  "exact_title",
  "exact_alias",
  "prefix",
  "keyword",
]);

const MIN_SEMANTIC_SCORE = 0.35;

function hasTokenOverlap(query: string, embeddingText: string): boolean {
  const qTokens = tokenize(query).filter((t) => t.length >= 4);
  if (qTokens.length === 0) return false;
  const hay = new Set(tokenize(embeddingText));
  return qTokens.some((t) => hay.has(t));
}

function classifyFromState(
  state: EvidenceState,
  matchPath: "deterministic" | "semantic",
): ForkClassification {
  // Semantic-only matches cannot become VERIFIED (handoff + evidence-integrity).
  if (matchPath === "semantic") {
    return "LIMITED";
  }
  if (VERIFIED_STATES.has(state)) return "VERIFIED";
  if (PROFESSIONAL_STATES.has(state)) return "PROFESSIONAL";
  return "LIMITED";
}

function noteFor(classification: ForkClassification, matchPath: string): string {
  switch (classification) {
    case "VERIFIED":
      return "Strong public source evidence matched deterministically.";
    case "PROFESSIONAL":
      return "Owner-confirmed professional evidence matched deterministically.";
    case "LIMITED":
      return matchPath === "semantic"
        ? "Semantic relevance only — not upgraded to VERIFIED."
        : "Related or incomplete evidence; gaps remain visible.";
    case "NOT_DEMONSTRATED":
      return "No canonical evidence demonstrates this requirement.";
  }
}

function asRef(
  hit: SearchHit | SemanticHit,
  matchPath: "deterministic" | "semantic",
): ForkEvidenceRef {
  if (matchPath === "deterministic") {
    const h = hit as SearchHit;
    return {
      id: `${h.document.kind}:${h.document.id}`,
      title: h.document.title,
      href: h.document.href,
      evidenceState: h.evidenceState,
      matchPath,
    };
  }
  const h = hit as SemanticHit;
  return {
    id: h.document.canonicalId,
    title: h.document.title,
    href: h.document.href,
    evidenceState: h.evidenceState,
    matchPath,
  };
}

/** Classify one requirement against the search index. */
export function classifyRequirement(
  requirement: ExtractedRequirement,
  documents: readonly SearchDocument[],
): ForkRequirementResult {
  const retrieval = retrieveEvidence(requirement.text, documents);
  const det = retrieval.deterministic.find((h) => STRONG_DETERMINISTIC.has(h.matchKind));
  if (det) {
    const classification = classifyFromState(det.evidenceState, "deterministic");
    return {
      requirementId: requirement.id,
      requirementText: requirement.text,
      classification,
      matchPath: "deterministic",
      evidence: asRef(det, "deterministic"),
      note: noteFor(classification, "deterministic"),
    };
  }
  const sem = retrieval.semantic.find(
    (h) =>
      h.score >= MIN_SEMANTIC_SCORE &&
      hasTokenOverlap(requirement.text, h.document.embeddingText),
  );
  if (sem) {
    const classification = classifyFromState(sem.evidenceState, "semantic");
    return {
      requirementId: requirement.id,
      requirementText: requirement.text,
      classification,
      matchPath: "semantic",
      evidence: asRef(sem, "semantic"),
      note: noteFor(classification, "semantic"),
    };
  }
  return {
    requirementId: requirement.id,
    requirementText: requirement.text,
    classification: "NOT_DEMONSTRATED",
    matchPath: "none",
    evidence: null,
    note: noteFor("NOT_DEMONSTRATED", "none"),
  };
}

export function classifyRequirements(
  requirements: readonly ExtractedRequirement[],
  documents: readonly SearchDocument[],
): ForkRequirementResult[] {
  return requirements.map((req) => classifyRequirement(req, documents));
}
