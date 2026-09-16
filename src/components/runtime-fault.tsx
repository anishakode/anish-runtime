"use client";

import Link from "next/link";
import { MinimalHeader, SiteFooter } from "@/components/site-chrome-static";

export type RuntimeFaultProps = {
  /** What stopped working, in the visitor's terms — never a stack trace. */
  subsystem: string;
  /** What still works without it. */
  fallback: string;
  digest?: string;
  onRetry?: () => void;
};

/**
 * Shared failure surface (M24).
 * An optional subsystem failing must never remove the recruiter path, so the
 * chrome stays mounted and the identity routes stay reachable.
 */
export function RuntimeFault({
  subsystem,
  fallback,
  digest,
  onRetry,
}: RuntimeFaultProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--surface)] text-[var(--on-surface)]">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <MinimalHeader />
      <main
        id="main"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-4 px-6 py-16"
      >
        <p className="eyebrow">RUNTIME FAULT</p>
        <h1 className="page-title">{subsystem} stopped responding</h1>
        <p className="page-lede">{fallback}</p>
        <p className="text-sm text-[var(--muted)]">
          Nothing was lost — this session was never stored anywhere.
        </p>
        <div className="flex flex-wrap gap-3">
          {onRetry ? (
            <button type="button" className="btn-primary" onClick={onRetry}>
              TRY AGAIN
            </button>
          ) : null}
          <Link href="/work" className="btn-secondary no-underline">
            Browse work
          </Link>
          <Link href="/cv" className="btn-secondary no-underline">
            Read the CV
          </Link>
        </div>
        {digest ? (
          <p className="font-mono text-xs text-[var(--muted)]">fault digest: {digest}</p>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
