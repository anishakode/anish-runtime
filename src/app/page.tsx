import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { HomeRuntime } from "@/components/home-runtime";
import { getEvidenceStats, loadEvidenceGraph } from "@/lib/evidence/load-graph";
import { deriveCapabilities, flagshipSummaries } from "@/lib/home/runtime-model";

export default function HomePage() {
  const graph = loadEvidenceGraph();
  const { profile } = graph;
  const stats = getEvidenceStats(graph);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--surface)] text-[var(--on-surface)]">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-start px-6 py-16"
      >
        <HomeRuntime
          name={profile.name}
          positioning={profile.positioning}
          proposition={profile.proposition}
          tagline={profile.tagline}
          stats={{
            nodes: stats.nodes,
            projects: stats.projects,
            sources: stats.sources,
            edges: stats.edges,
            byTier: stats.byTier,
          }}
          capabilities={deriveCapabilities(graph)}
          flagships={flagshipSummaries(graph)}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
