"use client";

import { useSyncExternalStore } from "react";
import { useSourceTrace } from "./source-trace-context";

type Geometry = { x1: number; y1: number; x2: number; y2: number };

let cached: Geometry | null = null;

function geometryEqual(a: Geometry | null, b: Geometry | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x1 === b.x1 && a.y1 === b.y1 && a.x2 === b.x2 && a.y2 === b.y2;
}

function readGeometry(trigger: HTMLElement | null): Geometry | null {
  if (!trigger || typeof window === "undefined") {
    cached = null;
    return null;
  }
  if (typeof window.matchMedia !== "function") {
    cached = null;
    return null;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cached = null;
    return null;
  }
  if (window.matchMedia("(max-width: 767px)").matches) {
    cached = null;
    return null;
  }

  const drawer = document.querySelector(".source-trace-drawer");
  if (!drawer) {
    cached = null;
    return null;
  }

  const a = trigger.getBoundingClientRect();
  const b = drawer.getBoundingClientRect();
  const next = {
    x1: a.right,
    y1: a.top + a.height / 2,
    x2: b.left,
    y2: b.top + 48,
  };
  if (geometryEqual(cached, next)) return cached;
  cached = next;
  return cached;
}

function subscribe(onChange: () => void) {
  const notify = () => {
    requestAnimationFrame(() => onChange());
  };
  notify();
  window.addEventListener("resize", notify);
  window.addEventListener("scroll", notify, true);

  if (typeof window.matchMedia !== "function") {
    return () => {
      window.removeEventListener("resize", notify);
      window.removeEventListener("scroll", notify, true);
    };
  }

  const mqNarrow = window.matchMedia("(max-width: 767px)");
  const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  mqNarrow.addEventListener("change", notify);
  mqMotion.addEventListener("change", notify);
  return () => {
    window.removeEventListener("resize", notify);
    window.removeEventListener("scroll", notify, true);
    mqNarrow.removeEventListener("change", notify);
    mqMotion.removeEventListener("change", notify);
  };
}

/**
 * Decorative viewport connector — progressive enhancement only.
 * Hidden on small viewports and when prefers-reduced-motion is set.
 * Mount only while a trace is active so subscribe runs after the drawer paints.
 */
export function SourceTraceLine() {
  const { triggerElement } = useSourceTrace();
  const geometry = useSyncExternalStore(
    subscribe,
    () => readGeometry(triggerElement),
    () => null,
  );

  if (!geometry) return null;

  return (
    <svg className="source-trace-line" aria-hidden="true" width="100%" height="100%">
      <line
        x1={geometry.x1}
        y1={geometry.y1}
        x2={geometry.x2}
        y2={geometry.y2}
        stroke="var(--measure)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    </svg>
  );
}
