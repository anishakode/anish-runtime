import { EvidenceBadge } from "@/components/evidence-badge";
import { EVIDENCE_STATES, type EvidenceState } from "@/lib/evidence/states";

export const EVIDENCE_LEGEND: ReadonlyArray<{
  state: EvidenceState;
  meaning: string;
}> = [
  {
    state: "PUBLIC_CODE_VERIFIED",
    meaning: "Claim backed by public code at a fingerprinted revision.",
  },
  {
    state: "PUBLIC_DOCUMENT_VERIFIED",
    meaning: "Claim backed by a public document or report.",
  },
  {
    state: "OWNER_CONFIRMED_PROFESSIONAL",
    meaning:
      "Professional impact confirmed by Anish; proprietary code may not be public.",
  },
  {
    state: "RESUME_DOCUMENTED",
    meaning: "Documented on the canonical résumé / profile record.",
  },
  {
    state: "PRIOR_PROJECT_CONTEXT",
    meaning: "Earlier project context; treat as background, not fresh proof.",
  },
  {
    state: "PORTFOLIO_EXTENSION",
    meaning:
      "Portfolio-built demonstration grounded in verified concepts — not original production runtime.",
  },
  {
    state: "LIMITED_EVIDENCE",
    meaning: "Partial public verification; do not upgrade the claim.",
  },
  {
    state: "NOT_DEMONSTRATED",
    meaning: "Honest gap — not shown yet (empty museum preferred to fiction).",
  },
];

/** All schema states must appear in the legend (no silent gaps). */
export const LEGEND_STATES = EVIDENCE_LEGEND.map((i) => i.state);

export function EvidenceLegend() {
  return (
    <details className="evidence-legend no-print">
      <summary>Evidence state legend</summary>
      <ul>
        {EVIDENCE_LEGEND.map((item) => (
          <li key={item.state} className="flex flex-wrap items-start gap-3 text-sm">
            <EvidenceBadge state={item.state} />
            <span className="min-w-[12rem] flex-1 text-[var(--muted)]">
              {item.meaning}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Used by tests to prove legend covers the full EvidenceState enum. */
export function legendCoversAllEvidenceStates(): boolean {
  return EVIDENCE_STATES.every((state) => LEGEND_STATES.includes(state));
}
