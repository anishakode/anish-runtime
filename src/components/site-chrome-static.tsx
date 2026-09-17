import Link from "next/link";

/**
 * Graph-free chrome (M24).
 * The fault boundaries are client components and must not import anything that
 * reads the Evidence Graph — a failure there is exactly when the chrome still
 * has to render.
 */

/**
 * Recruiter path plus Labs.
 *
 * Labs was added here because the three Runtime Labs are the strongest thing
 * in the portfolio and had no top-level entry at all — reachable only from
 * inside a project page, while Fork and Interview held header buttons. That
 * put the most speculative surfaces above the most evidenced ones. Those two
 * moved to the footer; the five recruiter routes are unchanged.
 */
const PRIMARY_NAV = [
  { href: "/work", label: "Work" },
  { href: "/labs", label: "Labs" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/cv", label: "CV" },
  { href: "/contact", label: "Contact" },
] as const;

export function PrimaryNav() {
  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {PRIMARY_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-[var(--muted)] underline-offset-4 hover:text-[var(--on-surface)] hover:underline"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** Header without ASK RUNTIME — used when the graph-backed search index is unavailable. */
export function MinimalHeader() {
  return (
    <header className="site-chrome border-b border-[var(--stroke)] bg-[var(--surface)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <Link href="/" className="instrument-label text-sm font-medium tracking-wide">
          ANISH // RUNTIME
        </Link>
        <PrimaryNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-chrome mt-auto border-t border-[var(--stroke)]">
      {/*
        Two columns, not three. The locked marker used to sit inside the session
        nav flex, so on wrap it landed under "Fork Anish" instead of under the
        link row as a whole — the right edge no longer matched the header.
      */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-6 text-sm text-[var(--muted)] sm:flex-row sm:items-start sm:justify-between">
        <p>Anish Akode · AI · ML · Software Engineering</p>
        <div className="flex flex-col gap-2 sm:items-end">
          <nav
            aria-label="Session surfaces"
            className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-end"
          >
            <Link href="/fork" className="underline-offset-4 hover:underline">
              Fork Anish
            </Link>
            <Link href="/interview" className="underline-offset-4 hover:underline">
              Interview my work
            </Link>
            <Link href="/surface" className="underline-offset-4 hover:underline">
              Under the surface
            </Link>
            <Link href="/ending" className="underline-offset-4 hover:underline">
              Ending signal
            </Link>
          </nav>
          <p className="instrument-label text-xs tracking-wide">
            Editorial Lab · locked through M27
          </p>
        </div>
      </div>
    </footer>
  );
}
