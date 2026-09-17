import type { Metadata } from "next";
import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { NOINDEX_ROUTES, STATIC_INDEXABLE_ROUTES } from "@/lib/seo/routes";
import { metadata as rootMetadata, viewport as rootViewport } from "@/app/layout";

/**
 * Page metadata is a contract (M24): indexable pages declare a canonical URL,
 * session-shaped pages declare noindex, and no page re-suffixes the site name
 * that the root title template already appends.
 */

/** The landing page exports no metadata of its own; it inherits the root defaults. */
async function metadataOf(load: () => Promise<unknown>): Promise<Metadata | undefined> {
  const mod = (await load()) as { metadata?: Metadata };
  return mod.metadata;
}

const PAGES: [string, () => Promise<unknown>][] = [
  ["/", () => import("@/app/page")],
  ["/work", () => import("@/app/work/page")],
  ["/experience", () => import("@/app/experience/page")],
  ["/about", () => import("@/app/about/page")],
  ["/cv", () => import("@/app/cv/page")],
  ["/contact", () => import("@/app/contact/page")],
  ["/failures", () => import("@/app/failures/page")],
  ["/labs", () => import("@/app/labs/page")],
  ["/labs/mlops", () => import("@/app/labs/mlops/page")],
  ["/labs/steward", () => import("@/app/labs/steward/page")],
  ["/labs/malware", () => import("@/app/labs/malware/page")],
  ["/ending", () => import("@/app/ending/page")],
  ["/surface", () => import("@/app/surface/page")],
  ["/fork", () => import("@/app/fork/page")],
  ["/interview", () => import("@/app/interview/page")],
];

function canonicalOf(metadata: Metadata | undefined): string | undefined {
  const canonical = metadata?.alternates?.canonical;
  return typeof canonical === "string" ? canonical : undefined;
}

describe("root metadata (M24)", () => {
  it("owns the title template so pages carry only their own name", () => {
    expect(rootMetadata.title).toEqual({
      default: "ANISH // RUNTIME",
      template: "%s · ANISH // RUNTIME",
    });
  });

  it("describes the site from the graph, not hardcoded copy", () => {
    const { profile } = getGraph();
    expect(rootMetadata.description).toContain(profile.tagline);
    expect(rootMetadata.openGraph?.title).toContain(profile.name);
    expect(rootMetadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("declares the single light colour scheme it actually ships", () => {
    expect(rootViewport.colorScheme).toBe("light");
    expect(rootViewport.themeColor).toBe("#f4f4f2");
  });

  it("stays origin-relative until NEXT_PUBLIC_SITE_URL is configured", () => {
    // M26 sets the origin at launch; until then no fabricated production URL ships.
    expect(process.env.NEXT_PUBLIC_SITE_URL ?? "").toBe("");
    expect(rootMetadata.metadataBase).toBeUndefined();
    expect(canonicalOf(rootMetadata)).toBe("/");
  });
});

describe("page metadata (M24)", () => {
  it("covers every classified route", () => {
    const covered = PAGES.map(([route]) => route).sort();
    const expected = [...STATIC_INDEXABLE_ROUTES, ...NOINDEX_ROUTES].sort();
    expect(covered).toEqual(expected);
  });

  for (const [route, load] of PAGES) {
    it(`${route} declares a title and never re-suffixes the site name`, async () => {
      const title = (await metadataOf(load))?.title;
      if (route === "/") {
        // The landing page inherits the root default title.
        expect(title === undefined || typeof title === "string").toBe(true);
      } else {
        expect(typeof title).toBe("string");
      }
      expect(String(title ?? "")).not.toContain("· ANISH // RUNTIME");
    });
  }

  for (const route of STATIC_INDEXABLE_ROUTES) {
    it(`${route} declares its own canonical URL`, async () => {
      const load = PAGES.find(([path]) => path === route)?.[1];
      expect(load).toBeDefined();
      // The landing canonical lives on the root layout.
      expect(canonicalOf(await metadataOf(load!)) ?? "/").toBe(route);
    });
  }

  for (const route of NOINDEX_ROUTES) {
    it(`${route} is marked noindex, nofollow`, async () => {
      const load = PAGES.find(([path]) => path === route)?.[1];
      const metadata = await metadataOf(load!);
      expect(metadata?.robots).toEqual({ index: false, follow: false });
    });
  }
});

describe("project detail metadata (M24)", () => {
  it("canonicalises to the project slug and titles from the graph", async () => {
    const { generateMetadata } = await import("@/app/work/[slug]/page");
    const project = getGraph().projects[0];
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: project.slug }),
    } as never);

    expect(metadata.title).toBe(project.title);
    expect(metadata.description).toBe(project.summary);
    expect(canonicalOf(metadata)).toBe(`/work/${project.slug}`);
  });

  it("claims no canonical URL for a slug that does not exist", async () => {
    const { generateMetadata } = await import("@/app/work/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "no-such-project" }),
    } as never);

    expect(metadata.title).toBe("Project");
    expect(canonicalOf(metadata)).toBeUndefined();
  });
});
