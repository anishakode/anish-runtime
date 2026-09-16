"use client";

import { RuntimeFault } from "@/components/runtime-fault";

export default function LabsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RuntimeFault
      subsystem="This Runtime Lab"
      fallback="Labs are optional simulations. The project evidence they illustrate is still readable in Work, with its sources and evidence states intact."
      digest={error.digest}
      onRetry={reset}
    />
  );
}
