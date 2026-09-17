"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EvidenceBadge } from "@/components/evidence-badge";
import { useRuntimeTraceOptional } from "@/components/runtime-trace/runtime-trace-context";
import { SourceTraceProvider } from "@/components/source-trace/source-trace-context";
import { SourceTraceTrigger } from "@/components/source-trace/source-trace-trigger";
import { ksLabSourceTrace, psiLabSourceTrace } from "@/lib/evidence/source-trace";
import {
  breakTheSystem,
  createIncidentRun,
  recoverIncident,
  TRACE_KIND_LABEL,
  type IncidentRun,
} from "@/lib/mlops/incident";
import {
  histogramTableRows,
  injectLabMissing,
  LAB_MISSING_RATE,
  LAB_SHIFT_DELTA,
  resetLabSession,
  shiftLabData,
} from "@/lib/mlops/lab-session";

function formatMetric(value: number | null, digits = 4): string {
  if (value === null) return "n/a";
  return value.toFixed(digits);
}

function withSession(run: IncidentRun, session: IncidentRun["session"]): IncidentRun {
  return { ...run, session, phase: run.phase === "investigating" ? "broken" : run.phase };
}

export function MlopsLab() {
  const [run, setRun] = useState<IncidentRun>(() => createIncidentRun());
  const runtimeTrace = useRuntimeTraceOptional();
  const session = run.session;
  const rows = useMemo(() => histogramTableRows(session), [session]);

  /** Only a real break carried through to recovery counts as a completed challenge. */
  function recover() {
    const wasIncident = run.monitor === "incident" || run.phase === "investigating";
    setRun((r) => recoverIncident(r));
    if (!wasIncident) return;
    runtimeTrace?.record({
      action: "CHALLENGE_COMPLETED",
      status: "OK",
      architectureStages: ["RUNTIME"],
      note: "MLOps controlled incident recovered to healthy baseline",
    });
  }

  return (
    <SourceTraceProvider>
      <div className="mlops-lab space-y-8">
        <aside
          className="border border-[var(--stroke)] bg-[var(--state-extension-bg)] p-4 text-sm text-[var(--state-extension-fg)]"
          aria-label="Evidence boundary"
        >
          <div className="mb-2 flex flex-wrap items-start gap-2">
            <EvidenceBadge state={session.evidenceState} />
            <span className="instrument-label text-xs tracking-wide">Runtime Lab</span>
          </div>
          <p>{session.boundaryNotice}</p>
        </aside>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setRun((r) => breakTheSystem(r))}
          >
            BREAK THE SYSTEM
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={run.phase !== "investigating" && run.monitor !== "incident"}
            onClick={recover}
          >
            RECOVER
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              setRun((r) => withSession(r, shiftLabData(r.session, LAB_SHIFT_DELTA)))
            }
          >
            SHIFT DATA (+{LAB_SHIFT_DELTA.toFixed(2)})
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setRun((r) => withSession(r, injectLabMissing(r.session)))}
          >
            INJECT MISSING ({Math.round(LAB_MISSING_RATE * 100)}%)
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              setRun((r) => ({
                ...createIncidentRun(r.session.seed, r.session.count),
                session: resetLabSession(r.session),
              }))
            }
          >
            RESET
          </button>
        </div>

        <p className="instrument-label text-sm text-[var(--muted)]" role="status">
          Monitor · {run.monitor} · phase {run.phase} · action {session.action} · seed{" "}
          {session.seed} · n={session.count}
          {run.alertFired ? " · simulated alert recorded" : ""}
        </p>

        <section aria-labelledby="metrics-heading" className="space-y-3">
          <h2 id="metrics-heading" className="text-lg font-semibold">
            Live metrics
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {/* dt/dd stay direct children of the cell so the definition list
                structure survives — axe rejects a dt nested one level deeper. */}
            <div className="border border-[var(--stroke)] p-3">
              <dt className="instrument-label text-xs text-[var(--muted)]">PSI</dt>
              <dd className="mt-1 flex flex-wrap items-center justify-between gap-2 font-mono text-lg">
                <span>
                  {formatMetric(session.metrics.psi)}
                  {session.metrics.psiSeverity ? (
                    <span className="ml-2 text-sm">({session.metrics.psiSeverity})</span>
                  ) : null}
                </span>
                <SourceTraceTrigger
                  trace={psiLabSourceTrace()}
                  className="btn-secondary text-xs"
                >
                  Trace PSI
                </SourceTraceTrigger>
              </dd>
              {session.metrics.psiMessage ? (
                <dd className="mt-1 text-sm text-[var(--muted)]">
                  {session.metrics.psiMessage}
                </dd>
              ) : null}
            </div>
            <div className="border border-[var(--stroke)] p-3">
              <dt className="instrument-label text-xs text-[var(--muted)]">KS D</dt>
              <dd className="mt-1 flex flex-wrap items-center justify-between gap-2 font-mono text-lg">
                <span>
                  {formatMetric(session.metrics.ksD)}
                  {session.metrics.ksSeverity ? (
                    <span className="ml-2 text-sm">({session.metrics.ksSeverity})</span>
                  ) : null}
                </span>
                <SourceTraceTrigger
                  trace={ksLabSourceTrace()}
                  className="btn-secondary text-xs"
                >
                  Trace KS
                </SourceTraceTrigger>
              </dd>
            </div>
            <div className="border border-[var(--stroke)] p-3">
              <dt className="instrument-label text-xs text-[var(--muted)]">
                Missingness
              </dt>
              <dd className="mt-1 font-mono text-lg">
                {(session.metrics.missingness.rate * 100).toFixed(1)}%
                <span className="ml-2 text-sm text-[var(--muted)]">
                  ({session.metrics.missingness.missing}/
                  {session.metrics.missingness.total})
                </span>
              </dd>
            </div>
            <div className="border border-[var(--stroke)] p-3">
              <dt className="instrument-label text-xs text-[var(--muted)]">
                Range quality [{session.metrics.range.min}, {session.metrics.range.max}]
              </dt>
              <dd className="mt-1 font-mono text-lg">
                {(session.metrics.range.rateInRange * 100).toFixed(1)}% in range
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="disagreement-heading" className="space-y-2">
          <h2 id="disagreement-heading" className="text-lg font-semibold">
            Detector disagreement lens
          </h2>
          <p
            className={
              session.metrics.detectorDisagreement
                ? "border border-[var(--state-limited-border)] bg-[var(--state-limited-bg)] p-3 text-sm text-[var(--state-limited-fg)]"
                : "border border-[var(--stroke)] p-3 text-sm text-[var(--muted)]"
            }
            role="status"
          >
            {session.metrics.detectorDisagreement
              ? `PSI severity (${session.metrics.psiSeverity}) and KS severity (${session.metrics.ksSeverity}) disagree — inspect both signals before acting.`
              : "PSI and KS severities currently agree (or one metric is unavailable)."}
          </p>
        </section>

        {run.debugSteps.length > 0 ? (
          <section aria-labelledby="debug-heading" className="space-y-3">
            <h2 id="debug-heading" className="text-lg font-semibold">
              Watch Anish Debug
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Deterministic investigation steps — ability shown, not claimed.
            </p>
            <ol className="list-none space-y-3 p-0">
              {run.debugSteps.map((step, index) => (
                <li key={step.id} className="border-l-2 border-[var(--stroke)] pl-3">
                  <p className="instrument-label text-xs text-[var(--muted)]">
                    {String(index + 1).padStart(2, "0")} · {TRACE_KIND_LABEL[step.kind]}
                  </p>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-[var(--muted)]">{step.detail}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {run.trace.length > 0 ? (
          <section aria-labelledby="trace-heading" className="space-y-3">
            <h2 id="trace-heading" className="text-lg font-semibold">
              Event trace
            </h2>
            <ul className="space-y-3">
              {[...run.trace].reverse().map((event) => (
                <li key={event.id} className="border border-[var(--stroke)] p-3 text-sm">
                  <p className="instrument-label text-xs text-[var(--muted)]">
                    t={event.atTick} · {TRACE_KIND_LABEL[event.kind]}
                  </p>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-[var(--muted)]">{event.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="histogram-heading" className="space-y-3">
          <h2 id="histogram-heading" className="text-lg font-semibold">
            Histogram table
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Accessible bin counts for reference vs current — not a Grafana panel.
          </p>
          {/* Focusable and labelled so the scroll container is reachable by keyboard. */}
          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="group"
            aria-labelledby="histogram-heading"
          >
            <table className="lab-histogram-table w-full min-w-[32rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Equal-width histogram bins comparing reference and current distributions
              </caption>
              <thead>
                <tr className="border-b border-[var(--stroke)]">
                  <th scope="col" className="px-2 py-2 font-mono text-xs">
                    Bin
                  </th>
                  <th scope="col" className="px-2 py-2 font-mono text-xs">
                    Range
                  </th>
                  <th scope="col" className="px-2 py-2 font-mono text-xs">
                    Reference count
                  </th>
                  <th scope="col" className="px-2 py-2 font-mono text-xs">
                    Current count
                  </th>
                  <th scope="col" className="px-2 py-2 font-mono text-xs">
                    Ref %
                  </th>
                  <th scope="col" className="px-2 py-2 font-mono text-xs">
                    Cur %
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--stroke)]">
                    <th scope="row" className="px-2 py-2 font-mono">
                      {row.index}
                    </th>
                    <td className="px-2 py-2 font-mono text-[var(--muted)]">
                      [{row.start.toFixed(2)}, {row.end.toFixed(2)})
                    </td>
                    <td className="px-2 py-2 font-mono">{row.referenceCount}</td>
                    <td className="px-2 py-2 font-mono">{row.currentCount}</td>
                    <td className="px-2 py-2 font-mono">
                      {(row.referenceProportion * 100).toFixed(1)}
                    </td>
                    <td className="px-2 py-2 font-mono">
                      {(row.currentProportion * 100).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="source-trace-heading" className="space-y-3">
          <h2 id="source-trace-heading" className="text-lg font-semibold">
            Source Trace
          </h2>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>
              PSI ←{" "}
              <a
                className="underline underline-offset-4"
                href={`https://github.com/anishakode/MLOps-Governance-Dashboard/blob/${session.sourceTrace.commitSha}/${session.sourceTrace.psiSourcePath}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {session.sourceTrace.psiSourcePath}
              </a>{" "}
              <span className="font-mono text-xs">
                @{session.sourceTrace.commitSha.slice(0, 7)}
              </span>
            </li>
            <li>
              KS ←{" "}
              <a
                className="underline underline-offset-4"
                href={`https://github.com/anishakode/MLOps-Governance-Dashboard/blob/${session.sourceTrace.commitSha}/${session.sourceTrace.ksSourcePath}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {session.sourceTrace.ksSourcePath}
              </a>{" "}
              <span className="font-mono text-xs">
                @{session.sourceTrace.commitSha.slice(0, 7)}
              </span>
            </li>
            <li>
              Project evidence:{" "}
              <Link
                href={`/work/${session.sourceTrace.projectSlug}`}
                className="underline underline-offset-4"
              >
                /work/{session.sourceTrace.projectSlug}
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </SourceTraceProvider>
  );
}
