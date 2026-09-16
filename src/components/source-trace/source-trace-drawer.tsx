"use client";

import { useEffect, useId, useRef } from "react";
import { useSourceTrace } from "./source-trace-context";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SourceTraceDrawer() {
  const { active, close } = useSourceTrace();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (active) closeRef.current?.focus();
  }, [active]);

  useEffect(() => {
    if (!active) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !drawerRef.current) return;
      const nodes = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
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
  }, [active]);

  if (!active) return null;

  return (
    <div className="source-trace-drawer-root" role="presentation">
      <button
        type="button"
        className="source-trace-backdrop"
        aria-label="Close source trace"
        onClick={close}
      />
      <aside
        ref={drawerRef}
        className="source-trace-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--stroke)] pb-3">
          <div>
            <p className="eyebrow">Source Trace</p>
            <h2 id={titleId} className="page-title text-xl">
              {active.claimLabel}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Evidence panel is authoritative. The connector line is progressive
              enhancement only.
            </p>
          </div>
          <button ref={closeRef} type="button" className="btn-secondary" onClick={close}>
            Close
          </button>
        </div>

        <p className="instrument-label mt-4 text-xs text-[var(--muted)]">
          Press Escape to close
        </p>

        <ul className="mt-4 space-y-4" aria-label="Exact source list">
          {active.sources.map((source) => (
            <li
              key={source.id}
              id={`trace-source-${source.id}`}
              className="border border-[var(--stroke)] p-3"
            >
              <p className="font-medium">{source.title}</p>
              <p className="instrument-label mt-1 text-xs text-[var(--muted)]">
                {source.type}
                {source.pinned ? " · SHA-pinned" : " · unpinned"}
              </p>
              {source.repo ? (
                <p className="mt-2 font-mono text-xs text-[var(--muted)]">
                  repo · {source.repo}
                </p>
              ) : null}
              {source.path ? (
                <p className="font-mono text-xs text-[var(--muted)]">
                  path · {source.path}
                </p>
              ) : null}
              {source.commitSha ? (
                <p className="font-mono text-xs text-[var(--muted)]">
                  commit · {source.commitSha}
                </p>
              ) : (
                <p className="mt-2 text-xs text-[var(--state-limited-fg)]">
                  No immutable commit fingerprint on this source.
                </p>
              )}
              {source.note ? (
                <p className="mt-2 text-sm text-[var(--muted)]">{source.note}</p>
              ) : null}
              {source.url ? (
                <p className="mt-2 text-sm">
                  <a
                    className="underline underline-offset-4"
                    href={source.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Open provenance
                  </a>
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        {active.listAnchorId ? (
          <p className="mt-6 text-sm">
            <a
              className="underline underline-offset-4"
              href={`#${active.listAnchorId}`}
              onClick={close}
            >
              Jump to on-page source list
            </a>
          </p>
        ) : null}
      </aside>
    </div>
  );
}
