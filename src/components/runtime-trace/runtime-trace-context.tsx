"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  appendTraceEntry,
  createTraceEntry,
  type RuntimeTraceEntry,
  type RuntimeTraceInput,
} from "@/lib/runtime-trace";

export type RuntimeTraceValue = {
  entries: RuntimeTraceEntry[];
  /** Rejected inputs are counted, not silently dropped. */
  rejectedCount: number;
  record: (input: RuntimeTraceInput) => void;
  clear: () => void;
};

const RuntimeTraceContext = createContext<RuntimeTraceValue | null>(null);

/** Bounded, in-memory only. Nothing here survives a tab close. */
export function RuntimeTraceProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<RuntimeTraceEntry[]>([]);
  const [rejectedCount, setRejectedCount] = useState(0);
  const seq = useRef(0);

  const record = useCallback((input: RuntimeTraceInput) => {
    seq.current += 1;
    const result = createTraceEntry(input, seq.current);
    if (!result.ok) {
      setRejectedCount((prev) => prev + 1);
      return;
    }
    setEntries((prev) => appendTraceEntry(prev, result.entry));
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    setRejectedCount(0);
  }, []);

  const value = useMemo<RuntimeTraceValue>(
    () => ({ entries, rejectedCount, record, clear }),
    [entries, rejectedCount, record, clear],
  );

  return (
    <RuntimeTraceContext.Provider value={value}>{children}</RuntimeTraceContext.Provider>
  );
}

export function useRuntimeTrace(): RuntimeTraceValue {
  const ctx = useContext(RuntimeTraceContext);
  if (!ctx) throw new Error("useRuntimeTrace must be used within RuntimeTraceProvider");
  return ctx;
}

/** Optional hook for components that may render outside the provider (tests). */
export function useRuntimeTraceOptional(): RuntimeTraceValue | null {
  return useContext(RuntimeTraceContext);
}
