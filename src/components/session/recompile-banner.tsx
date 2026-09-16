"use client";

import { SESSION_CATEGORY_LABEL } from "@/lib/session";
import { useSessionRuntime } from "./session-runtime-context";

/**
 * Consent-gated Signal Recompile prompt (M19).
 * Only appears when heuristic detects a lean — never auto-recompiles.
 */
export function RecompileBanner() {
  const {
    signal,
    consent,
    activeCategory,
    whyOpen,
    approveRecompile,
    dismissRecompile,
    resetRecompile,
    setWhyOpen,
  } = useSessionRuntime();

  if (consent === "approved" && activeCategory) {
    return (
      <div
        className="border-b border-[var(--stroke)] bg-[var(--surface)] px-6 py-3"
        role="status"
        aria-label="Session recompile active"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 text-sm">
          <p>
            Session recompiled around{" "}
            <strong>{SESSION_CATEGORY_LABEL[activeCategory]}</strong>
            {" — "}
            presentation order only. Evidence unchanged.
          </p>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={resetRecompile}
          >
            RESET
          </button>
        </div>
      </div>
    );
  }

  if (!signal.detected || consent === "dismissed") return null;

  return (
    <div
      className="border-b border-[var(--stroke)] bg-[var(--surface)] px-6 py-4"
      role="region"
      aria-label="Signal recompile prompt"
    >
      <div className="mx-auto w-full max-w-5xl space-y-3">
        <p className="eyebrow">SIGNAL DETECTED / SESSION ONLY</p>
        <p className="text-sm text-[var(--on-surface)]">
          Your exploration is leaning toward <strong>{signal.leadingLabel}</strong> (
          {Math.round(signal.share * 100)}% of {signal.interactionCount} distinct items).
        </p>
        <p className="text-sm text-[var(--muted)]">
          Recompile this portfolio around that evidence?
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={approveRecompile}
          >
            RECOMPILE
          </button>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={dismissRecompile}
          >
            NOT NOW
          </button>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => setWhyOpen(!whyOpen)}
            aria-expanded={whyOpen}
          >
            WHY?
          </button>
        </div>
        {whyOpen ? (
          <div className="space-y-2 border border-[var(--stroke)] p-3 text-sm text-[var(--muted)]">
            <p>
              Distinct interactions: {signal.interactionCount}. Supporting items in{" "}
              {signal.leadingLabel}: {signal.supportingCount}.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {signal.shares
                .filter((s) => s.count > 0)
                .map((s) => (
                  <li key={s.category}>
                    {s.label}: {s.count} ({Math.round(s.share * 100)}%)
                  </li>
                ))}
            </ul>
            {signal.recentReasons.length > 0 ? (
              <p>Recent: {signal.recentReasons.join(" · ")}</p>
            ) : null}
            <p>{signal.unusedNotice}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
