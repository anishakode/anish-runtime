"use client";

import { RuntimeFault } from "@/components/runtime-fault";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RuntimeFault
      subsystem="This surface"
      fallback="The rest of the portfolio is unaffected. Work, Experience, About, CV, and Contact all read straight from the Evidence Graph and need nothing that just failed."
      digest={error.digest}
      onRetry={reset}
    />
  );
}
