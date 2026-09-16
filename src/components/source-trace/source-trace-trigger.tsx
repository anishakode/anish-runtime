"use client";

import type { ResolvedSourceTrace } from "@/lib/evidence/source-trace";
import { useSourceTrace } from "./source-trace-context";

export function SourceTraceTrigger({
  trace,
  children = "Trace source",
  className = "btn-secondary text-xs",
}: {
  trace: ResolvedSourceTrace;
  children?: React.ReactNode;
  className?: string;
}) {
  const { open } = useSourceTrace();

  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      onClick={(event) => open(trace, event.currentTarget)}
    >
      {children}
    </button>
  );
}
