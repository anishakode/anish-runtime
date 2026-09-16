/**
 * Under the Surface architecture map (M22).
 * Every subsystem carries a reality label so the portfolio cannot stage architecture theatre.
 */

export const SURFACE_LAYER_IDS = [
  "INTERFACE",
  "ORCHESTRATION",
  "TRUTH",
  "SESSION",
  "RUNTIME",
] as const;

export type SurfaceLayerId = (typeof SURFACE_LAYER_IDS)[number];

export const REALITY_LABELS = [
  "REAL_RUNTIME",
  "PORTFOLIO_SIMULATION",
  "OPTIONAL_PROVIDER",
  "BUILD_TIME_SYSTEM",
] as const;

export type RealityLabel = (typeof REALITY_LABELS)[number];

export const REALITY_LABEL_TEXT: Record<RealityLabel, string> = {
  REAL_RUNTIME: "REAL RUNTIME",
  PORTFOLIO_SIMULATION: "PORTFOLIO SIMULATION",
  OPTIONAL_PROVIDER: "OPTIONAL PROVIDER",
  BUILD_TIME_SYSTEM: "BUILD-TIME SYSTEM",
};

export const REALITY_LABEL_MEANING: Record<RealityLabel, string> = {
  REAL_RUNTIME: "Actually executing in this website right now.",
  PORTFOLIO_SIMULATION:
    "Deterministic reconstruction built for inspection — not production infrastructure.",
  OPTIONAL_PROVIDER:
    "External dependency that may be absent; the system degrades honestly.",
  BUILD_TIME_SYSTEM: "Runs during build or validation, not while you browse.",
};

export const SURFACE_ENTRY_LINE =
  "You've inspected my work. Now inspect the system that showed it to you.";

export type SurfaceSubsystem = {
  id: string;
  name: string;
  reality: RealityLabel;
  detail: string;
  /**
   * Path in this repository — the claim is checkable against the code that
   * served the page.
   *
   * `null` when the subsystem has no code here at all, which is the honest
   * answer for an unconfigured optional provider. Borrowing a neighbouring
   * file's path would pass an existence check while describing a different
   * subsystem, leaving the map precise-looking and wrong.
   */
  path: string | null;
  milestone: string;
};

export type SurfaceLayer = {
  id: SurfaceLayerId;
  label: string;
  role: string;
  subsystems: SurfaceSubsystem[];
};

export const SURFACE_LAYERS: readonly SurfaceLayer[] = [
  {
    id: "INTERFACE",
    label: "INTERFACE",
    role: "What you directly use.",
    subsystems: [
      {
        id: "sub.chrome",
        name: "Site chrome + recruiter routes",
        reality: "REAL_RUNTIME",
        detail:
          "Work, Experience, About, CV, and Contact render from the Evidence Graph with no lab, AI, or session dependency.",
        path: "src/components/site-chrome.tsx",
        milestone: "M2",
      },
      {
        id: "sub.ask-runtime",
        name: "ASK RUNTIME dialog",
        reality: "REAL_RUNTIME",
        detail:
          "A diagnostic search surface, not a chat window. Deterministic results render before any interpretation is offered.",
        path: "src/components/search/ask-runtime.tsx",
        milestone: "M15",
      },
      {
        id: "sub.autopsy",
        name: "Autopsy + X-Ray inspection chrome",
        reality: "REAL_RUNTIME",
        detail:
          "Six lenses over one project, kept mounted so lab and scrubber state survive lens switches.",
        path: "src/components/autopsy/project-autopsy.tsx",
        milestone: "M10–M11",
      },
      {
        id: "sub.composed-view",
        name: "Composed evidence view",
        reality: "REAL_RUNTIME",
        detail:
          "Renders a validated ui_plan. It accepts block types and ids, never factual copy from a planner.",
        path: "src/components/signal/composed-view.tsx",
        milestone: "M18",
      },
    ],
  },
  {
    id: "ORCHESTRATION",
    label: "ORCHESTRATION",
    role: "Signal, composer, and search coordination.",
    subsystems: [
      {
        id: "sub.signal",
        name: "Signal orchestrator",
        reality: "REAL_RUNTIME",
        detail:
          "Five allowlisted tools over a request-local session. Fetches for ids that were never exposed are rejected.",
        path: "src/lib/signal/orchestrate.ts",
        milestone: "M17",
      },
      {
        id: "sub.composer",
        name: "Adaptive evidence composer",
        reality: "REAL_RUNTIME",
        detail:
          "Validates a ui_plan and rehydrates it from the graph. An invalid plan falls back fully to text — never a partial generative UI.",
        path: "src/lib/signal/compose.ts",
        milestone: "M18",
      },
      {
        id: "sub.rank",
        name: "Deterministic search ranking",
        reality: "REAL_RUNTIME",
        detail:
          "Exact title, alias, prefix, keyword, then bounded typo tolerance — ranked before anything semantic runs.",
        path: "src/lib/search/rank.ts",
        milestone: "M15",
      },
      {
        id: "sub.semantic",
        name: "Local TF-IDF retrieval",
        reality: "REAL_RUNTIME",
        detail:
          "Vectors are derived locally from graph-backed documents. Results are labelled relevance, never proof.",
        path: "src/lib/search/semantic.ts",
        milestone: "M16",
      },
      {
        id: "sub.llm",
        name: "Hosted LLM planner",
        reality: "OPTIONAL_PROVIDER",
        detail:
          "Not configured in this deployment. Signal runs its deterministic planner instead, and says so rather than faking model output.",
        // No code here to point at. This previously carried the composer's path,
        // which existed but belonged to a different subsystem.
        path: null,
        milestone: "M17–M18",
      },
    ],
  },
  {
    id: "TRUTH",
    label: "TRUTH",
    role: "Canonical Evidence Graph and deterministic classification.",
    subsystems: [
      {
        id: "sub.graph",
        name: "Evidence Graph loader + schema",
        reality: "BUILD_TIME_SYSTEM",
        detail:
          "Zod validates referential integrity, source fingerprints, and exclusions. A broken graph fails the build, not the page.",
        path: "src/lib/evidence/schema.ts",
        milestone: "M1",
      },
      {
        id: "sub.manifest",
        name: "Public evidence manifest",
        reality: "BUILD_TIME_SYSTEM",
        detail:
          "/evidence.json is a derived projection. The repository graph stays authoritative.",
        path: "src/lib/evidence/public-manifest.ts",
        milestone: "M3.5",
      },
      {
        id: "sub.fork",
        name: "Fork classification",
        reality: "REAL_RUNTIME",
        detail:
          "Job text is sanitised, then requirements are classified against the graph. Semantic-only matches cannot reach VERIFIED.",
        path: "src/lib/fork/classify.ts",
        milestone: "M20",
      },
      {
        id: "sub.interview",
        name: "Interview catalogue binding",
        reality: "BUILD_TIME_SYSTEM",
        detail:
          "Authored questions are bound to canonical node ids at render time. Unbound questions are dropped, not improvised.",
        path: "src/lib/interview/resolve.ts",
        milestone: "M21",
      },
      {
        id: "sub.source-trace",
        name: "Source Trace resolution",
        reality: "REAL_RUNTIME",
        detail:
          "Claims resolve to repo, path, and immutable commit SHA where the evidence is GitHub-backed.",
        path: "src/lib/evidence/source-trace.ts",
        milestone: "M8",
      },
    ],
  },
  {
    id: "SESSION",
    label: "SESSION",
    role: "In-memory exploration, recompile, and runtime traces.",
    subsystems: [
      {
        id: "sub.session-trace",
        name: "Session interest trace",
        reality: "REAL_RUNTIME",
        detail:
          "Distinct canonical items only, held in memory for this tab. Repeat clicks cannot manufacture interest.",
        path: "src/lib/session/trace.ts",
        milestone: "M19",
      },
      {
        id: "sub.recompile",
        name: "Consent-gated recompile",
        reality: "REAL_RUNTIME",
        detail:
          "Reorders presentation only, and only after you press RECOMPILE. Evidence states never move.",
        path: "src/lib/session/recompile.ts",
        milestone: "M19",
      },
      {
        id: "sub.runtime-trace",
        name: "Bounded runtime trace",
        reality: "REAL_RUNTIME",
        detail:
          "The action log below. Bounded history, safe fields only, cleared when you close the tab.",
        path: "src/lib/runtime-trace/trace.ts",
        milestone: "M22",
      },
    ],
  },
  {
    id: "RUNTIME",
    label: "RUNTIME",
    role: "Labs, APIs, deterministic simulations, and execution boundaries.",
    subsystems: [
      {
        id: "sub.signal-api",
        name: "POST /api/signal/interpret",
        reality: "REAL_RUNTIME",
        detail:
          "The only server endpoint this portfolio exposes. Input is bounded and validated before orchestration.",
        path: "src/app/api/signal/interpret/route.ts",
        milestone: "M17",
      },
      {
        id: "sub.mlops-lab",
        name: "MLOps Runtime Lab",
        reality: "PORTFOLIO_SIMULATION",
        detail:
          "Real PSI, KS, and quality maths over seeded data in your browser. Not the production runtime it reconstructs.",
        path: "src/lib/mlops/lab-session.ts",
        milestone: "M5–M7",
      },
      {
        id: "sub.steward-lab",
        name: "Steward Agent Lab",
        reality: "PORTFOLIO_SIMULATION",
        detail:
          "Deterministic tool-state scenarios on synthetic FHIR-shaped context. No live FHIR, no live model, no MCP server.",
        path: "src/lib/steward/scenarios.ts",
        milestone: "M12",
      },
      {
        id: "sub.malware-lab",
        name: "PDF Malware Explainability Lab",
        reality: "PORTFOLIO_SIMULATION",
        detail:
          "Static feature reconstruction with pinned weights. No file upload, no execution, and the output is a study signal, not a verdict.",
        path: "src/lib/malware/reconstruction.ts",
        milestone: "M13",
      },
      {
        id: "sub.incident",
        name: "Break the System incident",
        reality: "PORTFOLIO_SIMULATION",
        detail:
          "A controlled shift and a labelled debug trace. Notifications are simulated and marked as such.",
        path: "src/lib/mlops/incident.ts",
        milestone: "M7",
      },
    ],
  },
];

export function getSurfaceLayer(id: SurfaceLayerId): SurfaceLayer {
  const layer = SURFACE_LAYERS.find((l) => l.id === id);
  if (!layer) throw new Error(`Unknown surface layer: ${id}`);
  return layer;
}

export function countByReality(): Record<RealityLabel, number> {
  const counts = {
    REAL_RUNTIME: 0,
    PORTFOLIO_SIMULATION: 0,
    OPTIONAL_PROVIDER: 0,
    BUILD_TIME_SYSTEM: 0,
  } satisfies Record<RealityLabel, number>;
  for (const layer of SURFACE_LAYERS) {
    for (const sub of layer.subsystems) counts[sub.reality] += 1;
  }
  return counts;
}
