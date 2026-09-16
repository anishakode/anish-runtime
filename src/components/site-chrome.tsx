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
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="instrument-label text-sm font-medium tracking-wide">
          ANISH // RUNTIME
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <PrimaryNav />
          <AskRuntime documents={documents} />
          <Link
            href="/fork"
            className="ask-runtime-trigger btn-secondary text-xs no-underline"
          >
            FORK ANISH
          </Link>
          <Link
            href="/interview"
            className="ask-runtime-trigger btn-secondary text-xs no-underline"
          >
            INTERVIEW
          </Link>
        </div>
      </div>
    </header>
  );
}
