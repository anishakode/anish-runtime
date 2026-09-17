/**
 * Indexing policy (M24).
 *
 * Session-shaped surfaces describe a visitor's own activity, not Anish's evidence.
 * Handoff §43 is explicit that they must not become SEO landing pages, so they are
 * excluded from the sitemap and served `noindex` — reachable, linkable, not indexed.
 */

export const NOINDEX_ROUTES = ["/ending", "/surface", "/fork", "/interview"] as const;

export const STATIC_INDEXABLE_ROUTES = [
  "/",
  "/work",
  "/experience",
  "/about",
  "/cv",
  "/contact",
  "/failures",
  "/labs",
  "/labs/mlops",
  "/labs/steward",
  "/labs/malware",
] as const;

export const ROUTE_PRIORITY: Record<string, number> = {
  "/": 1,
  "/work": 0.9,
  "/labs": 0.9,
  "/cv": 0.8,
  "/experience": 0.8,
  "/about": 0.7,
  "/contact": 0.7,
};

/** Empty until a canonical origin is configured — never a fabricated production URL. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

/** Spread into a session-shaped page's `metadata` alongside the `X-Robots-Tag` header. */
export const NOINDEX_METADATA = {
  robots: { index: false, follow: false },
} as const;

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  return base === "" ? path : `${base}${path}`;
}
