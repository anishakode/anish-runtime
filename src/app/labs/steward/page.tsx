import Link from "next/link";
import { StewardLab } from "@/components/labs/steward-lab";
import { PageShell } from "@/components/page-shell";
import { STEWARD_SOURCE_TRACE } from "@/lib/steward/evidence";

export const metadata = {
  title: "Steward Agent Lab",
  alternates: { canonical: "/labs/steward" },
  description:
    "Deterministic Steward Agent Lab — PORTFOLIO_EXTENSION with synthetic FHIR-shaped context, tool states, and withheld treatment advice.",
};

export default function StewardLabPage() {
  return (
    <PageShell
      title="Steward Agent Lab"
      description="Inspect deterministic stewardship tool states on synthetic context. Not medical advice. No live FHIR, Gemini, or MCP — FHIR Task is dry-run preview only."
    >
      <p className="mb-8 text-sm text-[var(--muted)]">
        Optional enhancement for{" "}
        <Link
          href={`/work/${STEWARD_SOURCE_TRACE.projectSlug}`}
          className="underline underline-offset-4"
        >
          Steward_AI
        </Link>
        . Open{" "}
        <Link
          href={`/work/${STEWARD_SOURCE_TRACE.projectSlug}#project-autopsy`}
          className="underline underline-offset-4"
        >
          Project Autopsy
        </Link>{" "}
        or the{" "}
        <Link
          href={`/work/${STEWARD_SOURCE_TRACE.projectSlug}#steward-lab`}
          className="underline underline-offset-4"
        >
          RUN lens
        </Link>{" "}
        without treating this lab as a clinical system. Recruiter Work / Experience / CV
        paths do not require this lab.
      </p>
      <StewardLab />
    </PageShell>
  );
}
