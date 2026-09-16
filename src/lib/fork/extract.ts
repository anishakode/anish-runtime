/**
 * Deterministic JD requirement extraction (M20).
 * No LLM — phrase/bullet heuristics only. Optional model extraction deferred.
 */

import { normalizeSearchText } from "@/lib/search";

const BULLET = /^\s*[-*•·]\s+(.+)$/;
const REQUIREMENTS_HEADER =
  /^(requirements?|qualifications?|what you.ll (need|bring)|must[- ]have|skills?|you (have|bring)|about you)\b/i;
const ROLE_TITLE = /^(job\s*title|role|position)\s*[:\-–]\s*(.+)$/i;

const NOISE =
  /^(we are|we're|about (us|the)|benefits?|perks?|equal opportunity|nice to have|preferred)\b/i;

export type ExtractedRequirement = {
  id: string;
  text: string;
  source: "bullet" | "line" | "skill_token";
};

export type ExtractionResult = {
  roleLabel: string;
  roleSlug: string;
  requirements: ExtractedRequirement[];
};

function slugify(input: string): string {
  const slug = normalizeSearchText(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return slug || "role";
}

function requirementId(text: string, index: number): string {
  const base = normalizeSearchText(text).replace(/\s+/g, "-").slice(0, 40);
  return `req-${index}-${base || "item"}`;
}

/**
 * Extract role label + deduplicated requirements from sanitized JD text.
 */
export function extractRequirements(sanitizedJd: string): ExtractionResult {
  const lines = sanitizedJd
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let roleLabel = "Untitled role";
  let inRequirements = false;
  const raw: { text: string; source: ExtractedRequirement["source"] }[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const titleMatch = line.match(ROLE_TITLE);
    if (titleMatch?.[2]) {
      roleLabel = titleMatch[2].trim();
      continue;
    }
    if (
      i === 0 &&
      line.length < 80 &&
      !REQUIREMENTS_HEADER.test(line) &&
      !BULLET.test(line)
    ) {
      // First short line often is the role title
      if (!/^(job description|about the role)$/i.test(line)) {
        roleLabel = line;
      }
    }
    if (REQUIREMENTS_HEADER.test(line)) {
      inRequirements = true;
      continue;
    }
    if (NOISE.test(line) && !BULLET.test(line)) {
      inRequirements = false;
      continue;
    }

    const bullet = line.match(BULLET);
    if (bullet?.[1]) {
      const text = bullet[1].trim();
      if (text.length >= 4) raw.push({ text, source: "bullet" });
      continue;
    }

    if (inRequirements && line.length >= 8 && line.length <= 200) {
      raw.push({ text: line.replace(/^[\d.)]+\s*/, ""), source: "line" });
    }
  }

  // Fallback: pull skill-like tokens if almost nothing extracted
  if (raw.length === 0) {
    const tokens = sanitizedJd.match(
      /\b(Python|TypeScript|JavaScript|React|Next\.?js|AWS|SQL|MLOps|PSI|KS|FHIR|MCP|Docker|Kubernetes|Java|Spring|REST|API|observability|monitoring|drift|explainability)\b/gi,
    );
    const unique = [...new Set((tokens ?? []).map((t) => t.trim()))];
    for (const text of unique.slice(0, 12)) {
      raw.push({ text, source: "skill_token" });
    }
  }

  const seen = new Set<string>();
  const requirements: ExtractedRequirement[] = [];
  for (const item of raw) {
    const key = normalizeSearchText(item.text);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    requirements.push({
      id: requirementId(item.text, requirements.length),
      text: item.text.slice(0, 240),
      source: item.source,
    });
    if (requirements.length >= 24) break;
  }

  return {
    roleLabel,
    roleSlug: slugify(roleLabel),
    requirements,
  };
}
