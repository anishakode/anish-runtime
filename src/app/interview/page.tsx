import { InterviewMyWork } from "@/components/interview/interview-my-work";
import { PageShell } from "@/components/page-shell";
import { buildInterviewCatalog } from "@/lib/interview/resolve";
import { NOINDEX_METADATA } from "@/lib/seo/routes";

export const metadata = {
  title: "Interview My Work",
  description:
    "Turn the evidence you inspected into technical questions for Anish. No answer key, no candidate score.",
  ...NOINDEX_METADATA,
};

export default function InterviewPage() {
  const catalog = buildInterviewCatalog();

  return (
    <PageShell
      title="Interview my work"
      description="Don't let my portfolio answer for me. Let it tell you what to ask me. Questions come from the canonical evidence you inspected — never from a model's opinion."
    >
      <InterviewMyWork catalog={catalog} />
    </PageShell>
  );
}
