import type { EvidenceGraph } from "@/lib/evidence/schema";

/**
 * Two presets, because there were three and two of them were the same.
 *
 * `2min` and `explore` both showed three flagships and the constellation and
 * both sent the visitor to /work; they differed only in compile dwell and in
 * whether the button read "View work" or "Browse all work". M4-PRELOCK-AUDIT
 * recorded that as "copy implies richer differentiation than shipped" and it
 * went unfixed. A preset picker whose whole value is honestly respecting the
 * reader's time cannot itself offer a choice that is not one.
 */
export type JourneyMode = "20s" | "2min";

export type RuntimePhase = "idle" | "compiling" | "ready";

export const JOURNEY_OPTIONS = [
  {
    id: "20s" as const,
    label: "20 SEC",
    description: "Fast path — one flagship proof, then CV or contact.",
  },
  {
    id: "2min" as const,
    label: "2 MIN",
    description: "Recommended — compile, then inspect all flagships.",
    recommended: true,
  },
] as const;

export const DEFAULT_JOURNEY: JourneyMode = "2min";

export const COMPILATION_STEPS = [
  { id: "identity", label: "Identity located" },
  { id: "capabilities", label: "Capabilities mapped" },
  { id: "evidence", label: "Evidence attached" },
  { id: "projects", label: "Projects connected" },
] as const;

export type CompilationStepId = (typeof COMPILATION_STEPS)[number]["id"];

/** Per-step dwell before advancing. Reduced motion callers should skip the sequence. */
export function stepDurationMs(mode: JourneyMode): number {
  switch (mode) {
    case "20s":
      return 280;
    case "2min":
      return 650;
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export function journeyLabel(mode: JourneyMode): string {
  return JOURNEY_OPTIONS.find((o) => o.id === mode)?.label ?? mode;
}

/**
 * Settled-runtime layout differs by journey — still graph-backed, no invented claims.
 * 20 SEC emphasizes a single flagship + CV; 2 MIN shows the fuller surface.
 */
export function settledJourneyPlan(mode: JourneyMode) {
  switch (mode) {
    case "20s":
      return {
        guidance: "Fast path — one flagship proof, then CV or contact.",
        flagshipLimit: 1,
        showConstellation: false,
        primaryHref: "/cv" as const,
        primaryLabel: "CV",
      };
    case "2min":
      return {
        guidance: "Recommended path — inspect flagships, then open Work.",
        flagshipLimit: 3,
        showConstellation: true,
        primaryHref: "/work" as const,
        primaryLabel: "View work",
      };
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

/**
 * Derive a small capability set from profile positioning + flagship themes.
 * Never invents skills outside the Evidence Graph.
 */
export function deriveCapabilities(
  graph: Pick<EvidenceGraph, "profile" | "projects">,
  limit = 8,
): string[] {
  const fromPositioning = graph.profile.positioning
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  const themeHits = new Map<string, number>();
  for (const project of graph.projects.filter((p) => p.tier === "flagship")) {
    for (const theme of project.themes) {
      const key = theme.trim();
      if (!key) continue;
      themeHits.set(key, (themeHits.get(key) ?? 0) + 1);
    }
  }

  const fromThemes = [...themeHits.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([theme]) => theme);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of [...fromPositioning, ...fromThemes]) {
    const normalized = item.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

export function flagshipSummaries(graph: Pick<EvidenceGraph, "projects">) {
  return graph.projects
    .filter((p) => p.tier === "flagship")
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      evidenceState: p.evidenceState,
    }));
}
