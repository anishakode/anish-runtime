"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { EvidenceBadge } from "@/components/evidence-badge";
import {
  retrieveEvidence,
  type SearchDocument,
  type SearchHit,
  type SemanticHit,
} from "@/lib/search";
import { SignalComposedView } from "@/components/signal/composed-view";
import { useRuntimeTraceOptional } from "@/components/runtime-trace/runtime-trace-context";
import { useSessionRuntimeOptional } from "@/components/session/session-runtime-context";
import { COMPOSE_FALLBACK_NOTICE } from "@/lib/signal/compose-types";
import type { SignalInterpretation } from "@/lib/signal/types";
import { categoryForItem } from "@/lib/session";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Null when the environment has no clock — the trace shows NOT MEASURED rather than 0. */
function elapsedMs(startedAt: number | null): number | null {
  if (startedAt === null || typeof performance === "undefined") return null;
  return Math.round(performance.now() - startedAt);
}

type AskRuntimeProps = {
  documents: SearchDocument[];
};

function matchLabel(kind: SearchHit["matchKind"]): string {
  switch (kind) {
    case "exact_title":
      return "exact title";
    case "exact_alias":
      return "exact alias";
    case "prefix":
      return "prefix";
    case "keyword":
      return "keyword";
    case "typo":
      return "typo recovery";
  }
}

function HitCard({
  title,
  summary,
  href,
  evidenceState,
  meta,
  onNavigate,
}: {
  title: string;
  summary: string;
  href: string;
  evidenceState: SearchHit["evidenceState"] | SemanticHit["evidenceState"];
  meta: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      className="ask-runtime-hit block border border-[var(--stroke)] p-3 no-underline"
      onClick={onNavigate}
    >
      <div className="flex flex-wrap items-start gap-2">
        <EvidenceBadge state={evidenceState} />
        <span className="instrument-label text-xs text-[var(--muted)]">{meta}</span>
      </div>
      <p className="mt-2 font-medium text-[var(--on-surface)]">{title}</p>
      {summary ? (
        <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{summary}</p>
      ) : null}
    </Link>
  );
}

function HitList({
  label,
  hits,
  onNavigate,
}: {
  label: string;
  hits: SearchHit[];
  onNavigate: () => void;
}) {
  return (
    <section>
      <h3 className="sr-only">{label}</h3>
      <ul className="space-y-3" aria-label={label}>
        {hits.map((hit) => (
          <li key={`${hit.document.kind}:${hit.document.id}`}>
            <HitCard
              title={hit.document.title}
              summary={hit.document.summary}
              href={hit.document.href}
              evidenceState={hit.evidenceState}
              meta={`${hit.document.kind} · ${matchLabel(hit.matchKind)}`}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Deterministic ASK RUNTIME search + optional INTERPRET WITH SIGNAL (M15–M17).
 */
export function AskRuntime({ documents }: AskRuntimeProps) {
  const session = useSessionRuntimeOptional();
  const runtimeTrace = useRuntimeTraceOptional();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [signal, setSignal] = useState<SignalInterpretation | null>(null);
  const [signalBusy, setSignalBusy] = useState(false);
  const [signalError, setSignalError] = useState<string | null>(null);
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(false);
  const wasOpen = useRef(false);

  const retrieval = useMemo(() => retrieveEvidence(query, documents), [query, documents]);
  const hits = retrieval.deterministic;
  const semanticHits = retrieval.semantic;

  const modKey = useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl";
    return /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
  }, []);

  function openDialog() {
    setQuery("");
    setSignal(null);
    setSignalError(null);
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
  }

  function onQueryChange(value: string) {
    setQuery(value);
    setSignal(null);
    setSignalError(null);
  }

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (openRef.current) closeDialog();
        else openDialog();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) triggerRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const nodes = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function runSignal() {
    const q = query.trim();
    if (!q || signalBusy) return;
    setSignalBusy(true);
    setSignalError(null);
    const startedAt = typeof performance === "undefined" ? null : performance.now();
    try {
      const res = await fetch("/api/signal/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        setSignal(null);
        setSignalError(err?.error ?? `Signal request failed (${res.status})`);
        // Safe fields only — the rejected query text never enters the trace.
        runtimeTrace?.record({
          action: "SIGNAL_INTERPRET",
          status: "REJECTED",
          evidenceCount: 0,
          architectureStages: ["INTERFACE", "RUNTIME"],
          durationMs: elapsedMs(startedAt),
        });
        return;
      }
      const data = (await res.json()) as SignalInterpretation;
      setSignal(data);
      runtimeTrace?.record({
        action: "SIGNAL_INTERPRET",
        status:
          data.evidenceIds.length === 0
            ? "GAP"
            : data.composeStatus === "composed"
              ? "OK"
              : "FALLBACK",
        evidenceCount: data.evidenceIds.length,
        toolNames: data.toolTrace.map((step) => step.tool),
        architectureStages: ["INTERFACE", "ORCHESTRATION", "TRUTH", "RUNTIME"],
        durationMs: elapsedMs(startedAt),
      });
      if (session) {
        for (const id of data.evidenceIds.slice(0, 5)) {
          if (categoryForItem(id)) {
            session.recordItem(id, `Signal evidence ${id}`);
          }
        }
      }
    } catch {
      setSignal(null);
      setSignalError("Signal request failed — try again or use deterministic search.");
      runtimeTrace?.record({
        action: "SIGNAL_INTERPRET",
        status: "REJECTED",
        evidenceCount: 0,
        architectureStages: ["INTERFACE", "RUNTIME"],
        durationMs: elapsedMs(startedAt),
      });
    } finally {
      setSignalBusy(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="ask-runtime-trigger btn-secondary text-xs"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openDialog}
      >
        ASK RUNTIME
        <kbd className="ask-runtime-kbd ml-2">{modKey}+K</kbd>
      </button>

      {open ? (
        <div className="source-trace-drawer-root ask-runtime-root" role="presentation">
          <button
            type="button"
            className="source-trace-backdrop"
            aria-label="Close ASK RUNTIME"
            onClick={closeDialog}
          />
          <aside
            ref={dialogRef}
            className="source-trace-drawer ask-runtime-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--stroke)] pb-3">
              <div>
                <p className="eyebrow">ASK RUNTIME</p>
                <h2 id={titleId} className="page-title text-xl">
                  Deterministic evidence search
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Diagnostic retrieval from the Evidence Graph — not chat. Match quality
                  never upgrades evidence strength.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="btn-secondary"
                onClick={closeDialog}
              >
                Close
              </button>
            </div>

            <label className="mt-4 block text-sm" htmlFor="ask-runtime-query">
              Search evidence
              <input
                ref={inputRef}
                id="ask-runtime-query"
                type="search"
                className="ask-runtime-input mt-2 w-full"
                placeholder="e.g. PSI, Cardstack, malware, failure museum"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </label>

            <div className="mt-3 flex flex-wrap items-start gap-3">
              <p className="instrument-label text-xs text-[var(--muted)]">
                Deterministic first · semantic fallback only when needed · Press Escape to
                close
              </p>
              {query.trim() ? (
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => void runSignal()}
                  disabled={signalBusy}
                  aria-busy={signalBusy}
                >
                  {signalBusy ? "INTERPRETING…" : "INTERPRET WITH SIGNAL"}
                </button>
              ) : null}
            </div>

            <div className="mt-4 space-y-6" aria-live="polite">
              {!query.trim() ? (
                <p className="text-sm text-[var(--muted)]">
                  Type to inspect canonical entities. Weak states stay visibly limited.
                  Semantic similarity is relevance, not proof. Signal is optional and
                  explicit.
                </p>
              ) : hits.length === 0 && semanticHits.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  No canonical evidence matched
                  {retrieval.status === "semantic_failed_fallback"
                    ? " (semantic layer unavailable — fell back to deterministic only)"
                    : ""}
                  . This is a gap notice — ASK RUNTIME will not invent professional facts.
                </p>
              ) : (
                <>
                  {hits.length > 0 ? (
                    <HitList
                      label="Deterministic evidence matches"
                      hits={hits}
                      onNavigate={closeDialog}
                    />
                  ) : null}
                  {semanticHits.length > 0 ? (
                    <section aria-label="Semantic relevance results">
                      <h3 className="text-sm font-semibold">
                        Semantic relevance (not proof)
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Broadened intent from derived evidence text. Evidence states are
                        unchanged — similarity never upgrades proof.
                      </p>
                      <ul className="mt-3 space-y-3">
                        {semanticHits.map((hit) => (
                          <li key={`semantic:${hit.document.canonicalId}`}>
                            <HitCard
                              title={hit.document.title}
                              summary={hit.document.summary}
                              href={hit.document.href}
                              evidenceState={hit.evidenceState}
                              meta={`${hit.document.kind} · semantic · score ${hit.score.toFixed(2)}`}
                              onNavigate={closeDialog}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                  {retrieval.status === "semantic_failed_fallback" ? (
                    <p className="text-sm text-[var(--muted)]">
                      Semantic vector infrastructure failed — showing deterministic
                      results only.
                    </p>
                  ) : null}
                </>
              )}

              {signalError ? (
                <p className="text-sm text-[var(--muted)]" role="alert">
                  {signalError}
                </p>
              ) : null}

              {signal ? (
                <section aria-label="Signal interpretation">
                  <h3 className="text-sm font-semibold">Signal interpretation</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {signal.boundaryNotice}
                  </p>
                  {signal.gapNotice ? (
                    signal.composed ? (
                      <div className="mt-3">
                        <SignalComposedView
                          view={signal.composed}
                          onNavigate={closeDialog}
                        />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--muted)]">
                        {signal.gapNotice}
                      </p>
                    )
                  ) : (
                    <>
                      {signal.composeStatus === "composed" && signal.composed ? (
                        <div className="mt-3">
                          <p className="mb-2 text-sm text-[var(--muted)]">
                            The UI is the AI response — facts rehydrated from the Evidence
                            Graph.
                          </p>
                          <SignalComposedView
                            view={signal.composed}
                            onNavigate={closeDialog}
                          />
                        </div>
                      ) : null}
                      {signal.composeStatus === "fallback" ? (
                        <p className="mt-3 text-sm text-[var(--muted)]" role="status">
                          {COMPOSE_FALLBACK_NOTICE}
                          {signal.fallbackReason ? ` (${signal.fallbackReason})` : ""}
                        </p>
                      ) : null}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-[var(--muted)]">
                          Tool-backed text answer
                        </summary>
                        <pre className="ask-runtime-signal-answer mt-2 whitespace-pre-wrap text-sm text-[var(--on-surface)]">
                          {signal.answer}
                        </pre>
                      </details>
                      {signal.evidence.length > 0 &&
                      signal.composeStatus !== "composed" ? (
                        <ul className="mt-3 space-y-3" aria-label="Signal evidence">
                          {signal.evidence.map((card) => (
                            <li key={`signal:${card.id}`}>
                              <HitCard
                                title={card.title}
                                summary={card.summary}
                                href={card.href}
                                evidenceState={card.evidenceState}
                                meta={`${card.kind} · signal tool`}
                                onNavigate={closeDialog}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  )}
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-[var(--muted)]">
                      Tool trace ({signal.toolTrace.length})
                      {signal.uiPlan
                        ? ` · ui_plan ${signal.uiPlan.blocks.length} blocks`
                        : ""}
                    </summary>
                    <ul className="mt-2 space-y-1 font-mono text-xs text-[var(--muted)]">
                      {signal.toolTrace.map((step, i) => (
                        <li key={`${step.tool}-${i}`}>
                          {step.ok
                            ? `ok · ${step.tool}`
                            : `fail · ${step.tool}: ${step.error}`}
                        </li>
                      ))}
                    </ul>
                  </details>
                </section>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
