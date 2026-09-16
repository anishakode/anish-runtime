import { EndingSignalView } from "@/components/ending/ending-signal-view";
import { PageShell } from "@/components/page-shell";
import { getGraph, getProfile } from "@/lib/evidence/queries";
import { buildJourneyCatalog } from "@/lib/ending/catalog";
import { NOINDEX_METADATA } from "@/lib/seo/routes";

export const metadata = {
  title: "Ending Signal",
  description:
    "A replay of the canonical evidence you opened in this session — no profile, no inference, no tracking.",
  ...NOINDEX_METADATA,
};

export default function EndingPage() {
  const graph = getGraph();
  const profile = getProfile(graph);

  return (
    <PageShell
      title="Ending signal"
      description="What this session actually did, read back from the evidence you opened and the actions you ran. Nothing is stored, and nothing is inferred about you."
    >
      <EndingSignalView
        catalog={buildJourneyCatalog(graph)}
        contact={{
          email: profile.email,
          github: profile.links.github,
          linkedin: profile.links.linkedin,
        }}
      />
    </PageShell>
  );
}
