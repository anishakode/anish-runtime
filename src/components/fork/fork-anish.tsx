"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EvidenceBadge } from "@/components/evidence-badge";
import { FORK_HONESTY_LINE, forkFromJobDescription, type ForkBranch } from "@/lib/fork";
import type { SearchDocument } from "@/lib/search";
import { useRuntimeTraceOptional } from "@/components/runtime-trace/runtime-trace-context";
const SAMPLE_JD = `MLOps Engineer
Role: MLOps Engineer

Requirements:
- Experience with model monitoring and data drift (PSI/KS)
- Python and AWS for cloud data pipelines
- Observability and alerting for ML systems
- Familiarity with healthcare AI stewardship or FHIR (nice to have)
- Production Kubernetes cluster ownership for 10 years
`;

type ForkAnishProps = {
  documents: SearchDocument[];
};

export function ForkAnish({ documents }: ForkAnishProps) {
  const runtimeTrace = useRuntimeTraceOptional();
  const [jd, setJd] = useState("");
  const [branch, setBranch] = useState<ForkBranch | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    if (!branch) return [];
    const order = ["VERIFIED", "PROFESSIONAL", "LIMITED", "NOT_DEMONSTRATED"] as const;
    return [...branch.requirements].sort(
      (a, b) => order.indexOf(a.classification) - order.indexOf(b.classification),
    );
  }, [branch]);

  function runFork(raw: string) {
    const text = raw.trim();
    if (!text) {
      setError("Paste a job description to fork a temporary evidence branch.");
      setBranch(null);
      return;
    }
    setError(null);
    const result = forkFromJobDescription(text, documents);
    setBranch(result);
    // No session item is recorded here on purpose. Forking is not a visit to a
    // route and reveals no topic interest, so manufacturing one would inflate
    // the M19 Recompile heuristic and render on /ending as a journey node the
    // visitor never opened — on the same page that publishes
    // "fabricated interactions: 0". The fork is recorded below as a runtime
    // action, which is what actually happened.
    // Counts only — the pasted job description never reaches the trace.
    runtimeTrace?.record({
      action: "FORK_BRANCH",
      status: result.requirements.length === 0 ? "GAP" : "OK",
      evidenceCount: result.requirements.filter((r) => r.evidence !== null).length,
      architectureStages: ["INTERFACE", "TRUTH"],
      note: `${result.requirements.length} requirements · ${result.counts.NOT_DEMONSTRATED} not demonstrated`,
    });
  }

  function clearBranch() {
    setBranch(null);
    setJd("");
    setError(null);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3" aria-labelledby="fork-input-heading">
        <h2 id="fork-input-heading" className="text-lg font-semibold">
          Paste a role
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Temporary branch only. No fit score. No hiring recommendation. Job text is not
          stored.
        </p>
        <label className="block text-sm" htmlFor="fork-jd">
          Job description
          <textarea
            id="fork-jd"
            className="ask-runtime-input mt-2 min-h-40 w-full font-mono text-sm"
            value={jd}
            onChange={(event) => setJd(event.target.value)}
            placeholder="Paste a JD — requirements bullets work best"
            spellCheck={false}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() => runFork(jd)}
          >
            FORK ANISH
          </button>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => {
              setJd(SAMPLE_JD);
              runFork(SAMPLE_JD);
            }}
          >
            Try sample MLOps JD
          </button>
          {branch ? (
            <button type="button" className="btn-secondary text-xs" onClick={clearBranch}>
              Clear branch
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="text-sm text-[var(--muted)]" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {branch ? (
        <section className="space-y-6" aria-label="Fork role branch">
          <div className="border border-[var(--stroke)] p-4">
            <p className="eyebrow">Temporary evidence branch</p>
            <p className="mt-1 font-mono text-sm">{branch.branchRef}</p>
            <h3 className="mt-3 text-xl font-semibold">{branch.roleLabel}</h3>
            <p className="mt-2 text-sm font-medium text-[var(--on-surface)]">
              {FORK_HONESTY_LINE}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Sensitive lines removed: {branch.removedSensitiveLines}
              {branch.truncated ? " · JD truncated for size" : ""}
            </p>
            <ul className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
              <li>VERIFIED {branch.counts.VERIFIED}</li>
              <li>PROFESSIONAL {branch.counts.PROFESSIONAL}</li>
              <li>LIMITED {branch.counts.LIMITED}</li>
              <li>NOT DEMONSTRATED {branch.counts.NOT_DEMONSTRATED}</li>
            </ul>
          </div>

          <div
            className="border border-[var(--stroke)] p-4"
            aria-label="Integrity manifest"
          >
            <h3 className="text-sm font-semibold">Integrity manifest</h3>
            <ul className="mt-2 space-y-1 font-mono text-xs text-[var(--muted)]">
              <li>
                historical claims changed: {branch.integrity.historicalClaimsChanged}
              </li>
              <li>evidence states changed: {branch.integrity.evidenceStatesChanged}</li>
              <li>overall fit score: {branch.integrity.overallFitScore}</li>
              <li>
                job-description persistence: {branch.integrity.jobDescriptionPersistence}
              </li>
              <li>branch persistence: {branch.integrity.branchPersistence}</li>
            </ul>
          </div>

          {sorted.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No requirements could be extracted. Try bullets under a Requirements
              heading.
            </p>
          ) : (
            <ul className="space-y-4" aria-label="Requirement classifications">
              {sorted.map((req) => (
                <li key={req.requirementId} className="border border-[var(--stroke)] p-4">
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="instrument-label text-xs tracking-wide">
                      {req.classification.replaceAll("_", " ")}
                    </span>
                    <span className="instrument-label text-xs text-[var(--muted)]">
                      {req.matchPath}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-[var(--on-surface)]">
                    {req.requirementText}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{req.note}</p>
                  {req.evidence ? (
                    <div className="mt-3 space-y-1">
                      <EvidenceBadge state={req.evidence.evidenceState} />
                      <p>
                        <Link
                          href={req.evidence.href}
                          className="text-sm underline underline-offset-4"
                        >
                          {req.evidence.title}
                        </Link>
                      </p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
