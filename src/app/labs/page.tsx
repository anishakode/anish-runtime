import Link from "next/link";
import { EvidenceBadge } from "@/components/evidence-badge";
import { PageShell } from "@/components/page-shell";
import { buildRuntimeLabViews } from "@/lib/labs/catalog";

export const metadata = {
  title: "Runtime Labs",
  alternates: { canonical: "/labs" },
  description:
    "Three deterministic Runtime Labs you can operate in the browser — real local math, PORTFOLIO_EXTENSION labeled, no production telemetry.",
};

export default function LabsPage() {
  const labs = buildRuntimeLabViews();

  return (
    <PageShell
      title="Runtime Labs"
      description="The part of this portfolio you run rather than read. Each lab computes real math locally from inputs you control — and each is labeled for exactly what it is, so nothing here is mistaken for production infrastructure."
    >
      <ul className="space-y-4" aria-label="Runtime Labs">
        {labs.map((lab) => (
          <li
            key={lab.itemId}
            className="border border-[var(--stroke)] p-4 transition-colors hover:border-[var(--on-surface)] sm:p-5"
          >
            <Link href={lab.href} className="group block no-underline">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="page-title text-lg group-hover:underline group-hover:underline-offset-4">
                  {lab.label}
                </h2>
                <EvidenceBadge state={lab.evidenceState} />
              </div>
              <p className="mt-2 text-sm text-[var(--on-surface)]">{lab.action}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{lab.summary}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-[var(--muted)]">
        Every lab is an optional enhancement. The{" "}
        <Link href="/work" className="underline underline-offset-4">
          Work
        </Link>
        ,{" "}
        <Link href="/experience" className="underline underline-offset-4">
          Experience
        </Link>
        , and{" "}
        <Link href="/cv" className="underline underline-offset-4">
          CV
        </Link>{" "}
        paths carry the full professional record without running any of them.
      </p>
    </PageShell>
  );
}
