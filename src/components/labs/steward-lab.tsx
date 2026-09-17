"use client";

import Link from "next/link";
import { useState } from "react";
import { EvidenceBadge } from "@/components/evidence-badge";
import { useRuntimeTraceOptional } from "@/components/runtime-trace/runtime-trace-context";
import { SourceTraceProvider } from "@/components/source-trace/source-trace-context";
import { SourceTraceTrigger } from "@/components/source-trace/source-trace-trigger";
import {
  stewardMcpLabSourceTrace,
  stewardSafetyLabSourceTrace,
} from "@/lib/evidence/source-trace";
import {
  runStewardScenario,
  STEWARD_SCENARIO_IDS,
  STEWARD_SCENARIO_LABEL,
  STEWARD_TOOL_STATE_LABEL,
  toolStateCounts,
  type StewardScenarioId,
  type StewardToolState,
} from "@/lib/steward";

function toolStateClass(state: StewardToolState): string {
  switch (state) {
    case "complete":
      return "text-[var(--state-verified-code-fg)]";
    case "warning":
      return "text-[var(--state-limited-fg)]";
    case "blocked":
      return "text-[var(--state-extension-fg)]";
    case "error":
      return "text-[var(--state-not-demonstrated-fg)]";
    default:
      return "text-[var(--muted)]";
  }
}

export function StewardLab() {
  const [scenarioId, setScenarioId] = useState<StewardScenarioId>("baseline");
  const runtimeTrace = useRuntimeTraceOptional();
  const result = runStewardScenario(scenarioId);
  const counts = toolStateCounts(result);
  const sha = result.sourceTrace.commitSha;

  /** Baseline is the resting state — only a safety scenario run through counts. */
  function selectScenario(id: StewardScenarioId) {
    setScenarioId(id);
    if (id === "baseline") return;
    const outcome = runStewardScenario(id);
    const outcomeCounts = toolStateCounts(outcome);
    runtimeTrace?.record({
      action: "CHALLENGE_COMPLETED",
      status: "OK",
      architectureStages: ["RUNTIME"],
      note: `Steward ${STEWARD_SCENARIO_LABEL[id]} run through · ${outcomeCounts.blocked} blocked · ${outcomeCounts.warning} warning`,
    });
  }

  return (
    <SourceTraceProvider>
      <div id="steward-lab" className="steward-lab space-y-8">
        <aside
          className="border border-[var(--stroke)] bg-[var(--state-extension-bg)] p-4 text-sm text-[var(--state-extension-fg)]"
          aria-label="Evidence boundary"
        >
          <div className="mb-2 flex flex-wrap items-start gap-2">
            <EvidenceBadge state={result.evidenceState} />
            <span className="instrument-label text-xs tracking-wide">Agent Lab</span>
          </div>
          <p>{result.boundaryNotice}</p>
        </aside>

        <div
          role="radiogroup"
          aria-label="Steward scenarios"
          className="flex flex-wrap gap-2"
        >
          {STEWARD_SCENARIO_IDS.map((id) => {
            const selected = scenarioId === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? "chip chip-selected" : "chip"}
                onClick={() => selectScenario(id)}
              >
                {STEWARD_SCENARIO_LABEL[id]}
              </button>
            );
          })}
        </div>

        <section className="space-y-3" aria-label="Synthetic FHIR-shaped context">
          <h3 className="text-lg font-semibold">Synthetic context</h3>
          <p className="text-sm text-[var(--muted)]">{result.context.patientLabel}</p>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            <li>
              Active antibiotics:{" "}
              <strong>{result.context.activeAntibiotics ? "present" : "absent"}</strong>
            </li>
            <li>
              Culture results:{" "}
              <strong>{result.context.cultureResults ? "present" : "absent"}</strong>
            </li>
            <li>
              Allergies:{" "}
              <strong>{result.context.allergies ? "present" : "absent"}</strong>
            </li>
            <li>
              Renal function:{" "}
              <strong>{result.context.renalFunction ? "present" : "absent"}</strong>
            </li>
          </ul>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            {result.context.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3" aria-label="Tool workflow states">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-lg font-semibold">Tool workflow</h3>
            <SourceTraceTrigger trace={stewardMcpLabSourceTrace()}>
              Trace MCP server
            </SourceTraceTrigger>
          </div>
          <p className="text-sm text-[var(--muted)]" aria-live="polite">
            States · complete {counts.complete} · warning {counts.warning} · blocked{" "}
            {counts.blocked} · error {counts.error}
          </p>
          <table className="lab-histogram-table w-full text-left text-sm">
            <caption className="sr-only">
              Steward tool states for the selected scenario
            </caption>
            <thead>
              <tr>
                <th scope="col">Tool</th>
                <th scope="col">State</th>
                <th scope="col">Detail</th>
              </tr>
            </thead>
            <tbody>
              {result.tools.map((tool) => (
                <tr key={tool.id}>
                  <th scope="row" className="font-mono text-xs font-normal">
                    {tool.toolName}
                  </th>
                  <td className={toolStateClass(tool.state)}>
                    {STEWARD_TOOL_STATE_LABEL[tool.state]}
                  </td>
                  <td>{tool.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-3" aria-label="Runtime outcome">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-lg font-semibold">Outcome</h3>
            <SourceTraceTrigger trace={stewardSafetyLabSourceTrace()}>
              Trace safety boundary
            </SourceTraceTrigger>
          </div>
          <p className="text-sm">{result.outcomeSummary}</p>
          <p className="text-sm font-medium text-[var(--state-extension-fg)]">
            Treatment advice withheld by design.
          </p>
          {result.taskPreview ? (
            <aside
              className="border border-[var(--stroke)] p-3 font-mono text-xs space-y-1"
              aria-label="FHIR Task dry-run preview"
            >
              <p className="instrument-label text-[var(--muted)]">
                FHIR Task · dry-run preview
              </p>
              <p>resourceType: {result.taskPreview.resourceType}</p>
              <p>status: {result.taskPreview.status}</p>
              <p>intent: {result.taskPreview.intent}</p>
              <p>{result.taskPreview.description}</p>
              <p className="text-[var(--muted)]">{result.taskPreview.note}</p>
            </aside>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No Task preview in this scenario (blocked or error path).
            </p>
          )}
        </section>

        <footer
          id="steward-source-trace"
          className="space-y-2 text-sm text-[var(--muted)]"
        >
          <p className="instrument-label text-xs">Source Trace anchors</p>
          <p>
            MCP ·{" "}
            <a
              className="underline underline-offset-4"
              href={`https://github.com/anishakode/Steward_AI/blob/${sha}/${result.sourceTrace.mcpSourcePath}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {result.sourceTrace.mcpSourcePath}@{sha.slice(0, 7)}
            </a>
          </p>
          <p>
            Project ·{" "}
            <Link
              href={`/work/${result.sourceTrace.projectSlug}`}
              className="underline underline-offset-4"
            >
              Steward_AI evidence
            </Link>
          </p>
        </footer>
      </div>
    </SourceTraceProvider>
  );
}
