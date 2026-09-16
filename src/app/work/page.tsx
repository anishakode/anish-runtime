import { PageShell } from "@/components/page-shell";
import { WorkIndex } from "@/components/work/work-index";
import { getProjectsByTier } from "@/lib/evidence/queries";

export const metadata = {
  title: "Work",
  alternates: { canonical: "/work" },
  description: "Projects from the canonical Evidence Graph, tiered by portfolio role.",
};

export default function WorkPage() {
  const { flagship, supporting, archive } = getProjectsByTier();

  return (
    <PageShell
      title="Work"
      description="Projects are tiered on purpose. Flagships carry deep evidence; supporting and archive show breadth and evolution."
    >
      <WorkIndex flagship={flagship} supporting={supporting} archive={archive} />
    </PageShell>
  );
}
