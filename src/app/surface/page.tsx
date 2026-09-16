import { PageShell } from "@/components/page-shell";
import { UnderTheSurface } from "@/components/surface/under-the-surface";
import { NOINDEX_METADATA } from "@/lib/seo/routes";

export const metadata = {
  title: "Under the Surface",
  description:
    "The five layers behind this portfolio, each labelled real runtime, portfolio simulation, optional provider, or build-time system.",
  ...NOINDEX_METADATA,
};

export default function SurfacePage() {
  return (
    <PageShell
      title="Under the surface"
      description="You've inspected my work. Now inspect the system that showed it to you — with every subsystem labelled for what it actually is."
    >
      <UnderTheSurface />
    </PageShell>
  );
}
