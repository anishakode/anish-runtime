/**
 * Recompile presentation ordering (M19) — relevance only; never mutates evidence.
 */

import type { SessionCategory } from "./categories";

const CATEGORY_PROJECT_PRIORITY: Record<SessionCategory, string[]> = {
  AI_ENGINEERING: [
    "steward-ai",
    "boring-ai",
    "mlops-governance-dashboard",
    "explainable-pdf-malware-detection",
  ],
  ML_ENGINEERING: [
    "mlops-governance-dashboard",
    "explainable-pdf-malware-detection",
    "fraud-detection",
    "feynn-ev-analysis",
    "age-gender-detector",
    "steward-ai",
  ],
  SOFTWARE_CLOUD: [
    "park-finder",
    "pdf-text-extraction",
    "netflix-clone",
    "mlops-governance-dashboard",
    "steward-ai",
  ],
};

const CATEGORY_CAPABILITY_PRIORITY: Record<SessionCategory, string[]> = {
  AI_ENGINEERING: ["AI", "agent workflows", "MCP", "FHIR", "A2A", "safety boundaries"],
  ML_ENGINEERING: [
    "ML",
    "MLOps",
    "data drift",
    "PSI",
    "KS",
    "monitoring",
    "explainability",
    "malware detection",
  ],
  SOFTWARE_CLOUD: ["Software Engineering", "AWS", "REST APIs", "observability", "audit"],
};

function rankByPriority<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
  priority: readonly string[],
): T[] {
  const rank = new Map(priority.map((id, i) => [id.toLowerCase(), i]));
  return [...items].sort((a, b) => {
    const ka = keyOf(a).toLowerCase();
    const kb = keyOf(b).toLowerCase();
    const ra = rank.has(ka) ? rank.get(ka)! : 1000;
    const rb = rank.has(kb) ? rank.get(kb)! : 1000;
    if (ra !== rb) return ra - rb;
    return ka.localeCompare(kb);
  });
}

export function orderProjectsByCategory<T extends { slug: string }>(
  projects: readonly T[],
  category: SessionCategory | null,
): T[] {
  if (!category) return [...projects];
  return rankByPriority(projects, (p) => p.slug, CATEGORY_PROJECT_PRIORITY[category]);
}

export function orderCapabilitiesByCategory(
  capabilities: readonly string[],
  category: SessionCategory | null,
): string[] {
  if (!category) return [...capabilities];
  return rankByPriority(capabilities, (c) => c, CATEGORY_CAPABILITY_PRIORITY[category]);
}

export function recompileBoundaryNotice(categoryLabel: string): string {
  return `Recompiled for this session around ${categoryLabel}. Presentation order changed — evidence states and canonical claims did not.`;
}
