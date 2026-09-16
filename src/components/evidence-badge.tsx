import type { EvidenceState } from "@/lib/evidence/schema";
import { evidenceStateLabel } from "@/lib/evidence/format";

const TONE: Record<EvidenceState, string> = {
  PUBLIC_CODE_VERIFIED:
    "border-[var(--state-verified-code-border)] bg-[var(--state-verified-code-bg)] text-[var(--state-verified-code-fg)]",
  PUBLIC_DOCUMENT_VERIFIED:
    "border-[var(--state-verified-doc-border)] bg-[var(--state-verified-doc-bg)] text-[var(--state-verified-doc-fg)]",
  OWNER_CONFIRMED_PROFESSIONAL:
    "border-[var(--state-owner-confirmed-border)] bg-[var(--state-owner-confirmed-bg)] text-[var(--state-owner-confirmed-fg)]",
  RESUME_DOCUMENTED:
    "border-[var(--state-resume-border)] bg-[var(--state-resume-bg)] text-[var(--state-resume-fg)]",
  PRIOR_PROJECT_CONTEXT:
    "border-[var(--state-prior-border)] bg-[var(--state-prior-bg)] text-[var(--state-prior-fg)]",
  PORTFOLIO_EXTENSION:
    "border-[var(--state-extension-border)] bg-[var(--state-extension-bg)] text-[var(--state-extension-fg)]",
  LIMITED_EVIDENCE:
    "border-[var(--state-limited-border)] bg-[var(--state-limited-bg)] text-[var(--state-limited-fg)]",
  NOT_DEMONSTRATED:
    "border-[var(--state-not-demonstrated-border)] bg-[var(--state-not-demonstrated-bg)] text-[var(--state-not-demonstrated-fg)]",
};

export function EvidenceBadge({ state }: { state: EvidenceState }) {
  return (
    <span className={`evidence-badge ${TONE[state]}`} data-evidence-state={state}>
      {evidenceStateLabel(state)}
    </span>
  );
}
