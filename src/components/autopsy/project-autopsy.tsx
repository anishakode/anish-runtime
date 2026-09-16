"use client";

import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { EvidenceBadge } from "@/components/evidence-badge";
import { FailureMuseum } from "@/components/failures/failure-museum";
import { SourceTraceProvider } from "@/components/source-trace/source-trace-context";
import { SourceTraceTrigger } from "@/components/source-trace/source-trace-trigger";
import { FAILURE_PUBLICATION_REQUIREMENTS } from "@/lib/failures/requirements";
import type { FailureMuseumView } from "@/lib/failures";
import {
  AUTOPSY_LENS_IDS,
  AUTOPSY_LENS_LABEL,
  autopsyLensFromHash,
  DEFAULT_AUTOPSY_LENS,
  type AutopsyLensId,
  type AutopsyProjectBundle,
} from "@/lib/autopsy/lenses";

type ProjectAutopsyProps = {
  bundle: AutopsyProjectBundle;
  /** Keep-mounted panels supplied by the parent (RUN / X-RAY / EVIDENCE). */
  runPanel: ReactNode;
  xrayPanel: ReactNode;
  evidencePanel: ReactNode;
  initialLens?: AutopsyLensId;
};

function clearLocationHash() {
  if (typeof window === "undefined" || !window.location.hash) return;
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}`);
}

/**
 * Flagship inspection chrome. All lens panels stay mounted so RUN lab state
 * and X-RAY scrubber index are not destroyed when switching lenses.
 * Single SourceTraceProvider wraps the tree so nested Trace hosts do not stack.
 */
export function ProjectAutopsy({
  bundle,
  runPanel,
  xrayPanel,
  evidencePanel,
  initialLens = DEFAULT_AUTOPSY_LENS,
}: ProjectAutopsyProps) {
  const tablistId = useId();
  const [userLens, setUserLens] = useState<AutopsyLensId>(initialLens);
  const [hashLens, setHashLens] = useState<AutopsyLensId | null>(null);
  const lens = hashLens ?? userLens;

  function selectLens(id: AutopsyLensId) {
    setUserLens(id);
    setHashLens(null);
    clearLocationHash();
  }

  useEffect(() => {
    function syncFromHash() {
      setHashLens(autopsyLensFromHash(window.location.hash));
    }
    // Defer past hydration so SSR markup stays stable (setState is not sync-in-effect).
    const timer = window.setTimeout(syncFromHash, 0);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fragment = window.location.hash.replace(/^#/, "");
    if (!fragment) return;
    const timer = window.setTimeout(() => {
      document.getElementById(fragment)?.scrollIntoView({ block: "start" });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [lens]);

  function onTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = AUTOPSY_LENS_IDS.indexOf(lens);
    if (index < 0) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = AUTOPSY_LENS_IDS[(index + 1) % AUTOPSY_LENS_IDS.length]!;
      selectLens(next);
      queueMicrotask(() => document.getElementById(`autopsy-tab-${next}`)?.focus());
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev =
        AUTOPSY_LENS_IDS[
          (index - 1 + AUTOPSY_LENS_IDS.length) % AUTOPSY_LENS_IDS.length
        ]!;
      selectLens(prev);
      queueMicrotask(() => document.getElementById(`autopsy-tab-${prev}`)?.focus());
    } else if (event.key === "Home") {
      event.preventDefault();
      selectLens(AUTOPSY_LENS_IDS[0]!);
      queueMicrotask(() =>
        document.getElementById(`autopsy-tab-${AUTOPSY_LENS_IDS[0]}`)?.focus(),
      );
    } else if (event.key === "End") {
      event.preventDefault();
      const last = AUTOPSY_LENS_IDS[AUTOPSY_LENS_IDS.length - 1]!;
      selectLens(last);
      queueMicrotask(() => document.getElementById(`autopsy-tab-${last}`)?.focus());
    }
  }

  return (
    <SourceTraceProvider>
      <section
        id="project-autopsy"
        className="project-autopsy space-y-6"
        aria-label="Project Autopsy"
      >
        <header className="space-y-2">
          <p className="eyebrow">Project Autopsy</p>
          <h2 className="page-title text-xl">Inspection lenses</h2>
          <p className="text-sm text-[var(--muted)]">
            Same project, six engineering perspectives. Switching lenses keeps RUN and
            X-RAY mounted so lab/scrubber state is not wiped.
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Autopsy lenses"
          id={tablistId}
          className="autopsy-lens-list flex flex-wrap gap-2"
          onKeyDown={onTabListKeyDown}
        >
          {AUTOPSY_LENS_IDS.map((id) => {
            const selected = lens === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`autopsy-tab-${id}`}
                aria-selected={selected}
                aria-controls={`autopsy-panel-${id}`}
                tabIndex={selected ? 0 : -1}
                className={selected ? "chip chip-selected" : "chip"}
                onClick={() => selectLens(id)}
              >
                {AUTOPSY_LENS_LABEL[id]}
              </button>
            );
          })}
        </div>

        <AutopsyPanel id="story" active={lens === "story"}>
          <StoryLens bundle={bundle} />
        </AutopsyPanel>

        <AutopsyPanel id="run" active={lens === "run"}>
          <div className="space-y-3">
            <p className="text-sm text-[var(--muted)]">
              Deterministic Runtime Lab — PORTFOLIO_EXTENSION. Prefer this lens over a
              separate route when you want lab state to survive inspection switches.
            </p>
            {runPanel}
          </div>
        </AutopsyPanel>

        <AutopsyPanel id="xray" active={lens === "xray"}>
          <div className="space-y-3">
            <p className="text-sm text-[var(--muted)]">
              Project X-Ray — responsibility layers with isolation, component selection,
              and Source Trace. Causal reconstruction (M9) remains below.
            </p>
            {xrayPanel}
          </div>
        </AutopsyPanel>

        <AutopsyPanel id="decisions" active={lens === "decisions"}>
          <DecisionsLens bundle={bundle} />
        </AutopsyPanel>

        <AutopsyPanel id="failures" active={lens === "failures"}>
          <FailuresLens bundle={bundle} />
        </AutopsyPanel>

        <AutopsyPanel id="evidence" active={lens === "evidence"}>
          {evidencePanel}
        </AutopsyPanel>
      </section>
    </SourceTraceProvider>
  );
}

function AutopsyPanel({
  id,
  active,
  children,
}: {
  id: AutopsyLensId;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`autopsy-panel-${id}`}
      aria-labelledby={`autopsy-tab-${id}`}
      hidden={!active}
      className="autopsy-panel space-y-4"
    >
      {children}
    </div>
  );
}

function StoryLens({ bundle }: { bundle: AutopsyProjectBundle }) {
  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{bundle.story.title}</h3>
        <EvidenceBadge state={bundle.story.evidenceState} />
      </div>
      <p>{bundle.story.summary}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Project themes">
        {bundle.story.themes.map((theme) => (
          <li key={theme} className="instrument-label text-xs text-[var(--muted)]">
            {theme}
          </li>
        ))}
      </ul>
    </article>
  );
}

function DecisionsLens({ bundle }: { bundle: AutopsyProjectBundle }) {
  return (
    <div id="autopsy-decisions" className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Engineering decisions grounded in public evidence — not a fabricated post-mortem
        diary.
      </p>
      <ul className="space-y-4">
        {bundle.decisions.map((decision) => (
          <li key={decision.id} className="border border-[var(--stroke)] p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">{decision.title}</h3>
              <EvidenceBadge state={decision.evidenceState} />
            </div>
            <p className="text-sm text-[var(--muted)]">{decision.detail}</p>
            <SourceTraceTrigger
              trace={{
                claimLabel: decision.title,
                listAnchorId: "autopsy-decisions",
                sources: decision.sources,
              }}
            >
              Trace decision sources
            </SourceTraceTrigger>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FailuresLens({ bundle }: { bundle: AutopsyProjectBundle }) {
  const museum: FailureMuseumView = {
    empty: bundle.failures.empty,
    publishedCount: 0,
    exhibits: [],
    boundaryNodeId: bundle.failures.nodeId,
    title: bundle.failures.title,
    summary: bundle.failures.summary,
    state: bundle.failures.state,
    publicationRequirements: FAILURE_PUBLICATION_REQUIREMENTS,
  };
  return <FailureMuseum museum={museum} />;
}
