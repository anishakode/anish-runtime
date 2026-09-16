"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useRuntimeTraceOptional } from "@/components/runtime-trace/runtime-trace-context";
import {
  categoryForItem,
  evaluateSessionSignal,
  itemIdForLabPath,
  itemIdForProjectSlug,
  orderCapabilitiesByCategory,
  orderProjectsByCategory,
  type SessionCategory,
  type SessionSignalResult,
  type SessionTraceEvent,
} from "@/lib/session";

type RecompileConsent = "none" | "approved" | "dismissed";

type SessionRuntimeValue = {
  events: SessionTraceEvent[];
  signal: SessionSignalResult;
  consent: RecompileConsent;
  activeCategory: SessionCategory | null;
  whyOpen: boolean;
  recordItem: (itemId: string, reason: string) => void;
  approveRecompile: () => void;
  dismissRecompile: () => void;
  resetRecompile: () => void;
  setWhyOpen: (open: boolean) => void;
  orderProjects: <T extends { slug: string }>(projects: readonly T[]) => T[];
  orderCapabilities: (capabilities: readonly string[]) => string[];
};

const SessionRuntimeContext = createContext<SessionRuntimeValue | null>(null);

function pathToItem(pathname: string): { itemId: string; reason: string } | null {
  const lab = itemIdForLabPath(pathname);
  if (lab) return { itemId: lab, reason: `Opened ${pathname}` };

  const workMatch = pathname.match(/^\/work\/([^/]+)\/?$/);
  if (workMatch) {
    const slug = workMatch[1]!;
    const itemId = itemIdForProjectSlug(slug);
    if (itemId) return { itemId, reason: `Inspected project ${slug}` };
  }

  if (pathname.startsWith("/experience")) {
    return { itemId: "route:experience", reason: "Opened Experience" };
  }
  if (pathname.startsWith("/cv")) {
    return { itemId: "route:cv", reason: "Opened CV" };
  }
  return null;
}

export function SessionRuntimeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const runtimeTrace = useRuntimeTraceOptional();
  const [events, setEvents] = useState<SessionTraceEvent[]>([]);
  const [consent, setConsent] = useState<RecompileConsent>("none");
  const [activeCategory, setActiveCategory] = useState<SessionCategory | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);

  const recordItem = useCallback((itemId: string, reason: string) => {
    const category = categoryForItem(itemId);
    if (!category) return;
    setEvents((prev) => {
      // Keep first-seen timestamp for distinctness; still append for recent reasons only if new
      if (prev.some((e) => e.itemId === itemId)) return prev;
      return [
        ...prev,
        {
          itemId,
          category,
          reason,
          at: Date.now(),
        },
      ];
    });
  }, []);

  useEffect(() => {
    const mapped = pathToItem(pathname);
    if (!mapped) return;
    startTransition(() => {
      recordItem(mapped.itemId, mapped.reason);
    });
  }, [pathname, recordItem]);

  const signal = useMemo(() => evaluateSessionSignal(events), [events]);

  const approveRecompile = useCallback(() => {
    if (!signal.detected) return;
    setConsent("approved");
    setActiveCategory(signal.leading);
    setWhyOpen(false);
    runtimeTrace?.record({
      action: "RECOMPILE_ACCEPTED",
      status: "OK",
      evidenceCount: signal.interactionCount,
      architectureStages: ["SESSION", "INTERFACE"],
      note: `Presentation reordered toward ${signal.leadingLabel}`,
    });
  }, [signal, runtimeTrace]);

  const dismissRecompile = useCallback(() => {
    setConsent("dismissed");
    setWhyOpen(false);
  }, []);

  const resetRecompile = useCallback(() => {
    setConsent("none");
    setActiveCategory(null);
    setWhyOpen(false);
  }, []);

  const orderProjects = useCallback(
    <T extends { slug: string }>(projects: readonly T[]) =>
      orderProjectsByCategory(projects, activeCategory),
    [activeCategory],
  );

  const orderCapabilities = useCallback(
    (capabilities: readonly string[]) =>
      orderCapabilitiesByCategory(capabilities, activeCategory),
    [activeCategory],
  );

  const value = useMemo<SessionRuntimeValue>(
    () => ({
      events,
      signal,
      consent,
      activeCategory,
      whyOpen,
      recordItem,
      approveRecompile,
      dismissRecompile,
      resetRecompile,
      setWhyOpen,
      orderProjects,
      orderCapabilities,
    }),
    [
      events,
      signal,
      consent,
      activeCategory,
      whyOpen,
      recordItem,
      approveRecompile,
      dismissRecompile,
      resetRecompile,
      orderProjects,
      orderCapabilities,
    ],
  );

  return (
    <SessionRuntimeContext.Provider value={value}>
      {children}
    </SessionRuntimeContext.Provider>
  );
}

export function useSessionRuntime(): SessionRuntimeValue {
  const ctx = useContext(SessionRuntimeContext);
  if (!ctx) {
    throw new Error("useSessionRuntime must be used within SessionRuntimeProvider");
  }
  return ctx;
}

/** Optional hook for components that may render outside the provider (tests). */
export function useSessionRuntimeOptional(): SessionRuntimeValue | null {
  return useContext(SessionRuntimeContext);
}
