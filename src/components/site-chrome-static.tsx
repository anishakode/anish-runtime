import Link from "next/link";

/**
 * Graph-free chrome (M24).
 * The fault boundaries are client components and must not import anything that
 * reads the Evidence Graph — a failure there is exactly when the chrome still
 * has to render.
 */

export const PRIMARY_NAV = [
  { href: "/work", label: "Work" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/cv", label: "CV" },
  { href: "/contact", label: "Contact" },
] as const;

export function PrimaryNav() {
  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-4 text-sm">
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
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>Anish Akode · AI · ML · Software Engineering</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/surface" className="underline-offset-4 hover:underline">
            Under the surface
          </Link>
          <Link href="/ending" className="underline-offset-4 hover:underline">
            Ending signal
          </Link>
          <p className="instrument-label text-xs tracking-wide">
            Editorial Lab · locked through M24
          </p>
        </div>
      </div>
    </footer>
  );
}
