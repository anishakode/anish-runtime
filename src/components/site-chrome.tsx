import Link from "next/link";
import { AskRuntime } from "@/components/search/ask-runtime";
import { PrimaryNav, SiteFooter } from "@/components/site-chrome-static";
import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex } from "@/lib/search";

export { SiteFooter };

export function SiteHeader() {
  const documents = buildSearchIndex(getGraph());

  return (
    <header className="site-chrome border-b border-[var(--stroke)] bg-[var(--surface)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <Link href="/" className="instrument-label text-sm font-medium tracking-wide">
          ANISH // RUNTIME
        </Link>
        {/*
          Column on small screens so ASK RUNTIME is not a lonely full-width wrap
          under a cramped six-link row. Desktop stays brand | nav+ask.
        */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <PrimaryNav />
          <AskRuntime documents={documents} />
        </div>
      </div>
    </header>
  );
}
