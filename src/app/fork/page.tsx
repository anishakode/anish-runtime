import { ForkAnish } from "@/components/fork/fork-anish";
import { PageShell } from "@/components/page-shell";
import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex } from "@/lib/search";
import { NOINDEX_METADATA } from "@/lib/seo/routes";

export const metadata = {
  title: "Fork Anish",
  description:
    "Map a job description to a temporary evidence branch — no fit score, gaps stay visible.",
  ...NOINDEX_METADATA,
};

export default function ForkPage() {
  const documents = buildSearchIndex(getGraph());

  return (
    <PageShell
      title="Fork Anish"
      description="Paste a role. RUNTIME forks a temporary evidence branch from the canonical graph — what can and cannot be demonstrated. No candidate score."
    >
      <ForkAnish documents={documents} />
    </PageShell>
  );
}
