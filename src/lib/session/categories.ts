/**
 * Session interest categories (M19) — presentation relevance only, not truth.
 */

export const SESSION_CATEGORIES = [
  "AI_ENGINEERING",
  "ML_ENGINEERING",
  "SOFTWARE_CLOUD",
] as const;

export type SessionCategory = (typeof SESSION_CATEGORIES)[number];

export const SESSION_CATEGORY_LABEL: Record<SessionCategory, string> = {
  AI_ENGINEERING: "AI ENGINEERING",
  ML_ENGINEERING: "ML ENGINEERING",
  SOFTWARE_CLOUD: "SOFTWARE + CLOUD",
};

/** Canonical item → category. Graph-backed ids only; no invented entities. */
export const SESSION_ITEM_CATEGORY: Record<string, SessionCategory> = {
  // Flagships / labs
  "project:proj.mlops-governance": "ML_ENGINEERING",
  "project:proj.steward-ai": "AI_ENGINEERING",
  "project:proj.malware-pdf": "ML_ENGINEERING",
  "lab:mlops": "ML_ENGINEERING",
  "lab:steward": "AI_ENGINEERING",
  "lab:malware": "ML_ENGINEERING",
  // Supporting / archive
  "project:proj.boring-ai": "AI_ENGINEERING",
  "project:proj.fraud-detection": "ML_ENGINEERING",
  "project:proj.feynn-ev": "ML_ENGINEERING",
  "project:proj.age-gender": "ML_ENGINEERING",
  "project:proj.pdf-extract": "SOFTWARE_CLOUD",
  "project:proj.park-finder": "SOFTWARE_CLOUD",
  "project:proj.netflix-clone": "SOFTWARE_CLOUD",
  // Experience
  "experience:exp.cardstack": "SOFTWARE_CLOUD",
  "route:experience": "SOFTWARE_CLOUD",
  "route:cv": "SOFTWARE_CLOUD",
};

/** Slug → session item id for project pages. */
export const PROJECT_SLUG_TO_ITEM: Record<string, string> = {
  "mlops-governance-dashboard": "project:proj.mlops-governance",
  "steward-ai": "project:proj.steward-ai",
  "explainable-pdf-malware-detection": "project:proj.malware-pdf",
  "boring-ai": "project:proj.boring-ai",
  "fraud-detection": "project:proj.fraud-detection",
  "feynn-ev-analysis": "project:proj.feynn-ev",
  "age-gender-detector": "project:proj.age-gender",
  "pdf-text-extraction": "project:proj.pdf-extract",
  "park-finder": "project:proj.park-finder",
  "netflix-clone": "project:proj.netflix-clone",
};

export function categoryForItem(itemId: string): SessionCategory | null {
  return SESSION_ITEM_CATEGORY[itemId] ?? null;
}

export function itemIdForProjectSlug(slug: string): string | null {
  return PROJECT_SLUG_TO_ITEM[slug] ?? null;
}

export function itemIdForLabPath(path: string): string | null {
  if (path.startsWith("/labs/mlops")) return "lab:mlops";
  if (path.startsWith("/labs/steward")) return "lab:steward";
  if (path.startsWith("/labs/malware")) return "lab:malware";
  return null;
}
