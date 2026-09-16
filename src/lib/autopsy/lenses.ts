import type { EvidenceState } from "@/lib/evidence/schema";
import type { TraceSourceView } from "@/lib/evidence/source-trace";

export const AUTOPSY_LENS_IDS = [
  "story",
  "run",
  "xray",
  "decisions",
  "failures",
  "evidence",
] as const;

export type AutopsyLensId = (typeof AUTOPSY_LENS_IDS)[number];

export const AUTOPSY_LENS_LABEL: Record<AutopsyLensId, string> = {
  story: "STORY",
  run: "RUN",
  xray: "X-RAY",
  decisions: "DECISIONS",
  failures: "FAILURES",
  evidence: "EVIDENCE",
};

export const DEFAULT_AUTOPSY_LENS: AutopsyLensId = "story";

export function isAutopsyLensId(value: string): value is AutopsyLensId {
  return (AUTOPSY_LENS_IDS as readonly string[]).includes(value);
}

export function parseAutopsyLensId(
  value: string | null | undefined,
  fallback: AutopsyLensId = DEFAULT_AUTOPSY_LENS,
): AutopsyLensId {
  if (value && isAutopsyLensId(value)) return value;
  return fallback;
}

/**
 * Map URL hash fragments to Autopsy lenses so deep links open the right panel.
 * `#project-autopsy` alone keeps the default STORY lens (scroll target).
 */
export function autopsyLensFromHash(
  hash: string | null | undefined,
): AutopsyLensId | null {
  const raw = (hash ?? "").replace(/^#/, "").trim().toLowerCase();
  if (!raw || raw === "project-autopsy") return null;
  if (
    raw === "project-xray" ||
    raw === "reversible-architecture" ||
    raw === "autopsy-panel-xray"
  ) {
    return "xray";
  }
  if (raw === "autopsy-decisions" || raw === "autopsy-panel-decisions") {
    return "decisions";
  }
  if (
    raw === "autopsy-panel-run" ||
    raw === "mlops-lab" ||
    raw === "steward-lab" ||
    raw === "malware-lab"
  ) {
    return "run";
  }
  if (raw === "autopsy-panel-failures" || raw === "failure-museum") return "failures";
  if (raw === "autopsy-panel-evidence" || raw === "evidence-heading") return "evidence";
  if (raw === "autopsy-panel-story") return "story";
  if (isAutopsyLensId(raw)) return raw;
  return null;
}

export type AutopsyDecision = {
  id: string;
  title: string;
  detail: string;
  evidenceState: EvidenceState;
  sourceIds: string[];
  sources: TraceSourceView[];
};

export type AutopsyFailuresView = {
  empty: true;
  nodeId: string;
  title: string;
  summary: string;
  state: EvidenceState;
};

export type AutopsyStoryView = {
  title: string;
  summary: string;
  themes: string[];
  evidenceState: EvidenceState;
};

export type AutopsyProjectBundle = {
  projectSlug: string;
  story: AutopsyStoryView;
  decisions: AutopsyDecision[];
  failures: AutopsyFailuresView;
};
