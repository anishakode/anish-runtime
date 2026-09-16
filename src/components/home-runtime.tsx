"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COMPILATION_STEPS,
  DEFAULT_JOURNEY,
  JOURNEY_OPTIONS,
  journeyLabel,
  settledJourneyPlan,
  stepDurationMs,
  type JourneyMode,
  type RuntimePhase,
} from "@/lib/home/runtime-model";
import type { EvidenceState } from "@/lib/evidence/schema";
import { EvidenceBadge } from "@/components/evidence-badge";
import { useSessionRuntimeOptional } from "@/components/session/session-runtime-context";
import { recompileBoundaryNotice, SESSION_CATEGORY_LABEL } from "@/lib/session";

export type HomeRuntimeProps = {
  name: string;
  positioning: string;
  proposition: string;
  tagline: string;
  stats: {
    nodes: number;
    projects: number;
    sources: number;
    edges: number;
    byTier: { flagship: number; supporting: number; archive: number };
  };
  capabilities: string[];
  flagships: Array<{
    slug: string;
    title: string;
    summary: string;
    evidenceState: EvidenceState;
  }>;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HomeRuntime({
  name,
  positioning,
  proposition,
  tagline,
  stats,
  capabilities,
  flagships,
}: HomeRuntimeProps) {
  const session = useSessionRuntimeOptional();
  const orderedCapabilities = useMemo(
    () => (session ? session.orderCapabilities(capabilities) : capabilities),
    [session, capabilities],
  );
  const orderedFlagships = useMemo(
    () => (session ? session.orderProjects(flagships) : flagships),
    [session, flagships],
  );
  const [journey, setJourney] = useState<JourneyMode>(DEFAULT_JOURNEY);
  const [phase, setPhase] = useState<RuntimePhase>("idle");
  const [stepIndex, setStepIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState("");
  const timersRef = useRef<number[]>([]);
  const readyHeadingRef = useRef<HTMLHeadingElement>(null);
  const compileHeadingRef = useRef<HTMLHeadingElement>(null);
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const settle = useCallback(
    (mode: JourneyMode, via: "complete" | "skip" | "escape" | "reduced-motion") => {
      clearTimers();
      setPhase("ready");
      setStepIndex(COMPILATION_STEPS.length - 1);
      const viaNote =
        via === "complete"
          ? "Compilation complete."
          : via === "reduced-motion"
            ? "Motion reduced — runtime ready."
            : "Compilation skipped — runtime ready.";
      setStatusMessage(
        `${viaNote} Journey mode ${journeyLabel(mode)}. ${stats.nodes} evidence nodes · ${stats.projects} projects.`,
      );
    },
    [clearTimers, stats.nodes, stats.projects],
  );

  const runCompilation = useCallback(
    (mode: JourneyMode) => {
      clearTimers();
      if (prefersReducedMotion()) {
        settle(mode, "reduced-motion");
        return;
      }

      setPhase("compiling");
      setStepIndex(0);
      setStatusMessage(`${COMPILATION_STEPS[0].label}.`);

      const dwell = stepDurationMs(mode);
      COMPILATION_STEPS.forEach((_, index) => {
        if (index === 0) return;
        const id = window.setTimeout(() => {
          setStepIndex(index);
          setStatusMessage(`${COMPILATION_STEPS[index].label}.`);
        }, dwell * index);
        timersRef.current.push(id);
      });

      const doneId = window.setTimeout(
        () => settle(mode, "complete"),
        dwell * COMPILATION_STEPS.length,
      );
      timersRef.current.push(doneId);
    },
    [clearTimers, settle],
  );

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setStepIndex(-1);
    setStatusMessage("Runtime reset. Landing readable without compilation.");
    session?.resetRecompile();
  }, [clearTimers, session]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (phase === "compiling") {
        event.preventDefault();
        settle(journey, "escape");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, journey, settle]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (phase === "ready") {
      readyHeadingRef.current?.focus();
      return;
    }
    if (phase === "compiling") {
      skipButtonRef.current?.focus();
      return;
    }
    if (phase === "idle" && statusMessage.includes("Runtime reset")) {
      runButtonRef.current?.focus();
    }
  }, [phase, statusMessage]);

  const plan = settledJourneyPlan(journey);
  const visibleFlagships = orderedFlagships.slice(0, plan.flagshipLimit);
  const recompileNote =
    session?.activeCategory != null
      ? recompileBoundaryNotice(SESSION_CATEGORY_LABEL[session.activeCategory])
      : null;

  return (
    <div className="home-runtime flex flex-1 flex-col gap-8">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {phase === "idle" ? (
        <>
          <p className="eyebrow">ANISH // RUNTIME</p>
          <h1 className="page-title max-w-xl sm:text-5xl">{name}</h1>
          <p className="text-lg text-[var(--muted)]">{positioning}</p>
          <p className="page-lede">
            {proposition} {tagline}
          </p>
          <p className="instrument-label text-sm text-[var(--muted)]">
            Evidence graph: {stats.nodes} nodes · {stats.projects} projects ·{" "}
            {stats.sources} sources
          </p>

          <fieldset className="journey-fieldset max-w-xl border-0 p-0">
            <legend className="instrument-label mb-2 text-xs tracking-wide text-[var(--muted)]">
              Journey preset
            </legend>
            <div className="flex flex-wrap gap-2">
              {JOURNEY_OPTIONS.map((option) => {
                const selected = journey === option.id;
                const optionId = `journey-${option.id}`;
                return (
                  <label
                    key={option.id}
                    htmlFor={optionId}
                    className={selected ? "chip chip-selected" : "chip"}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name="journey-preset"
                      className="sr-only"
                      value={option.id}
                      checked={selected}
                      onChange={() => setJourney(option.id)}
                    />
                    {option.label}
                    {"recommended" in option && option.recommended ? (
                      <span className="ml-1 text-[var(--muted)]">(default)</span>
                    ) : null}
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {JOURNEY_OPTIONS.find((o) => o.id === journey)?.description}
            </p>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <button
              ref={runButtonRef}
              type="button"
              className="btn-primary"
              onClick={() => runCompilation(journey)}
            >
              RUN ANISH
            </button>
            <Link href="/work" className="btn-secondary">
              View work
            </Link>
            <Link href="/cv" className="btn-secondary">
              CV
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact
            </Link>
          </div>
          <p className="max-w-md text-sm text-[var(--muted)]">
            Readable without running. Compilation is progressive enhancement — Skip and
            Escape are available once it starts.
          </p>
        </>
      ) : null}

      {phase === "compiling" ? (
        <section className="compilation-panel" aria-labelledby="compile-heading">
          <p className="eyebrow">Compiling</p>
          <h1
            id="compile-heading"
            ref={compileHeadingRef}
            tabIndex={-1}
            className="page-title"
          >
            {name}
          </h1>
          <ol className="compilation-steps mt-6 list-none space-y-3 p-0">
            {COMPILATION_STEPS.map((step, index) => {
              const state =
                index < stepIndex ? "done" : index === stepIndex ? "active" : "pending";
              return (
                <li
                  key={step.id}
                  className={`compilation-step compilation-step--${state}`}
                  aria-current={state === "active" ? "step" : undefined}
                >
                  <span className="instrument-label text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{step.label}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              ref={skipButtonRef}
              type="button"
              className="btn-secondary"
              onClick={() => settle(journey, "skip")}
            >
              Skip compilation
            </button>
            <p className="self-center text-sm text-[var(--muted)]">
              Press Escape to skip
            </p>
          </div>
        </section>
      ) : null}

      {phase === "ready" ? (
        <section className="runtime-ready" aria-labelledby="ready-heading">
          <p className="eyebrow">System ready</p>
          <h1
            id="ready-heading"
            ref={readyHeadingRef}
            tabIndex={-1}
            className="page-title"
          >
            {name}
          </h1>
          <p className="text-lg text-[var(--muted)]">{positioning}</p>
          <p className="instrument-label text-sm text-[var(--muted)]">
            Journey mode · {journeyLabel(journey)} · {stats.nodes} nodes ·{" "}
            {stats.projects} projects · {stats.sources} sources · {stats.edges} edges ·
            flagship {stats.byTier.flagship}
          </p>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">{plan.guidance}</p>
          {recompileNote ? (
            <p className="mt-2 max-w-xl text-sm text-[var(--muted)]" role="status">
              {recompileNote}
            </p>
          ) : null}

          {plan.showConstellation ? (
            <div className="mt-6">
              <h2 className="instrument-label mb-3 text-xs tracking-wide text-[var(--muted)]">
                Capability constellation
              </h2>
              <ul
                className="capability-constellation"
                aria-label="Capability constellation"
              >
                {orderedCapabilities.map((cap) => (
                  <li key={cap} className="capability-node">
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10">
            <h2 className="instrument-label mb-3 text-xs tracking-wide text-[var(--muted)]">
              {plan.flagshipLimit === 1 ? "Featured flagship" : "Flagship projects"}
            </h2>
            <ul
              className={`grid list-none gap-4 p-0 ${
                plan.flagshipLimit === 1 ? "" : "md:grid-cols-3"
              }`}
              aria-label={
                plan.flagshipLimit === 1 ? "Featured flagship" : "Flagship projects"
              }
            >
              {visibleFlagships.map((project) => (
                <li key={project.slug} className="border border-[var(--stroke)] p-4">
                  <Link
                    href={`/work/${project.slug}`}
                    className="font-medium text-[var(--on-surface)] underline-offset-2 hover:underline"
                  >
                    {project.title}
                  </Link>
                  <div className="mt-2">
                    <EvidenceBadge state={project.evidenceState} />
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{project.summary}</p>
                  {project.slug === "mlops-governance-dashboard" ? (
                    <p className="mt-3 text-sm">
                      <Link href="/labs/mlops" className="underline underline-offset-4">
                        Open MLOps Runtime Lab — Break the System
                      </Link>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={plan.primaryHref} className="btn-primary">
              {plan.primaryLabel}
            </Link>
            {plan.primaryHref !== "/cv" ? (
              <Link href="/cv" className="btn-secondary">
                CV
              </Link>
            ) : (
              <Link href="/work" className="btn-secondary">
                View work
              </Link>
            )}
            <Link href="/contact" className="btn-secondary">
              Contact
            </Link>
            <button type="button" className="btn-secondary" onClick={reset}>
              Reset runtime
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
