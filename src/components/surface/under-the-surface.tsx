"use client";

import { useState } from "react";
import { useRuntimeTraceOptional } from "@/components/runtime-trace/runtime-trace-context";
import {
  NEVER_RECORDED,
  NOT_COLLECTED,
  RUNTIME_TRACE_LIMIT,
  UNAVAILABLE,
  formatMetric,
  formatStages,
  formatToolNames,
} from "@/lib/runtime-trace";
import {
  REALITY_LABELS,
  REALITY_LABEL_MEANING,
  REALITY_LABEL_TEXT,
  SURFACE_ENTRY_LINE,
  SURFACE_LAYERS,
  type RealityLabel,
  type SurfaceLayerId,
} from "@/lib/surface";

export function UnderTheSurface() {
  const trace = useRuntimeTraceOptional();
  const [openLayer, setOpenLayer] = useState<SurfaceLayerId | null>("INTERFACE");
  const [realityFilter, setRealityFilter] = useState<RealityLabel | null>(null);

  const entries = trace?.entries ?? [];

  return (
    <div className="space-y-10">
      <section className="space-y-3" aria-labelledby="surface-entry-heading">
        <h2 id="surface-entry-heading" className="text-lg font-semibold">
          {SURFACE_ENTRY_LINE}
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Five layers, each subsystem labelled with what it actually is. Paths point at
          the code in this repository that served this page.
        </p>
      </section>

      <section className="space-y-3" aria-label="Reality labels">
        <h3 className="instrument-label text-xs tracking-wide">Reality labels</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={realityFilter === null ? "chip chip-selected" : "chip"}
            aria-pressed={realityFilter === null}
            onClick={() => setRealityFilter(null)}
          >
            ALL
          </button>
          {REALITY_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              className={realityFilter === label ? "chip chip-selected" : "chip"}
              aria-pressed={realityFilter === label}
              onClick={() => setRealityFilter((prev) => (prev === label ? null : label))}
            >
              {REALITY_LABEL_TEXT[label]}
            </button>
          ))}
        </div>
        <ul className="space-y-1 text-sm text-[var(--muted)]">
          {REALITY_LABELS.map((label) => (
            <li key={label}>
              <span className="instrument-label text-xs">
                {REALITY_LABEL_TEXT[label]}
              </span>{" "}
              — {REALITY_LABEL_MEANING[label]}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4" aria-label="Architecture layers">
        {SURFACE_LAYERS.map((layer) => {
          const subsystems = realityFilter
            ? layer.subsystems.filter((s) => s.reality === realityFilter)
            : layer.subsystems;
          const open = openLayer === layer.id;
          return (
            <div key={layer.id} className="border border-[var(--stroke)] p-4">
              <button
                type="button"
                className="flex w-full flex-wrap items-baseline justify-between gap-2 text-left"
                aria-expanded={open}
                onClick={() =>
                  setOpenLayer((prev) => (prev === layer.id ? null : layer.id))
                }
              >
                <span className="instrument-label text-sm tracking-wide">
                  {layer.label}
                </span>
                <span className="text-sm text-[var(--muted)]">{layer.role}</span>
              </button>

              {open ? (
                subsystems.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    No {REALITY_LABEL_TEXT[realityFilter as RealityLabel]} subsystem in
                    this layer.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3" aria-label={`${layer.label} subsystems`}>
                    {subsystems.map((sub) => (
                      <li key={sub.id} className="border-t border-[var(--stroke)] pt-3">
                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-medium">{sub.name}</span>
                          <span className="instrument-label text-xs tracking-wide">
                            {REALITY_LABEL_TEXT[sub.reality]}
                          </span>
                          <span className="instrument-label text-xs text-[var(--muted)]">
                            {sub.milestone}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--muted)]">{sub.detail}</p>
                        <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                          {sub.path ?? "no code in this deployment"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )
              ) : null}
            </div>
          );
        })}
      </section>

      <section className="space-y-3" aria-label="Runtime trace">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold">Runtime trace</h3>
          <p className="text-sm text-[var(--muted)]">
            Bounded to the last {RUNTIME_TRACE_LIMIT} actions · in memory only
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm" role="status">
            No runtime actions in this session yet. Run Signal, accept a Recompile, fork a
            role, or build an interview set — this log fills in as you do.
          </p>
        ) : (
          <ul className="space-y-3" aria-label="Runtime trace entries">
            {[...entries].reverse().map((entry) => (
              <li key={entry.id} className="border border-[var(--stroke)] p-3">
                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-medium">{entry.label}</span>
                  <span className="instrument-label text-xs tracking-wide">
                    {entry.status}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 font-mono text-xs text-[var(--muted)]">
                  <li>evidence count: {formatMetric(entry.evidenceCount)}</li>
                  <li>tools: {formatToolNames(entry.toolNames)}</li>
                  <li>stages: {formatStages(entry.architectureStages)}</li>
                  <li>duration: {formatMetric(entry.durationMs, "ms")}</li>
                  <li>note: {entry.note ?? NOT_COLLECTED}</li>
                </ul>
              </li>
            ))}
          </ul>
        )}

        {trace ? (
          <div className="flex flex-wrap items-start gap-3 text-sm text-[var(--muted)]">
            <button type="button" className="btn-secondary text-xs" onClick={trace.clear}>
              CLEAR TRACE
            </button>
            <span>rejected unsafe entries: {trace.rejectedCount}</span>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Runtime trace {UNAVAILABLE}</p>
        )}
      </section>

      <section className="border border-[var(--stroke)] p-4" aria-label="Never recorded">
        <h3 className="instrument-label text-xs tracking-wide">Never recorded</h3>
        <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
          {NEVER_RECORDED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          Where a number was never measured, this page says {formatMetric(null)} instead
          of inventing one.
        </p>
      </section>
    </div>
  );
}
