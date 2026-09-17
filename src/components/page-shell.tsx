import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--surface)] text-[var(--on-surface)]">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {/*
          One measure for title + lede. `.page-lede` caps at 40rem while the
          header was max-w-3xl (48rem), so a long title ran past its description
          — the same ragged right edge the idle hero had.
        */}
        <header className="mb-10 max-w-3xl space-y-3">
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-lede max-w-none">{description}</p> : null}
        </header>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
