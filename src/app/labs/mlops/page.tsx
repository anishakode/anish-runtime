import Link from "next/link";
import { MlopsLab } from "@/components/labs/mlops-lab";
import { PageShell } from "@/components/page-shell";
import { MLOPS_SOURCE_TRACE } from "@/lib/mlops/evidence";

export const metadata = {
  title: "MLOps Runtime Lab",
  alternates: { canonical: "/labs/mlops" },
  description:
    "Deterministic PSI/KS Runtime Lab — PORTFOLIO_EXTENSION grounded in public MLOps Governance Dashboard evidence.",
};

export default function MlopsLabPage() {
  return (
    <PageShell
      title="MLOps Runtime Lab"
      description="Break a controlled system, watch deterministic investigation, and recover — real local PSI/KS math with honest PORTFOLIO_EXTENSION labeling. No fabricated Grafana or production telemetry."
    >
      <p className="mb-8 text-sm text-[var(--muted)]">
        Optional enhancement for{" "}
        <Link
          href={`/work/${MLOPS_SOURCE_TRACE.projectSlug}`}
          className="underline underline-offset-4"
        >
          MLOps Governance Dashboard
        </Link>
        . Inspect{" "}
        <Link
          href={`/work/${MLOPS_SOURCE_TRACE.projectSlug}#project-autopsy`}
          className="underline underline-offset-4"
        >
          Project Autopsy
        </Link>
        ,{" "}
        <Link
          href={`/work/${MLOPS_SOURCE_TRACE.projectSlug}#project-xray`}
          className="underline underline-offset-4"
        >
          Project X-Ray
        </Link>
        , or{" "}
        <Link
          href={`/work/${MLOPS_SOURCE_TRACE.projectSlug}#reversible-architecture`}
          className="underline underline-offset-4"
        >
          Reversible Architecture
        </Link>{" "}
        without treating this lab as production infrastructure. Recruiter Work /
        Experience / CV paths do not require this lab.
      </p>
      <MlopsLab />
    </PageShell>
  );
}
