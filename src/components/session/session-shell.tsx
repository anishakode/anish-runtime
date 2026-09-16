"use client";

import type { ReactNode } from "react";
import { RuntimeTraceProvider } from "@/components/runtime-trace/runtime-trace-context";
import { RecompileBanner } from "./recompile-banner";
import { SessionRuntimeProvider } from "./session-runtime-context";

/** App-shell session layer — in-memory only; no persistent visitor profile. */
export function SessionShell({ children }: { children: ReactNode }) {
  return (
    <RuntimeTraceProvider>
      <SessionRuntimeProvider>
        <RecompileBanner />
        {children}
      </SessionRuntimeProvider>
    </RuntimeTraceProvider>
  );
}
