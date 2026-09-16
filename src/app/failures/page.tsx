import { FailureMuseum } from "@/components/failures/failure-museum";
import { PageShell } from "@/components/page-shell";
import { getFailureMuseum } from "@/lib/failures";

export const metadata = {
  title: "Failure Museum",
  alternates: { canonical: "/failures" },
  description:
    "Artifact-gated Failure Museum — empty until proof exists. No fabricated failure stories.",
};

export default function FailuresPage() {
  const museum = getFailureMuseum();

  return (
    <PageShell
      title="Failure Museum"
      description="Failures appear only with artifact-grade proof. An empty truthful museum is preferred over a compelling fabricated story."
    >
      <p className="mb-8 text-sm text-[var(--muted)]">
        Optional evidence surface. Recruiter Work / Experience / About / CV / Contact
        paths do not require this museum. Autopsy FAILURES lenses link here.
      </p>
      <FailureMuseum museum={museum} hideMuseumLink />
    </PageShell>
  );
}
