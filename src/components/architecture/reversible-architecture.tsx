"use client";

import { useId, useMemo, useState } from "react";
import { EvidenceBadge } from "@/components/evidence-badge";
import { SourceTraceProvider } from "@/components/source-trace/source-trace-context";
import { SourceTraceTrigger } from "@/components/source-trace/source-trace-trigger";
import {
  ARCHITECTURE_PRODUCT_LABEL,
  ARCHITECTURE_PRODUCT_NOTE,
  ARCHITECTURE_REALITY_LABEL,
  ARCHITECTURE_STAGE_COUNT,
  clampArchitectureIndex,
  nextArchitectureIndex,
  previousArchitectureIndex,
  revealedArchitectureStages,
  type ArchitectureStageView,
} from "@/lib/architecture/stages";

export function ReversibleArchitecture({ stages }: { stages: ArchitectureStageView[] }) {
  const scrubberId = useId();
  const titleId = useId();
  const [index, setIndex] = useState(0);
  const safeIndex = clampArchitectureIndex(index);
  const active = stages[safeIndex] ?? stages[0];
  const revealed = useMemo(
    () => revealedArchitectureStages(stages, safeIndex),
    [stages, safeIndex],
  );

  if (!active || stages.length === 0) {
    return null;
  }

  return (
    <SourceTraceProvider>
      <section
        id="reversible-architecture"
        className="architecture-recon space-y-5 border border-[var(--stroke)] p-4 sm:p-5"
        aria-labelledby={titleId}
      >
        <header className="space-y-2">
          <p className="eyebrow">{ARCHITECTURE_PRODUCT_LABEL}</p>
          <h2 id={titleId} className="page-title text-xl">
            Reversible Architecture
          </h2>
          <p className="text-sm text-[var(--muted)]">{ARCHITECTURE_PRODUCT_NOTE}</p>
        </header>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={safeIndex === 0}
            onClick={() => setIndex(previousArchitectureIndex(safeIndex))}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={safeIndex >= ARCHITECTURE_STAGE_COUNT - 1}
            onClick={() => setIndex(nextArchitectureIndex(safeIndex))}
          >
            Next
          </button>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={scrubberId}
            className="instrument-label text-xs text-[var(--muted)]"
          >
            Stage scrubber · {safeIndex + 1} / {ARCHITECTURE_STAGE_COUNT} · {active.title}
          </label>
          <input
            id={scrubberId}
            type="range"
            min={0}
            max={ARCHITECTURE_STAGE_COUNT - 1}
            step={1}
            value={safeIndex}
            className="architecture-scrubber w-full"
            aria-valuetext={`${active.title} (${safeIndex + 1} of ${ARCHITECTURE_STAGE_COUNT})`}
            onChange={(event) => setIndex(Number(event.target.value))}
          />
        </div>

        <article
          className="space-y-3 border-t border-[var(--stroke)] pt-4"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-lg font-semibold">{active.title}</h3>
            <span className="instrument-label text-xs text-[var(--muted)]">
              {ARCHITECTURE_REALITY_LABEL[active.reality]}
            </span>
            {active.reality === "PORTFOLIO_SIMULATION" ? (
              <EvidenceBadge state="PORTFOLIO_EXTENSION" />
            ) : (
              <EvidenceBadge state="PUBLIC_CODE_VERIFIED" />
            )}
          </div>
          <p className="text-sm">{active.summary}</p>
          <p className="text-sm text-[var(--muted)]">
            <span className="instrument-label text-xs">Why this stage · </span>
            {active.reasoning}
          </p>
          {active.sources.length > 0 ? (
            <SourceTraceTrigger
              trace={{
                claimLabel: active.claimLabel,
                listAnchorId: "reversible-architecture",
                sources: active.sources,
              }}
            >
              Trace stage sources
            </SourceTraceTrigger>
          ) : null}
        </article>

        {/* Authoritative cumulative map — text first; visual map is PE styling only */}
        <div className="architecture-map space-y-2 border-t border-[var(--stroke)] pt-4">
          <h3 className="instrument-label text-xs text-[var(--muted)]">
            Cumulative architecture map
          </h3>
          <ol className="architecture-map-list space-y-2">
            {stages.map((stage) => {
              const isRevealed = stage.index <= safeIndex;
              const isCurrent = stage.index === safeIndex;
              return (
                <li
                  key={stage.id}
                  className={
                    isRevealed
                      ? isCurrent
                        ? "architecture-map-item architecture-map-item--current"
                        : "architecture-map-item architecture-map-item--revealed"
                      : "architecture-map-item architecture-map-item--pending"
                  }
                >
                  <button
                    type="button"
                    className="text-left"
                    aria-current={isCurrent ? "step" : undefined}
                    disabled={!isRevealed}
                    onClick={() => setIndex(stage.index)}
                  >
                    <span className="instrument-label text-xs">
                      {stage.index + 1}. {stage.title}
                    </span>
                    {isRevealed ? (
                      <span className="mt-0.5 block text-sm text-[var(--muted)]">
                        {stage.claimLabel}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-sm text-[var(--muted)]">
                        Not revealed yet
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="sr-only">
            Revealed stages: {revealed.map((s) => s.title).join(", ")}.
          </p>
        </div>
      </section>
    </SourceTraceProvider>
  );
}
