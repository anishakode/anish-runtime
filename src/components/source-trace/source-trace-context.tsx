"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ResolvedSourceTrace } from "@/lib/evidence/source-trace";
import { SourceTraceDrawer } from "./source-trace-drawer";
import { SourceTraceLine } from "./source-trace-line";

type SourceTraceContextValue = {
  active: ResolvedSourceTrace | null;
  triggerElement: HTMLElement | null;
  open: (trace: ResolvedSourceTrace, trigger?: HTMLElement | null) => void;
  close: () => void;
};

const SourceTraceContext = createContext<SourceTraceContextValue | null>(null);

function SourceTraceProviderRoot({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ResolvedSourceTrace | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  const close = useCallback(() => {
    const restore = triggerElement;
    setActive(null);
    setTriggerElement(null);
    queueMicrotask(() => {
      restore?.focus?.();
    });
  }, [triggerElement]);

  const open = useCallback((trace: ResolvedSourceTrace, trigger?: HTMLElement | null) => {
    if (!trace.claimLabel.trim()) {
      throw new Error("SourceTrace open: claimLabel is required");
    }
    if (trace.sources.length === 0) {
      throw new Error("SourceTrace open: sources must be non-empty");
    }
    setActive(trace);
    setTriggerElement(trigger ?? null);
  }, []);

  useEffect(() => {
    if (!active) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, close]);

  const value = useMemo(
    () => ({ active, triggerElement, open, close }),
    [active, triggerElement, open, close],
  );

  return (
    <SourceTraceContext.Provider value={value}>
      {children}
      <SourceTraceDrawer />
      {active ? <SourceTraceLine /> : null}
    </SourceTraceContext.Provider>
  );
}

/**
 * Nesting-safe: if a parent provider already exists, pass children through
 * so Autopsy/X-Ray/Lab do not stack drawers or Escape listeners.
 */
export function SourceTraceProvider({ children }: { children: ReactNode }) {
  const existing = useContext(SourceTraceContext);
  if (existing) {
    return <>{children}</>;
  }
  return <SourceTraceProviderRoot>{children}</SourceTraceProviderRoot>;
}

export function useSourceTrace(): SourceTraceContextValue {
  const ctx = useContext(SourceTraceContext);
  if (!ctx) {
    throw new Error("useSourceTrace must be used within SourceTraceProvider");
  }
  return ctx;
}
